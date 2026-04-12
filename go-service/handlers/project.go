package handlers

import (
	"net/http"

	"esmart-go/config"
	"esmart-go/models"

	"github.com/gin-gonic/gin"
)

func GetAllProjects(c *gin.Context) {
	var projects []models.Project
	result := config.DB.Order("\"createdAt\" DESC").Find(&projects)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	type ProjectResponse struct {
		models.Project
		ContentCount int `json:"contentCount"`
	}

	var response []ProjectResponse
	for _, p := range projects {
		var count int64
		config.DB.Model(&models.Content{}).Where("\"projectId\" = ?", p.ID).Count(&count)
		response = append(response, ProjectResponse{
			Project:      p,
			ContentCount: int(count),
		})
	}

	if response == nil {
		response = []ProjectResponse{}
	}
	c.JSON(http.StatusOK, response)
}

func GetProjectByID(c *gin.Context) {
	id := c.Param("id")

	var project models.Project
	result := config.DB.Preload("Contents").First(&project, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	c.JSON(http.StatusOK, project)
}

func CreateProject(c *gin.Context) {
	var body struct {
		Title       string  `json:"title" binding:"required"`
		Description *string `json:"description"`
		Type        string  `json:"type" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	project := models.Project{
		Title:       body.Title,
		Description: body.Description,
		Type:        body.Type,
	}

	result := config.DB.Create(&project)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, project)
}

func DeleteProject(c *gin.Context) {
	id := c.Param("id")

	var project models.Project
	result := config.DB.First(&project, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	if err := config.DB.Where("\"projectId\" = ?", id).Delete(&models.Content{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project contents"})
		return
	}
	if err := config.DB.Delete(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted"})
}
