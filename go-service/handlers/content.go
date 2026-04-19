package handlers

import (
	"context"
	"log/slog"
	"net/http"
	"time"

	"esmart-go/agents"
	"esmart-go/config"
	"esmart-go/models"
	"esmart-go/storage"

	"github.com/gin-gonic/gin"
)

// GetContentDownloadURL returns a freshly-signed S3 URL for the given content.
// We never store presigned URLs in the DB (they expire) — instead the DB holds
// the canonical S3 *key* and we re-sign on every request. Returns 404 if the
// content has no associated S3 object (e.g. generated before storage was
// enabled), and 503 if storage is not configured on this instance.
func GetContentDownloadURL(c *gin.Context) {
	id := c.Param("id")

	var content models.Content
	if err := config.DB.First(&content, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Content not found"})
		return
	}
	if content.S3URL == nil || *content.S3URL == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "No S3 object for this content"})
		return
	}

	url, err := storage.PresignDownload(c.Request.Context(), *content.S3URL)
	if err != nil {
		slog.Warn("presign on demand failed", "id", id, "err", err)
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Storage unavailable"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"url": url})
}

/**
 * @description: Get all content for a project
 * @param c: *gin.Context
 * @return: void
 */
func GetProjectContent(c *gin.Context) {
	projectID := c.Param("projectId")

	var contents []models.Content
	result := config.DB.Where("\"projectId\" = ?", projectID).Order("\"createdAt\" DESC").Find(&contents)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	if contents == nil {
		contents = []models.Content{}
	}
	c.JSON(http.StatusOK, contents)
}

/**
 * @description: Get content by ID
 * @param c: *gin.Context
 * @return: void
 */
func GetContentByID(c *gin.Context) {
	id := c.Param("id")

	var content models.Content
	result := config.DB.First(&content, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Content not found"})
		return
	}

	c.JSON(http.StatusOK, content)
}

/**
 * @description: Create content
 * @param c: *gin.Context
 * @return: void
 */
func CreateContent(c *gin.Context) {
	var body struct {
		ProjectID        string  `json:"projectId" binding:"required"`
		Topic            string  `json:"topic" binding:"required"`
		Keywords         string  `json:"keywords" binding:"required"`
		Tone             *string `json:"tone"`
		ContentType      string  `json:"contentType" binding:"required"`
		GeneratedContent *string `json:"generatedContent"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	content := models.Content{
		ProjectID:        body.ProjectID,
		Topic:            body.Topic,
		Keywords:         body.Keywords,
		Tone:             body.Tone,
		ContentType:      body.ContentType,
		GeneratedContent: body.GeneratedContent,
	}

	result := config.DB.Create(&content)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, content)
}

/**
 * @description: Delete content
 * @param c: *gin.Context
 * @return: void
 */
func DeleteContent(c *gin.Context) {
	id := c.Param("id")

	var content models.Content
	result := config.DB.First(&content, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Content not found"})
		return
	}

	if err := config.DB.Delete(&content).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete content"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Content deleted"})
}

/**
 * @description: Generate and create content
 * @param c: *gin.Context
 * @return: void
 */
func GenerateAndCreateContent(c *gin.Context) {
	var body struct {
		ProjectID   string  `json:"projectId" binding:"required"`
		Topic       string  `json:"topic" binding:"required"`
		Keywords    string  `json:"keywords" binding:"required"`
		Tone        *string `json:"tone"`
		ContentType string  `json:"contentType" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tone := ""
	if body.Tone != nil {
		tone = *body.Tone
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Minute)
	defer cancel()

	input := agents.PipelineInput{
		ProjectID:   body.ProjectID,
		Topic:       body.Topic,
		Keywords:    splitKeywords(body.Keywords, nil),
		Tone:        tone,
		ContentType: body.ContentType,
	}

	state, err := agents.Pipeline(ctx, input, func(agents.AgentEvent) {})
	if err != nil {
		slog.Warn("synchronous pipeline failed", "err", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate content"})
		return
	}

	content := models.Content{
		ProjectID:        body.ProjectID,
		Topic:            body.Topic,
		Keywords:         body.Keywords,
		Tone:             body.Tone,
		ContentType:      body.ContentType,
		GeneratedContent: &state.Final,
	}

	result := config.DB.Create(&content)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	Hub.Broadcast(Notification{
		Type:    "content.generated",
		Title:   "Content Generated",
		Message: "New content: " + content.Topic,
	})

	c.JSON(http.StatusCreated, content)
}

/**
 * @description: Update content
 * @param c: *gin.Context
 * @return: void
 */
func UpdateContent(c *gin.Context) {
	id := c.Param("id")

	var content models.Content
	if err := config.DB.First(&content, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Content not found"})
		return
	}

	var body struct {
		GeneratedContent *string `json:"generatedContent"`
		Topic            *string `json:"topic"`
		Keywords         *string `json:"keywords"`
		Tone             *string `json:"tone"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if body.GeneratedContent != nil {
		content.GeneratedContent = body.GeneratedContent
	}
	if body.Topic != nil {
		content.Topic = *body.Topic
	}
	if body.Keywords != nil {
		content.Keywords = *body.Keywords
	}
	if body.Tone != nil {
		content.Tone = body.Tone
	}

	if err := config.DB.Save(&content).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update content"})
		return
	}

	c.JSON(http.StatusOK, content)
}