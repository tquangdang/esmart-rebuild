package middleware

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ctxKey string

const (
	requestIDHeader = "X-Request-ID"
	requestIDCtxKey ctxKey = "request_id"
)

// InitLogger swaps the default slog handler for a JSON one. Call once at boot.
func InitLogger() {
	level := slog.LevelInfo
	if os.Getenv("LOG_LEVEL") == "debug" {
		level = slog.LevelDebug
	}
	handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: level,
	})
	slog.SetDefault(slog.New(handler))
}

// RequestLogger emits one structured log line per request with method, path,
// status, duration and a correlation ID. The ID is propagated via the response
// header and the request context so handlers can include it in their own logs.
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		reqID := c.GetHeader(requestIDHeader)
		if reqID == "" {
			reqID = uuid.NewString()
		}
		c.Writer.Header().Set(requestIDHeader, reqID)
		ctx := context.WithValue(c.Request.Context(), requestIDCtxKey, reqID)
		c.Request = c.Request.WithContext(ctx)

		c.Next()

		duration := time.Since(start)
		level := slog.LevelInfo
		if c.Writer.Status() >= 500 {
			level = slog.LevelError
		} else if c.Writer.Status() >= 400 {
			level = slog.LevelWarn
		}

		slog.LogAttrs(ctx, level, "http",
			slog.String("request_id", reqID),
			slog.String("method", c.Request.Method),
			slog.String("path", c.Request.URL.Path),
			slog.Int("status", c.Writer.Status()),
			slog.Int64("duration_ms", duration.Milliseconds()),
			slog.String("ip", c.ClientIP()),
		)
	}
}

// RequestID extracts the correlation ID from a context, returning "" if absent.
func RequestID(ctx context.Context) string {
	v, _ := ctx.Value(requestIDCtxKey).(string)
	return v
}

// Recovery panics → 500 with structured logging instead of gin's default.
func Recovery() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered any) {
		slog.Error("panic recovered",
			slog.Any("error", recovered),
			slog.String("path", c.Request.URL.Path),
		)
		c.AbortWithStatusJSON(500, gin.H{"error": "internal server error"})
	})
}
