package main

import (
	"fmt"
	"log"
	"os"

	"esmart-go/config"
	"esmart-go/handlers"
	"esmart-go/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	if err := config.ConnectDatabase(); err != nil {
		log.Fatal("Database connection failed:", err)
	}

	config.DB.AutoMigrate(&models.Project{}, &models.Content{})

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000", "https://esmart-rebuild.vercel.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		projects := api.Group("/projects")
		{
			projects.GET("", handlers.GetAllProjects)
			projects.GET("/:id", handlers.GetProjectByID)
			projects.POST("", handlers.CreateProject)
			projects.DELETE("/:id", handlers.DeleteProject)
		}

		content := api.Group("/content")
		{
			content.GET("/project/:projectId", handlers.GetProjectContent)
			content.GET("/:id", handlers.GetContentByID)
			content.POST("", handlers.CreateContent)
			content.POST("/generate", handlers.GenerateAndCreateContent)
			content.DELETE("/:id", handlers.DeleteContent)
		}
	}

	r.GET("/ws/generate", handlers.HandleWebSocket)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	fmt.Printf("Go server running on http://localhost:%s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
