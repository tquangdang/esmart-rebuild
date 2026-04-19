package agents

import (
	"context"
	"fmt"
	"strings"

	"esmart-go/services"
)

// RunEditor rewrites the draft to address the SEO report's issues. It is
// resilient: on API failure it returns the original draft and emits a warning
// rather than failing the whole pipeline.
func RunEditor(ctx context.Context, draft string, report *SEOReport, emit func(AgentEvent)) (string, error) {
	if report == nil || len(report.Issues) == 0 {
		emit(AgentEvent{Step: StepEditor, Status: StatusSkipped, Message: "no SEO issues to fix"})
		return draft, nil
	}

	emit(AgentEvent{
		Step:    StepEditor,
		Status:  StatusStarted,
		Message: fmt.Sprintf("polishing draft (%d issues to address)", len(report.Issues)),
	})

	var issuesText strings.Builder
	for i, iss := range report.Issues {
		fmt.Fprintf(&issuesText, "%d. [%s] %s\n", i+1, iss.Severity, iss.Suggestion)
	}

	prompt := fmt.Sprintf(`Improve the following Markdown content to address the listed SEO and readability issues.

Rules:
- Preserve the original voice and core information.
- Output ONLY the improved Markdown article body.
- Do NOT wrap the output in ` + "```" + ` code fences.
- Do NOT add a trailing summary block such as "Word count:", "Keywords:", "Tone:", "Notes:", "SEO:", "Meta:". The very last line must be the conclusion of the article itself.
- Keep all H2 headings; you may rename or add subheadings.
- Naturally fix every listed issue.

Issues to address:
%s
Current draft:
---
%s
---`, issuesText.String(), draft)

	improved, err := services.DefaultClient().Chat(ctx, EditorModelName(), []services.Message{
		{Role: "system", Content: "You are a senior content editor. You rewrite content to be clearer, more engaging, and SEO-optimized while preserving meaning."},
		{Role: "user", Content: prompt},
	}, services.ChatOptions{Temperature: 0.5, MaxTokens: 4096})

	if err != nil {
		emit(AgentEvent{
			Step:    StepEditor,
			Status:  StatusError,
			Message: fmt.Sprintf("editor failed, publishing draft as-is: %v", err),
		})
		return draft, nil
	}

	emit(AgentEvent{
		Step:    StepEditor,
		Status:  StatusCompleted,
		Message: fmt.Sprintf("polished (%d → %d chars)", len(draft), len(improved)),
	})
	return improved, nil
}
