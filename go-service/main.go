package main

import (
	"log/slog"
	"os"
	"strconv"

	"esmart-go/cache"
	"esmart-go/config"
	"esmart-go/handlers"
	"esmart-go/metrics"
	"esmart-go/middleware"
	"esmart-go/models"
	"esmart-go/queue"
	"esmart-go/storage"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	middleware.InitLogger()

	if err := config.ConnectDatabase(); err != nil {
		slog.Error("database connection failed", "err", err)
		os.Exit(1)
	}
	if err := config.DB.AutoMigrate(&models.Project{}, &models.Content{}, &models.Job{}); err != nil {
		slog.Error("automigrate failed", "err", err)
		os.Exit(1)
	}

	cache.Default()
	storage.Default()
	metrics.Start()

	q := buildQueue()
	queue.Default = q
	worker := queue.NewWorker(q, getEnvInt("WORKER_CONCURRENCY", 3))
	worker.Start()
	defer worker.Stop()

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(middleware.RequestLogger(), middleware.Recovery())

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000", "https://esmart-rebuild.vercel.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Request-ID"},
		ExposeHeaders:    []string{"X-Request-ID"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	api.Use(middleware.PerIPRateLimiter(getEnvInt("RATE_LIMIT_PER_MIN", 60), getEnvInt("RATE_LIMIT_BURST", 20)))
	{
		api.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

		projects := api.Group("/projects")
		{
			projects.GET("", handlers.GetAllProjects)
			projects.GET("/:id", handlers.GetProjectByID)
			projects.POST("", handlers.CreateProject)
			projects.PATCH("/:id/status", handlers.UpdateProjectStatus)
			projects.DELETE("/:id", handlers.DeleteProject)
		}

		content := api.Group("/content")
		{
			content.GET("/project/:projectId", handlers.GetProjectContent)
			content.GET("/:id", handlers.GetContentByID)
			content.GET("/:id/download", handlers.GetContentDownloadURL)
			content.POST("", handlers.CreateContent)
			content.POST("/generate", handlers.GenerateAndCreateContent) // legacy synchronous
			content.DELETE("/:id", handlers.DeleteContent)
			content.PUT("/:id", handlers.UpdateContent)
		}

		jobs := api.Group("/jobs")
		// Tighter limit on the expensive endpoint.
		jobs.Use(middleware.PerIPRateLimiter(getEnvInt("JOBS_RATE_LIMIT_PER_MIN", 10), 5))
		{
			jobs.POST("", handlers.CreateJob)
			jobs.GET("/:id", handlers.GetJob)
		}
	}

	r.GET("/ws/generate", handlers.HandleWebSocket)
	r.GET("/ws/notifications", handlers.HandleNotifications)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}
	slog.Info("server starting", "port", port, "queue", os.Getenv("QUEUE_BACKEND"))
	if err := r.Run(":" + port); err != nil {
		slog.Error("server stopped", "err", err)
		os.Exit(1)
	}
}

// buildQueue picks the queue implementation based on QUEUE_BACKEND.
//   - "sqs": AWS SQS (durable, survives restarts) — requires SQS_QUEUE_URL
//   - "memory" or unset: in-process channel (fast, lost on restart)
func buildQueue() queue.Queue {
	switch os.Getenv("QUEUE_BACKEND") {
	case "sqs":
		q, err := queue.NewSQSQueue()
		if err != nil {
			slog.Error("SQS queue init failed, falling back to memory", "err", err)
			return queue.NewMemoryQueue(128)
		}
		slog.Info("queue: sqs")
		return q
	default:
		slog.Info("queue: memory")
		return queue.NewMemoryQueue(128)
	}
}

func getEnvInt(key string, def int) int {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return def
	}
	return n
}
