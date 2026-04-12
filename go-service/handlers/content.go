package handlers

import (
	"log"
	"net/http"

	"esmart-go/config"
	"esmart-go/models"
	"esmart-go/services"

	"github.com/gin-gonic/gin"
)

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

	generated, err := services.GenerateContent(body.Topic, body.Keywords, tone, body.ContentType)
	if err != nil {
		log.Printf("Generation error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate content"})
		return
	}

	content := models.Content{
		ProjectID:        body.ProjectID,
		Topic:            body.Topic,
		Keywords:         body.Keywords,
		Tone:             body.Tone,
		ContentType:      body.ContentType,
		GeneratedContent: &generated,
	}

	result := config.DB.Create(&content)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, content)
}
