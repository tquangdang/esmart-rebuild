package handlers

import (
	"log/slog"

	"esmart-go/notifications"

	"github.com/gin-gonic/gin"
)

// Notification and Hub are re-exported here so existing handler code keeps
// referencing handlers.Hub / handlers.Notification without churn.
type Notification = notifications.Notification

var Hub = notifications.Default

func HandleNotifications(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		slog.Warn("notification ws upgrade", "err", err)
		return
	}

	notifications.Default.Register(conn)
	defer func() {
		notifications.Default.Unregister(conn)
		conn.Close()
	}()

	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break
		}
	}
}
