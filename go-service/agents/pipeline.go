package agents

import (
	"context"
	"fmt"
	"strings"
)

// Decision thresholds for autonomous branching. Tuned conservatively; tweak via
// experimentation. Exposed as exported vars so tests/admin tooling can override.
var (
	SkipEditorScore     = 85 // SEO score >= this and editor is skipped
	RetryWriterScore    = 40 // SEO score < this triggers a writer retry (once)
	MaxWriterRetries    = 1
)

// Pipeline runs the full agent sequence end-to-end with branching decisions:
//   - Research cache hit → skip research call
//   - SEO score >= SkipEditorScore → skip editor
//   - SEO score < RetryWriterScore (first attempt) → loop back to writer
//     with explicit feedback, max 1 retry
//   - Editor failure → publish draft + warning, do not fail the job
func Pipeline(ctx context.Context, input PipelineInput, emit func(AgentEvent)) (*PipelineState, error) {
	state := &PipelineState{
		Input:      input,
		StepCounts: map[string]int{},
	}

	// 1. Research
	brief, _, err := RunResearch(ctx, input, emit)
	if err != nil {
		emit(AgentEvent{Step: StepResearch, Status: StatusError, Message: err.Error()})
		return state, fmt.Errorf("research: %w", err)
	}
	state.Research = brief

	if err := ctx.Err(); err != nil {
		return state, err
	}

	// 2. Writer (with possible retry loop)
	var draft string
	var report *SEOReport
	for {
		state.StepCounts[StepWriter]++
		retryFeedback := ""
		if state.StepCounts[StepWriter] > 1 && report != nil {
			retryFeedback = formatIssuesForRetry(report.Issues)
		}

		draft, err = RunWriter(ctx, input, brief, retryFeedback, emit)
		if err != nil {
			emit(AgentEvent{Step: StepWriter, Status: StatusError, Message: err.Error()})
			return state, fmt.Errorf("writer: %w", err)
		}
		draft = stripCodeFences(draft)
		state.Draft = draft

		if err := ctx.Err(); err != nil {
			return state, err
		}

		// 3. SEO (local, fast)
		report = RunSEO(draft, input.Keywords, input.ContentType, emit)
		state.SEOReport = report

		// Decision: low score and we haven't retried → loop back to writer.
		if report.Score < RetryWriterScore && state.StepCounts[StepWriter] <= MaxWriterRetries {
			emit(AgentEvent{
				Step:    StepWriter,
				Status:  StatusStarted,
				Message: fmt.Sprintf("score %d below %d, regenerating with feedback", report.Score, RetryWriterScore),
			})
			continue
		}
		break
	}

	if err := ctx.Err(); err != nil {
		return state, err
	}

	// 4. Editor (with skip decision)
	if report.Score >= SkipEditorScore {
		emit(AgentEvent{
			Step:    StepEditor,
			Status:  StatusSkipped,
			Message: fmt.Sprintf("SEO score %d ≥ %d, skipping editor", report.Score, SkipEditorScore),
		})
		state.Final = draft
	} else {
		final, err := RunEditor(ctx, draft, report, emit)
		if err != nil {
			emit(AgentEvent{Step: StepEditor, Status: StatusError, Message: err.Error()})
			state.Final = draft
		} else {
			state.Final = stripCodeFences(final)
		}
	}

	if err := ctx.Err(); err != nil {
		return state, err
	}

	// 5. Meta
	meta, err := RunMeta(ctx, input, state.Final, emit)
	if err != nil {
		emit(AgentEvent{Step: StepMeta, Status: StatusError, Message: err.Error()})
		// Meta failure is not fatal — fall back to a derived title.
		meta = &MetaPackage{
			Title:       input.Topic,
			Description: truncate(stripMarkdown(state.Final), 155),
		}
	}
	state.Meta = meta

	return state, nil
}

func formatIssuesForRetry(issues []SEOIssue) string {
	var b strings.Builder
	for _, iss := range issues {
		fmt.Fprintf(&b, "- [%s] %s\n", iss.Severity, iss.Suggestion)
	}
	return b.String()
}

func stripMarkdown(s string) string {
	r := strings.NewReplacer("#", "", "*", "", "_", "", "`", "", ">", "")
	return strings.TrimSpace(r.Replace(s))
}

// stripCodeFences removes a wrapping ```...``` block (with optional language
// tag like ```markdown) that some models add despite being told not to. If the
// content isn't wrapped, it is returned unchanged.
func stripCodeFences(s string) string {
	trimmed := strings.TrimSpace(s)
	if !strings.HasPrefix(trimmed, "```") {
		return s
	}
	lines := strings.Split(trimmed, "\n")
	if len(lines) < 2 {
		return s
	}
	// Drop opening ``` (and optional language tag on the same line)
	lines = lines[1:]
	// Drop trailing ``` if present
	for len(lines) > 0 {
		last := strings.TrimSpace(lines[len(lines)-1])
		if last == "```" || last == "" {
			lines = lines[:len(lines)-1]
			if last == "```" {
				break
			}
			continue
		}
		break
	}
	return strings.TrimSpace(strings.Join(lines, "\n"))
}
