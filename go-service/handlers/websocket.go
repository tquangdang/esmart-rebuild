package handlers

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"
	"sync"
	"time"

	"esmart-go/agents"
	"esmart-go/config"
	"esmart-go/events"
	"esmart-go/models"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type wsGenerateRequest struct {
	ProjectID   string   `json:"projectId"`
	Topic       string   `json:"topic"`
	Keywords    string   `json:"keywords"`
	KeywordList []string `json:"keywordList,omitempty"`
	Tone        string   `json:"tone"`
	ContentType string   `json:"contentType"`
}

// wsMessage is the union of all event shapes the frontend receives.
// Unknown types are ignored by the client for forward compatibility.
type wsMessage struct {
	Type      string         `json:"type"`
	Step      string         `json:"step,omitempty"`
	Status    string         `json:"status,omitempty"`
	Message   string         `json:"message,omitempty"`
	Token     string         `json:"token,omitempty"`
	Data      any            `json:"data,omitempty"`
	Content   string         `json:"content,omitempty"`
	ID        string         `json:"id,omitempty"`
	S3URL     string         `json:"s3Url,omitempty"`
	Meta      *agents.MetaPackage `json:"meta,omitempty"`
	Error     string         `json:"error,omitempty"`
	JobID     string         `json:"jobId,omitempty"`
}

// HandleWebSocket runs the agent pipeline for a content generation request.
// Two modes:
//   - jobId query param present → subscribe to events for that job (queue worker
//     is responsible for running the pipeline and publishing events)
//   - no jobId → run the pipeline inline for one request, then close (legacy
//     compatibility for the current frontend before it migrates to /api/jobs)
func HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		slog.Warn("websocket upgrade failed", "err", err)
		return
	}
	defer conn.Close()

	if jobID := strings.TrimSpace(c.Query("jobId")); jobID != "" {
		streamJobEvents(conn, jobID)
		return
	}

	runInlinePipeline(c.Request.Context(), conn)
}

// streamJobEvents subscribes the connection to the event bus for jobID and
// forwards every published envelope to the client until the bus closes.
func streamJobEvents(conn *websocket.Conn, jobID string) {
	ch := events.Default.Subscribe(jobID)
	defer events.Default.Unsubscribe(jobID, ch)

	writer := newSerialWriter(conn)
	writer.send(wsMessage{Type: "subscribed", JobID: jobID})

	// Detect client disconnect in parallel so we can stop forwarding promptly.
	disconnect := make(chan struct{})
	go func() {
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				close(disconnect)
				return
			}
		}
	}()

	for {
		select {
		case <-disconnect:
			return
		case env, ok := <-ch:
			if !ok {
				return
			}
			writer.send(envelopeToMessage(env))
			if env.Done || env.Error != "" {
				return
			}
		}
	}
}

func envelopeToMessage(env events.Envelope) wsMessage {
	if env.Error != "" {
		return wsMessage{Type: "error", Error: env.Error}
	}
	if env.Done {
		return wsMessage{
			Type:    "done",
			Content: env.Final,
			ID:      env.ContentID,
			S3URL:   env.S3URL,
			Meta:    env.Meta,
		}
	}
	return wsMessage{
		Type:    eventTypeFor(env.Event),
		Step:    env.Event.Step,
		Status:  env.Event.Status,
		Message: env.Event.Message,
		Token:   env.Event.Token,
		Data:    env.Event.Data,
	}
}

// eventTypeFor maps internal status codes to the wire message types the
// frontend handles.
func eventTypeFor(e agents.AgentEvent) string {
	switch e.Status {
	case agents.StatusProgress:
		return "agent_progress"
	case agents.StatusCompleted:
		return "agent_completed"
	case agents.StatusSkipped:
		return "agent_skipped"
	case agents.StatusCacheHit:
		return "cache_hit"
	case agents.StatusError:
		return "agent_error"
	default:
		return "agent_step"
	}
}

// runInlinePipeline runs one full pipeline per inbound message on the same
// connection. This keeps the existing /ws/generate API working without the
// queue (Phase A standalone). Each message is processed sequentially.
func runInlinePipeline(parent context.Context, conn *websocket.Conn) {
	writer := newSerialWriter(conn)

	for {
		_, raw, err := conn.ReadMessage()
		if err != nil {
			return
		}

		var req wsGenerateRequest
		if err := json.Unmarshal(raw, &req); err != nil {
			writer.send(wsMessage{Type: "error", Error: "invalid request format"})
			continue
		}
		if req.ProjectID == "" || req.Topic == "" || req.ContentType == "" {
			writer.send(wsMessage{Type: "error", Error: "missing required fields: projectId, topic, contentType"})
			continue
		}

		input := agents.PipelineInput{
			ProjectID:   req.ProjectID,
			Topic:       req.Topic,
			Keywords:    splitKeywords(req.Keywords, req.KeywordList),
			Tone:        req.Tone,
			ContentType: req.ContentType,
		}

		writer.send(wsMessage{Type: "start"})

		ctx, cancel := context.WithTimeout(parent, 5*time.Minute)
		emit := func(e agents.AgentEvent) {
			writer.send(wsMessage{
				Type:    eventTypeFor(e),
				Step:    e.Step,
				Status:  e.Status,
				Message: e.Message,
				Token:   e.Token,
				Data:    e.Data,
			})
		}

		state, err := agents.Pipeline(ctx, input, emit)
		cancel()

		if err != nil {
			writer.send(wsMessage{Type: "error", Error: err.Error()})
			continue
		}

		var tone *string
		if req.Tone != "" {
			tone = &req.Tone
		}

		content := models.Content{
			ProjectID:        req.ProjectID,
			Topic:            req.Topic,
			Keywords:         req.Keywords,
			Tone:             tone,
			ContentType:      req.ContentType,
			GeneratedContent: &state.Final,
		}
		if err := config.DB.Create(&content).Error; err != nil {
			writer.send(wsMessage{Type: "error", Error: "failed to save content"})
			continue
		}

		Hub.Broadcast(Notification{
			Type:    "content.generated",
			Title:   "Content Generated",
			Message: "New content: " + content.Topic,
		})

		writer.send(wsMessage{
			Type:    "done",
			Content: state.Final,
			ID:      content.ID,
			Meta:    state.Meta,
		})
	}
}

// serialWriter guards a single websocket connection against concurrent writes
// (gorilla connections are not safe for parallel WriteMessage calls).
type serialWriter struct {
	mu   sync.Mutex
	conn *websocket.Conn
}

func newSerialWriter(conn *websocket.Conn) *serialWriter {
	return &serialWriter{conn: conn}
}

func (w *serialWriter) send(msg wsMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		slog.Warn("ws marshal", "err", err)
		return
	}
	w.mu.Lock()
	defer w.mu.Unlock()
	if err := w.conn.WriteMessage(websocket.TextMessage, data); err != nil {
		slog.Debug("ws write", "err", err)
	}
}

func splitKeywords(s string, list []string) []string {
	if len(list) > 0 {
		out := make([]string, 0, len(list))
		for _, k := range list {
			if k = strings.TrimSpace(k); k != "" {
				out = append(out, k)
			}
		}
		return out
	}
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}
