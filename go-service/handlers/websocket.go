package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"esmart-go/config"
	"esmart-go/models"
	"esmart-go/services"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type wsGenerateRequest struct {
	ProjectID   string `json:"projectId"`
	Topic       string `json:"topic"`
	Keywords    string `json:"keywords"`
	Tone        string `json:"tone"`
	ContentType string `json:"contentType"`
}

type wsMessage struct {
	Type    string `json:"type"`
	Token   string `json:"token,omitempty"`
	Content string `json:"content,omitempty"`
	Error   string `json:"error,omitempty"`
	ID      string `json:"id,omitempty"`
}

func HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}
	defer conn.Close()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				log.Printf("WebSocket read error: %v", err)
			}
			break
		}

		var req wsGenerateRequest
		if err := json.Unmarshal(msg, &req); err != nil {
			sendWSError(conn, "Invalid request format")
			continue
		}

		if req.ProjectID == "" || req.Topic == "" || req.Keywords == "" || req.ContentType == "" {
			sendWSError(conn, "Missing required fields: projectId, topic, keywords, contentType")
			continue
		}

		sendWSMessage(conn, wsMessage{Type: "start"})

		fullContent, err := services.GenerateContentStream(
			req.Topic, req.Keywords, req.Tone, req.ContentType,
			func(token string) {
				sendWSMessage(conn, wsMessage{Type: "token", Token: token})
			},
		)

		if err != nil {
			sendWSError(conn, fmt.Sprintf("Generation failed: %v", err))
			continue
		}

		content := models.Content{
			ProjectID:        req.ProjectID,
			Topic:            req.Topic,
			Keywords:         req.Keywords,
			Tone:             nilIfEmpty(req.Tone),
			ContentType:      req.ContentType,
			GeneratedContent: &fullContent,
		}

		result := config.DB.Create(&content)
		if result.Error != nil {
			sendWSError(conn, "Failed to save content")
			continue
		}

		sendWSMessage(conn, wsMessage{
			Type:    "done",
			Content: fullContent,
			ID:      content.ID,
		})
	}
}

func sendWSMessage(conn *websocket.Conn, msg wsMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("WebSocket marshal error: %v", err)
		return
	}
	if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
		log.Printf("WebSocket write error: %v", err)
	}
}

func sendWSError(conn *websocket.Conn, errMsg string) {
	sendWSMessage(conn, wsMessage{Type: "error", Error: errMsg})
}

func nilIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
