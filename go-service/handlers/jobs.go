package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"esmart-go/agents"
	"esmart-go/config"
	"esmart-go/models"
	"esmart-go/queue"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
)

// CreateJob enqueues a content-generation job and returns its ID immediately.
// The client should then open a WebSocket to /ws/generate?jobId=... to receive
// real-time pipeline events as the worker processes the job.
func CreateJob(c *gin.Context) {
	if queue.Default == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "queue not initialized"})
		return
	}

	var body struct {
		ProjectID   string   `json:"projectId" binding:"required"`
		Topic       string   `json:"topic" binding:"required"`
		Keywords    string   `json:"keywords"`
		KeywordList []string `json:"keywordList"`
		Tone        string   `json:"tone"`
		ContentType string   `json:"contentType" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	keywords := body.KeywordList
	if len(keywords) == 0 && body.Keywords != "" {
		for _, k := range strings.Split(body.Keywords, ",") {
			if k = strings.TrimSpace(k); k != "" {
				keywords = append(keywords, k)
			}
		}
	}

	input := agents.PipelineInput{
		ProjectID:   body.ProjectID,
		Topic:       body.Topic,
		Keywords:    keywords,
		Tone:        body.Tone,
		ContentType: body.ContentType,
	}

	payload, err := json.Marshal(input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	job := models.Job{
		ProjectID: body.ProjectID,
		Status:    models.JobStatusQueued,
		Payload:   datatypes.JSON(payload),
	}
	if err := config.DB.Create(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	input.JobID = job.ID
	if err := queue.Default.Enqueue(c.Request.Context(), queue.Job{ID: job.ID, Input: input}); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "failed to enqueue: " + err.Error()})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{
		"jobId":  job.ID,
		"status": models.JobStatusQueued,
	})
}

// GetJob returns the current persisted state of a job for polling fallback or
// reconnection.
func GetJob(c *gin.Context) {
	id := c.Param("id")
	var job models.Job
	if err := config.DB.First(&job, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
		return
	}
	c.JSON(http.StatusOK, job)
}
