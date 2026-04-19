package agents

import (
	"fmt"
	"regexp"
	"strings"
)

// RunSEO performs purely-local content analysis. No API call, runs in microseconds.
// The score blends keyword density, structure, length and readability signals.
func RunSEO(content string, keywords []string, contentType string, emit func(AgentEvent)) *SEOReport {
	emit(AgentEvent{Step: StepSEO, Status: StatusStarted, Message: "scoring draft"})

	report := analyzeSEO(content, keywords, contentType)

	emit(AgentEvent{
		Step:    StepSEO,
		Status:  StatusCompleted,
		Message: fmt.Sprintf("score %d/100", report.Score),
		Data:    report,
	})
	return report
}

var (
	wordRe     = regexp.MustCompile(`\b[\p{L}\p{N}']+\b`)
	headingRe  = regexp.MustCompile(`(?m)^#{1,6}\s+.+$`)
	sentenceRe = regexp.MustCompile(`[^.!?]+[.!?]+`)
	linkRe     = regexp.MustCompile(`\[[^\]]+\]\([^\)]+\)`)
)

func analyzeSEO(content string, keywords []string, contentType string) *SEOReport {
	words := wordRe.FindAllString(content, -1)
	wordCount := len(words)
	headingCount := len(headingRe.FindAllString(content, -1))
	sentences := sentenceRe.FindAllString(content, -1)
	linkCount := len(linkRe.FindAllString(content, -1))

	keywordHits := make(map[string]int, len(keywords))
	lowerContent := strings.ToLower(content)
	for _, kw := range keywords {
		kw = strings.TrimSpace(strings.ToLower(kw))
		if kw == "" {
			continue
		}
		keywordHits[kw] = strings.Count(lowerContent, kw)
	}

	report := &SEOReport{
		WordCount:    wordCount,
		HeadingCount: headingCount,
		KeywordHits:  keywordHits,
	}

	keywordScore := scoreKeywordDensity(keywordHits, wordCount, &report.Issues)
	structureScore := scoreStructure(headingCount, wordCount, &report.Issues)
	lengthScore := scoreLength(wordCount, contentType, &report.Issues)
	readabilityScore := scoreReadability(words, sentences, &report.Issues)
	linkScore := scoreLinks(linkCount, wordCount, &report.Issues)

	final := int(0.30*float64(keywordScore) +
		0.20*float64(structureScore) +
		0.20*float64(lengthScore) +
		0.20*float64(readabilityScore) +
		0.10*float64(linkScore))

	if final > 100 {
		final = 100
	}
	if final < 0 {
		final = 0
	}
	report.Score = final
	return report
}

func scoreKeywordDensity(hits map[string]int, wordCount int, issues *[]SEOIssue) int {
	if wordCount == 0 || len(hits) == 0 {
		return 50
	}
	missing := 0
	overstuffed := 0
	for kw, count := range hits {
		if count == 0 {
			missing++
			*issues = append(*issues, SEOIssue{
				Severity:   "high",
				Suggestion: fmt.Sprintf("Keyword %q does not appear in the content. Weave it into a heading or opening paragraph.", kw),
			})
			continue
		}
		density := float64(count) / float64(wordCount) * 100
		if density > 3.5 {
			overstuffed++
			*issues = append(*issues, SEOIssue{
				Severity:   "medium",
				Suggestion: fmt.Sprintf("Keyword %q appears too often (%.1f%% density). Reduce to 1-2%% to avoid stuffing.", kw, density),
			})
		}
	}
	score := 100 - missing*25 - overstuffed*10
	if score < 0 {
		score = 0
	}
	return score
}

func scoreStructure(headingCount, wordCount int, issues *[]SEOIssue) int {
	if wordCount == 0 {
		return 0
	}
	if headingCount == 0 {
		*issues = append(*issues, SEOIssue{
			Severity:   "high",
			Suggestion: "No headings found. Add H2 (##) headings to break content into scannable sections.",
		})
		return 30
	}
	wordsPerHeading := wordCount / headingCount
	if wordsPerHeading > 350 {
		*issues = append(*issues, SEOIssue{
			Severity:   "medium",
			Suggestion: fmt.Sprintf("Sections are long (~%d words per heading). Add subheadings every 200-300 words.", wordsPerHeading),
		})
		return 70
	}
	return 100
}

func scoreLength(wordCount int, contentType string, issues *[]SEOIssue) int {
	min, target := 600, 1200
	switch strings.ToLower(contentType) {
	case "blog", "blog-post", "article":
		min, target = 800, 1500
	case "social", "social-post", "tweet":
		min, target = 50, 200
	case "email", "newsletter":
		min, target = 200, 500
	case "ad", "ad-copy":
		min, target = 30, 150
	}

	if wordCount < min {
		*issues = append(*issues, SEOIssue{
			Severity:   "high",
			Suggestion: fmt.Sprintf("Too short (%d words, target %d+). Expand with examples or supporting detail.", wordCount, min),
		})
		return 40
	}
	if wordCount > target*3 {
		*issues = append(*issues, SEOIssue{
			Severity:   "low",
			Suggestion: fmt.Sprintf("Quite long (%d words). Consider trimming to ~%d words.", wordCount, target),
		})
		return 75
	}
	return 100
}

func scoreReadability(words, sentences []string, issues *[]SEOIssue) int {
	if len(sentences) == 0 || len(words) == 0 {
		return 50
	}
	avgSentenceLen := float64(len(words)) / float64(len(sentences))
	if avgSentenceLen > 25 {
		*issues = append(*issues, SEOIssue{
			Severity:   "medium",
			Suggestion: fmt.Sprintf("Long sentences (avg %.0f words). Break up sentences for easier reading.", avgSentenceLen),
		})
		return 60
	}
	if avgSentenceLen < 8 {
		return 80
	}
	return 100
}

func scoreLinks(linkCount, wordCount int, issues *[]SEOIssue) int {
	if wordCount < 400 {
		return 100
	}
	if linkCount == 0 {
		*issues = append(*issues, SEOIssue{
			Severity:   "low",
			Suggestion: "No links found. Add 1-3 links to authoritative sources to boost SEO.",
		})
		return 60
	}
	return 100
}
