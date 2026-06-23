package models

import (
	"time"
)

type Notification struct {
	ID        int                    `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID    int                    `json:"user_id"`
	Role      string                 `json:"role" gorm:"type:varchar"`
	Type      string                 `json:"type" gorm:"type:varchar(30);not null"`
	Title     string                 `json:"title" gorm:"type:varchar(100);not null"`
	Message   string                 `json:"message" gorm:"type:text;not null"`
	IsRead    bool                   `json:"isRead" gorm:"not null;default:false"`
	Metadata  map[string]interface{} `json:"metadata" gorm:"type:jsonb"`
	Timestamp string                 `json:"timestamp" gorm:"type:varchar;not null"`
	CreatedAt time.Time              `json:"created_at" gorm:"not null"`
	ExpiresAt *time.Time             `json:"expires_at"`
}

type ScheduledNotification struct {
	ID             string     `json:"id" gorm:"primaryKey;type:varchar"`
	UserID         int        `json:"user_id"`
	EventType      string     `json:"eventType" gorm:"not null"`
	Message        string     `json:"message" gorm:"not null"`
	TargetAudience string     `json:"targetAudience" gorm:"not null"`
	SendTime       time.Time  `json:"sendTime" gorm:"not null"`
	Recurrence     string     `json:"recurrence"`
	Status         string     `json:"status" gorm:"not null"`
	CreatedAt      time.Time  `json:"created_at" gorm:"not null"`
	UpdatedAt      *time.Time `json:"updated_at"`
}

type NotificationPreferences struct {
	UserID    int               `json:"user_id" gorm:"primaryKey"`
	Channels  map[string]bool   `json:"channels" gorm:"type:jsonb"`
	Types     map[string]bool   `json:"types" gorm:"type:jsonb"`
	Frequency map[string]string `json:"frequency" gorm:"type:jsonb"`
}
