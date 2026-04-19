package agents

import "os"

// Model slugs are resolved at call time so they can be overridden via env vars
// without recompiling. This is important because OpenRouter occasionally
// retires slugs (e.g. google/gemini-flash-1.5 was removed in early 2026).
//
// Override via:
//   RESEARCH_MODEL=google/gemini-2.5-flash
//   WRITER_MODEL=deepseek/deepseek-chat-v3-0324
//   EDITOR_MODEL=anthropic/claude-sonnet-4.6   (premium, requires OpenRouter credit)
//   META_MODEL=deepseek/deepseek-chat-v3-0324
//
// Defaults are picked to work on the OpenRouter free/low-credit tier.

func envOr(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func ResearchModelName() string {
	return envOr("RESEARCH_MODEL", "google/gemini-2.0-flash-001")
}

func WriterModelName() string {
	return envOr("WRITER_MODEL", "deepseek/deepseek-chat-v3-0324")
}

func EditorModelName() string {
	return envOr("EDITOR_MODEL", "deepseek/deepseek-chat-v3-0324")
}

func MetaModelName() string {
	return envOr("META_MODEL", "deepseek/deepseek-chat-v3-0324")
}
