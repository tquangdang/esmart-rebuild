package agents

import (
	"context"
	"fmt"
	"strings"

	"esmart-go/services"
)

// RunWriter streams a content draft using the research brief as guidance.
// Each token is forwarded as a StatusProgress event for the frontend to show
// real-time generation, similar to the previous single-call experience.
func RunWriter(ctx context.Context, input PipelineInput, brief *ResearchBrief, retryFeedback string, emit func(AgentEvent)) (string, error) {
	emit(AgentEvent{Step: StepWriter, Status: StatusStarted, Message: "drafting content with DeepSeek"})

	prompt := buildWriterPrompt(input, brief, retryFeedback)

	draft, err := services.DefaultClient().ChatStream(ctx, WriterModelName(), []services.Message{
		{Role: "system", Content: "You are a professional content writer. Write engaging, well-structured Markdown."},
		{Role: "user", Content: prompt},
	}, services.ChatOptions{Temperature: 0.7}, func(token string) {
		emit(AgentEvent{Step: StepWriter, Status: StatusProgress, Token: token})
	})

	if err != nil {
		return "", fmt.Errorf("writer agent: %w", err)
	}

	emit(AgentEvent{
		Step:    StepWriter,
		Status:  StatusCompleted,
		Message: fmt.Sprintf("draft complete (%d chars)", len(draft)),
	})
	return draft, nil
}

func buildWriterPrompt(input PipelineInput, brief *ResearchBrief, retryFeedback string) string {
	var b strings.Builder

	fmt.Fprintf(&b, "Write a %s about \"%s\".\n", input.ContentType, input.Topic)
	if input.Tone != "" {
		fmt.Fprintf(&b, "Tone: %s.\n", input.Tone)
	}
	if len(input.Keywords) > 0 {
		fmt.Fprintf(&b, "Required keywords (use naturally): %s.\n", strings.Join(input.Keywords, ", "))
	}

	if brief != nil {
		b.WriteString("\nResearch brief from the research agent:\n")
		if brief.Angle != "" {
			fmt.Fprintf(&b, "- Angle: %s\n", brief.Angle)
		}
		if len(brief.TrendingKeywords) > 0 {
			fmt.Fprintf(&b, "- Trending keywords to weave in: %s\n", strings.Join(brief.TrendingKeywords, ", "))
		}
		if len(brief.Outline) > 0 {
			b.WriteString("- Suggested outline:\n")
			for i, h := range brief.Outline {
				fmt.Fprintf(&b, "  %d. %s\n", i+1, h)
			}
		}
		if brief.CompetitorNotes != "" {
			fmt.Fprintf(&b, "- Competitor notes: %s\n", brief.CompetitorNotes)
		}
	}

	if retryFeedback != "" {
		fmt.Fprintf(&b, "\nIMPORTANT: A previous draft scored poorly. Address these issues:\n%s\n", retryFeedback)
	}

	b.WriteString("\nRequirements:\n")
	b.WriteString("- Output Markdown with H2 (##) section headings.\n")
	b.WriteString("- 800-1500 words for blog posts, 300-600 for shorter formats.\n")
	b.WriteString("- Natural keyword placement, not stuffing.\n")
	b.WriteString("- Engaging intro, scannable sections, clear conclusion.\n")
	b.WriteString("\nSTRICT OUTPUT RULES (failure to follow these makes the output unusable):\n")
	b.WriteString("- Output ONLY the article body. No preamble, no commentary.\n")
	b.WriteString("- Do NOT wrap the output in ``` code fences.\n")
	b.WriteString("- Do NOT add a trailing summary block such as \"Word count:\", \"Keywords:\", \"Tone:\", \"Notes:\", \"SEO:\", \"Meta:\".\n")
	b.WriteString("- The very last line of your response must be the conclusion of the article itself.\n")
	b.WriteString("\nWrite the content now.")

	return b.String()
}
