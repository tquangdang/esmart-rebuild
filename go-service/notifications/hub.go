package notifications

import (
	"encoding/json"
	"log/slog"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Notification struct {
	Type      string `json:"type"`
	Title     string `json:"title"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
}

// Hub is a fan-out for app-wide notifications. Multiple websocket subscribers
// receive every notification. Writes are serialized through a single mutex
// because gorilla/websocket connections are not safe for concurrent writes.
type Hub struct {
	clients map[*websocket.Conn]bool
	mu      sync.Mutex
}

var Default = &Hub{clients: map[*websocket.Conn]bool{}}

func (h *Hub) Register(conn *websocket.Conn) {
	h.mu.Lock()
	h.clients[conn] = true
	count := len(h.clients)
	h.mu.Unlock()
	slog.Debug("notification client connected", "total", count)
}

func (h *Hub) Unregister(conn *websocket.Conn) {
	h.mu.Lock()
	delete(h.clients, conn)
	count := len(h.clients)
	h.mu.Unlock()
	slog.Debug("notification client disconnected", "total", count)
}

func (h *Hub) Broadcast(n Notification) {
	n.Timestamp = time.Now().UTC().Format(time.RFC3339)
	data, err := json.Marshal(n)
	if err != nil {
		slog.Warn("notification marshal", "err", err)
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()
	for conn := range h.clients {
		if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
			conn.Close()
			delete(h.clients, conn)
		}
	}
}
