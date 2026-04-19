package agents

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"esmart-go/cache"
	"esmart-go/services"
)

const researchSystemPrompt = `You are a content research agent. Your job is to analyze a topic and produce a structured research brief that a writer can use to draft high-quality, SEO-optimized content.

You MUST respond with a single JSON object matching exactly this schema, and NOTHING else (no prose, no markdown fences):
{
  "trendingKeywords": [string, ...],   // 5-10 keywords related to the topic and trending in current discourse
  "outline": [string, ...],             // 4-8 section headings the writer should cover, in order
  "angle": string,                      // one sentence describing the unique angle or hook
  "competitorNotes": string             // 1-3 sentences on what existing content gets right or misses
}`

// RunResearch executes the research agent. It consults the cache first; on miss
// it calls Gemini through OpenRouter and stores the result for future reuse.
func RunResearch(ctx context.Context, input PipelineInput, emit func(AgentEvent)) (*ResearchBrief, bool, error) {
	cacheKey := cache.HashKey(
		"research",
		strings.ToLower(input.Topic),
		strings.ToLower(input.ContentType),
		strings.Join(input.Keywords, ","),
	)

	c := cache.Default()
	var cached ResearchBrief
	if hit, err := c.GetJSON(ctx, cacheKey, &cached); err == nil && hit {
		emit(AgentEvent{Step: StepResearch, Status: StatusCacheHit, Message: "reused cached research"})
		emit(AgentEvent{Step: StepResearch, Status: StatusCompleted, Data: cached})
		return &cached, true, nil
	}

	emit(AgentEvent{Step: StepResearch, Status: StatusStarted, Message: "analyzing topic with Gemini"})

	user := fmt.Sprintf(
		"Topic: %s\nContent type: %s\nUser-supplied keywords: %s\nTone: %s\n\nProduce the research brief.",
		input.Topic, input.ContentType, strings.Join(input.Keywords, ", "), input.Tone,
	)

	raw, err := services.DefaultClient().Chat(ctx, ResearchModelName(), []services.Message{
		{Role: "system", Content: researchSystemPrompt},
		{Role: "user", Content: user},
	}, services.ChatOptions{Temperature: 0.4, MaxTokens: 800})
	if err != nil {
		return nil, false, fmt.Errorf("research agent: %w", err)
	}

	brief, err := parseResearchBrief(raw)
	if err != nil {
		return nil, false, fmt.Errorf("research agent: %w", err)
	}

	_ = c.SetJSON(ctx, cacheKey, brief, time.Hour)

	emit(AgentEvent{
		Step:    StepResearch,
		Status:  StatusCompleted,
		Message: fmt.Sprintf("found %d trending keywords, %d outline sections", len(brief.TrendingKeywords), len(brief.Outline)),
		Data:    brief,
	})
	return brief, false, nil
}

// parseResearchBrief tolerates models that wrap the JSON in code fences.
func parseResearchBrief(raw string) (*ResearchBrief, error) {
	cleaned := strings.TrimSpace(raw)
	if strings.HasPrefix(cleaned, "```") {
		cleaned = strings.TrimPrefix(cleaned, "```json")
		cleaned = strings.TrimPrefix(cleaned, "```")
		cleaned = strings.TrimSuffix(cleaned, "```")
		cleaned = strings.TrimSpace(cleaned)
	}
	start := strings.Index(cleaned, "{")
	end := strings.LastIndex(cleaned, "}")
	if start == -1 || end == -1 || end <= start {
		return nil, fmt.Errorf("no JSON object in response: %q", truncate(raw, 200))
	}
	cleaned = cleaned[start : end+1]

	var brief ResearchBrief
	if err := json.Unmarshal([]byte(cleaned), &brief); err != nil {
		return nil, fmt.Errorf("decode brief: %w", err)
	}
	return &brief, nil
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}
