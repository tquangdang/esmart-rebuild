package handlers

import (
	"net/http"
	"time"

	"esmart-go/cache"
	"esmart-go/config"
	"esmart-go/models"

	"github.com/gin-gonic/gin"
)

const projectListCacheKey = "projects:list"
const projectListTTL = 30 * time.Second

type ProjectResponse struct {
	models.Project
	ContentCount int `json:"contentCount"`
}

func GetAllProjects(c *gin.Context) {
	ctx := c.Request.Context()
	c2 := cache.Default()

	var cached []ProjectResponse
	if hit, err := c2.GetJSON(ctx, projectListCacheKey, &cached); err == nil && hit {
		c.JSON(http.StatusOK, cached)
		return
	}

	var projects []models.Project
	result := config.DB.Order("\"createdAt\" DESC").Find(&projects)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	response := make([]ProjectResponse, 0, len(projects))
	for _, p := range projects {
		var count int64
		config.DB.Model(&models.Content{}).Where("\"projectId\" = ?", p.ID).Count(&count)
		response = append(response, ProjectResponse{
			Project:      p,
			ContentCount: int(count),
		})
	}

	_ = c2.SetJSON(ctx, projectListCacheKey, response, projectListTTL)
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

	invalidateProjectList(c)

	Hub.Broadcast(Notification{
		Type:    "project.created",
		Title:   "New Project",
		Message: "Project created: " + project.Title,
	})

	c.JSON(http.StatusCreated, project)
}

func UpdateProjectStatus(c *gin.Context) {
	id := c.Param("id")

	var body struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if body.Status != "in_progress" && body.Status != "finished" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status must be 'in_progress' or 'finished'"})
		return
	}

	var project models.Project
	if err := config.DB.First(&project, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	project.Status = body.Status
	if err := config.DB.Save(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}

	invalidateProjectList(c)

	Hub.Broadcast(Notification{
		Type:    "project.status_changed",
		Title:   "Project Status Updated",
		Message: "Project \"" + project.Title + "\" is now " + project.Status,
	})

	c.JSON(http.StatusOK, project)
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

	invalidateProjectList(c)

	Hub.Broadcast(Notification{
		Type:    "project.deleted",
		Title:   "Project Deleted",
		Message: "Project deleted: " + project.Title,
	})

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted"})
}

func invalidateProjectList(c *gin.Context) {
	_ = cache.Default().Delete(c.Request.Context(), projectListCacheKey)
}
