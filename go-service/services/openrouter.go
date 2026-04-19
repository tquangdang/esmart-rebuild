package services

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

const openRouterURL = "https://openrouter.ai/api/v1/chat/completions"

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatOptions struct {
	Temperature float64 `json:"temperature,omitempty"`
	MaxTokens   int     `json:"max_tokens,omitempty"`
}

type chatRequest struct {
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	Stream      bool      `json:"stream,omitempty"`
	Temperature float64   `json:"temperature,omitempty"`
	MaxTokens   int       `json:"max_tokens,omitempty"`
}

type chatChoice struct {
	Message Message `json:"message"`
}

type chatResponse struct {
	Choices []chatChoice `json:"choices"`
	Error   *struct {
		Message string `json:"message"`
		Code    int    `json:"code"`
	} `json:"error,omitempty"`
}

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

// Client is a thin wrapper around the OpenRouter chat completions endpoint.
// Models like google/gemini-flash-1.5, deepseek/deepseek-chat-v3-0324 and
// anthropic/claude-3.5-sonnet are all reachable through one shared API key.
type Client struct {
	apiKey     string
	httpClient *http.Client
	maxRetries int
}

var defaultClient = NewClient()

func NewClient() *Client {
	return &Client{
		apiKey: os.Getenv("OPENROUTER_API_KEY"),
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
		maxRetries: 2,
	}
}

// DefaultClient returns a process-wide shared client.
func DefaultClient() *Client { return defaultClient }

// resolveAPIKey returns the freshest available API key. It prefers the
// environment variable so that .env files loaded inside main() take effect
// even though defaultClient is constructed at package init time.
func (c *Client) resolveAPIKey() string {
	if k := os.Getenv("OPENROUTER_API_KEY"); k != "" {
		return k
	}
	return c.apiKey
}

// Chat performs a non-streaming chat completion against the given model.
// Retries once on HTTP 429 with a short backoff.
func (c *Client) Chat(ctx context.Context, model string, messages []Message, opts ChatOptions) (string, error) {
	body := chatRequest{
		Model:       model,
		Messages:    messages,
		Temperature: opts.Temperature,
		MaxTokens:   opts.MaxTokens,
	}

	payload, err := json.Marshal(body)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	var lastErr error
	for attempt := 0; attempt <= c.maxRetries; attempt++ {
		if attempt > 0 {
			select {
			case <-ctx.Done():
				return "", ctx.Err()
			case <-time.After(time.Duration(attempt) * 750 * time.Millisecond):
			}
		}

		req, err := http.NewRequestWithContext(ctx, http.MethodPost, openRouterURL, bytes.NewReader(payload))
		if err != nil {
			return "", fmt.Errorf("build request: %w", err)
		}
		key := c.resolveAPIKey()
		if key == "" {
			return "", errors.New("OPENROUTER_API_KEY is not set")
		}
		req.Header.Set("Authorization", "Bearer "+key)
		req.Header.Set("Content-Type", "application/json")

		resp, err := c.httpClient.Do(req)
		if err != nil {
			lastErr = fmt.Errorf("http request: %w", err)
			continue
		}

		respBody, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		if resp.StatusCode == http.StatusTooManyRequests {
			lastErr = fmt.Errorf("openrouter rate limited (429): %s", string(respBody))
			continue
		}

		if resp.StatusCode != http.StatusOK {
			return "", fmt.Errorf("openrouter status %d: %s", resp.StatusCode, string(respBody))
		}

		var parsed chatResponse
		if err := json.Unmarshal(respBody, &parsed); err != nil {
			return "", fmt.Errorf("parse response: %w", err)
		}
		if parsed.Error != nil {
			return "", fmt.Errorf("openrouter error: %s", parsed.Error.Message)
		}
		if len(parsed.Choices) == 0 {
			return "", errors.New("openrouter returned no choices")
		}
		return parsed.Choices[0].Message.Content, nil
	}

	if lastErr == nil {
		lastErr = errors.New("openrouter request failed")
	}
	return "", lastErr
}

// ChatStream performs a streaming chat completion. The callback receives every
// token as it arrives. The full concatenated content is returned on completion.
func (c *Client) ChatStream(ctx context.Context, model string, messages []Message, opts ChatOptions, onToken TokenCallback) (string, error) {
	body := chatRequest{
		Model:       model,
		Messages:    messages,
		Stream:      true,
		Temperature: opts.Temperature,
		MaxTokens:   opts.MaxTokens,
	}

	payload, err := json.Marshal(body)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, openRouterURL, bytes.NewReader(payload))
	if err != nil {
		return "", fmt.Errorf("build request: %w", err)
	}
	key := c.resolveAPIKey()
	if key == "" {
		return "", errors.New("OPENROUTER_API_KEY is not set")
	}
	req.Header.Set("Authorization", "Bearer "+key)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "text/event-stream")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("http request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		errBody, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("openrouter status %d: %s", resp.StatusCode, string(errBody))
	}

	var full strings.Builder
	scanner := bufio.NewScanner(resp.Body)
	scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)

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
		if len(chunk.Choices) == 0 {
			continue
		}
		token := chunk.Choices[0].Delta.Content
		if token == "" {
			continue
		}
		full.WriteString(token)
		if onToken != nil {
			onToken(token)
		}
	}

	if err := scanner.Err(); err != nil {
		return full.String(), fmt.Errorf("stream read: %w", err)
	}
	return full.String(), nil
}
