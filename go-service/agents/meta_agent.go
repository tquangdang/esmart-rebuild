package agents

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"esmart-go/services"
)

const metaSystemPrompt = `You are an SEO metadata writer. Given a piece of content, produce a meta package.

Respond with ONLY a single JSON object, no prose, no fences:
{
  "title": string,        // 50-60 chars, includes primary keyword
  "description": string,  // 140-160 chars, compelling summary
  "social": string        // 200-280 chars, casual tone for X/LinkedIn share
}`

// RunMeta produces title, description and social copy for the final content.
func RunMeta(ctx context.Context, input PipelineInput, content string, emit func(AgentEvent)) (*MetaPackage, error) {
	emit(AgentEvent{Step: StepMeta, Status: StatusStarted, Message: "generating metadata"})

	user := fmt.Sprintf(
		"Topic: %s\nKeywords: %s\n\nContent:\n%s",
		input.Topic, strings.Join(input.Keywords, ", "), truncate(content, 4000),
	)

	raw, err := services.DefaultClient().Chat(ctx, MetaModelName(), []services.Message{
		{Role: "system", Content: metaSystemPrompt},
		{Role: "user", Content: user},
	}, services.ChatOptions{Temperature: 0.5, MaxTokens: 400})
	if err != nil {
		return nil, fmt.Errorf("meta agent: %w", err)
	}

	meta, err := parseMeta(raw)
	if err != nil {
		return nil, fmt.Errorf("meta agent: %w", err)
	}

	emit(AgentEvent{
		Step:    StepMeta,
		Status:  StatusCompleted,
		Message: "metadata ready",
		Data:    meta,
	})
	return meta, nil
}

func parseMeta(raw string) (*MetaPackage, error) {
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
		return nil, fmt.Errorf("no JSON in response: %q", truncate(raw, 200))
	}
	var meta MetaPackage
	if err := json.Unmarshal([]byte(cleaned[start:end+1]), &meta); err != nil {
		return nil, fmt.Errorf("decode meta: %w", err)
	}
	return &meta, nil
}
