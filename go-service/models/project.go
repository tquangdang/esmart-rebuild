package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Project struct {
	ID          string    `json:"id" gorm:"type:uuid;primaryKey"`
	Title       string    `json:"title" gorm:"type:varchar(255);not null"`
	Description *string   `json:"description" gorm:"type:text"`
	Type        string    `json:"type" gorm:"type:varchar(255);not null"`
	Status      string    `json:"status" gorm:"type:varchar(20);default:'in_progress'"`
	CreatedAt   time.Time `json:"createdAt" gorm:"column:createdAt;autoCreateTime"`
	UpdatedAt   time.Time `json:"updatedAt" gorm:"column:updatedAt;autoUpdateTime"`

	Contents []Content `json:"Contents,omitempty" gorm:"foreignKey:ProjectID;constraint:OnDelete:CASCADE"`
}

func (Project) TableName() string {
	return "projects"
}

func (p *Project) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	if p.Status == "" {
		p.Status = "in_progress"
	}
	return nil
}
