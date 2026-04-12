package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Content struct {
	ID               string    `json:"id" gorm:"type:uuid;primaryKey"`
	ProjectID        string    `json:"projectId" gorm:"type:uuid;not null;column:projectId"`
	Topic            string    `json:"topic" gorm:"type:varchar(255);not null"`
	Keywords         string    `json:"keywords" gorm:"type:text;not null"`
	Tone             *string   `json:"tone" gorm:"type:varchar(255)"`
	ContentType      string    `json:"contentType" gorm:"type:varchar(255);not null;column:contentType"`
	GeneratedContent *string   `json:"generatedContent" gorm:"type:text;column:generatedContent"`
	CreatedAt        time.Time `json:"createdAt" gorm:"column:createdAt;autoCreateTime"`
	UpdatedAt        time.Time `json:"updatedAt" gorm:"column:updatedAt;autoUpdateTime"`
}

func (Content) TableName() string {
	return "contents"
}

func (c *Content) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}
