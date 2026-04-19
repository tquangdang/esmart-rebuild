package agents

// Step identifiers used across events, retry counters, and frontend rendering.
const (
	StepResearch = "research"
	StepWriter   = "writer"
	StepSEO      = "seo"
	StepEditor   = "editor"
	StepMeta     = "meta"
)

// Status values an agent can report.
const (
	StatusStarted   = "started"
	StatusProgress  = "progress"
	StatusCompleted = "completed"
	StatusSkipped   = "skipped"
	StatusError     = "error"
	StatusCacheHit  = "cache_hit"
)

// PipelineInput is the user-supplied request for a content generation job.
type PipelineInput struct {
	JobID       string   `json:"jobId"`
	ProjectID   string   `json:"projectId"`
	Topic       string   `json:"topic"`
	Keywords    []string `json:"keywords"`
	Tone        string   `json:"tone"`
	ContentType string   `json:"contentType"`
}

// ResearchBrief is what the research agent produces and the writer consumes.
type ResearchBrief struct {
	TrendingKeywords []string `json:"trendingKeywords"`
	Outline          []string `json:"outline"`
	Angle            string   `json:"angle"`
	CompetitorNotes  string   `json:"competitorNotes"`
}

// SEOIssue is one actionable suggestion produced by the local SEO agent.
type SEOIssue struct {
	Severity   string `json:"severity"` // "low" | "medium" | "high"
	Suggestion string `json:"suggestion"`
}

// SEOReport is the structured score the editor agent acts on.
type SEOReport struct {
	Score       int        `json:"score"`
	WordCount   int        `json:"wordCount"`
	HeadingCount int       `json:"headingCount"`
	KeywordHits map[string]int `json:"keywordHits"`
	Issues      []SEOIssue `json:"issues"`
}

// MetaPackage is the final SEO/social metadata for the generated piece.
type MetaPackage struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Social      string `json:"social"`
}

// PipelineState is the in-flight working state. The orchestrator mutates this
// as agents complete; it is also serialized into the final output payload.
type PipelineState struct {
	Input      PipelineInput      `json:"input"`
	Research   *ResearchBrief     `json:"research,omitempty"`
	Draft      string             `json:"draft,omitempty"`
	SEOReport  *SEOReport         `json:"seoReport,omitempty"`
	Final      string             `json:"final,omitempty"`
	Meta       *MetaPackage       `json:"meta,omitempty"`
	StepCounts map[string]int     `json:"stepCounts,omitempty"`
}

// AgentEvent is what flows over the event channel into the WebSocket.
type AgentEvent struct {
	Step    string `json:"step"`
	Status  string `json:"status"`
	Message string `json:"message,omitempty"`
	// Token is set on writer streaming progress events.
	Token string `json:"token,omitempty"`
	// Data is step-specific payload (research brief, seo report, meta).
	Data any `json:"data,omitempty"`
}
