package services

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

type streamDelta struct {
	Content string `json:"content"`
}

type streamChoice struct {
	Delta        streamDelta `json:"delta"`
	FinishReason *string     `json:"finish_reason"`
}

type streamChunk struct {
	Choices []streamChoice `json:"choices"`
}

// TokenCallback is called for each token received from the SSE stream.
type TokenCallback func(token string)

// GenerateContentStream calls OpenRouter with streaming enabled and invokes
// the callback for each token as it arrives.
func GenerateContentStream(topic, keywords, tone, contentType string, onToken TokenCallback) (string, error) {
	prompt := fmt.Sprintf(`You are a professional content writer. Create a %s about "%s".
Keywords to include: %s
Tone: %s
Requirements:
- SEO-optimized with natural keyword placement
- Well-structured with headings and sections
- Engaging and informative
- Appropriate length for a %s
Write the content now:`, contentType, topic, keywords, tone, contentType)

	reqBody := chatRequest{
		Model:    "deepseek/deepseek-chat-v3-0324",
		Messages: []chatMessage{{Role: "user", Content: prompt}},
		Stream:   true,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", openRouterURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	apiKey := os.Getenv("OPENROUTER_API_KEY")
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("API request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
	}

	var fullContent strings.Builder
	scanner := bufio.NewScanner(resp.Body)

	for scanner.Scan() {
		line := scanner.Text()
		if !strings.HasPrefix(line, "data: ") {
			continue
		}

		data := strings.TrimPrefix(line, "data: ")
		if data == "[DONE]" {
			break
		}

		var chunk streamChunk
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			continue
		}

		if len(chunk.Choices) > 0 {
			token := chunk.Choices[0].Delta.Content
			if token != "" {
				fullContent.WriteString(token)
				if onToken != nil {
					onToken(token)
				}
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return fullContent.String(), fmt.Errorf("stream read error: %w", err)
	}

	return fullContent.String(), nil
}
