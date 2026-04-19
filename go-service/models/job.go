package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// Job statuses.
const (
	JobStatusQueued    = "queued"
	JobStatusRunning   = "running"
	JobStatusCompleted = "completed"
	JobStatusFailed    = "failed"
)

// Job represents an enqueued content-generation request. Persisting it lets the
// system survive worker restarts and gives us a primary key for the WebSocket
// subscription model (one client subscribes to events for one jobId).
type Job struct {
	ID          string         `json:"id" gorm:"type:uuid;primaryKey"`
	ProjectID   string         `json:"projectId" gorm:"type:uuid;not null;column:projectId"`
	Status      string         `json:"status" gorm:"type:varchar(20);default:'queued'"`
	CurrentStep string         `json:"currentStep" gorm:"type:varchar(20);column:currentStep"`
	Payload     datatypes.JSON `json:"payload" gorm:"type:jsonb"`
	ContentID   *string        `json:"contentId,omitempty" gorm:"type:uuid;column:contentId"`
	S3URL       *string        `json:"s3Url,omitempty" gorm:"type:text;column:s3Url"`
	Error       *string        `json:"error,omitempty" gorm:"type:text"`
	CreatedAt   time.Time      `json:"createdAt" gorm:"column:createdAt;autoCreateTime"`
	UpdatedAt   time.Time      `json:"updatedAt" gorm:"column:updatedAt;autoUpdateTime"`
}

func (Job) TableName() string { return "jobs" }

func (j *Job) BeforeCreate(tx *gorm.DB) error {
	if j.ID == "" {
		j.ID = uuid.New().String()
	}
	if j.Status == "" {
		j.Status = JobStatusQueued
	}
	return nil
}
