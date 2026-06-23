package models

import "time"

type Story struct {
	ID        int       `json:"id" gorm:"primaryKey"`
	UserID    int       `json:"user_id"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	ImageURL  string    `json:"image" gorm:"column:image_url"`
	ExpiresAt time.Time `json:"expiresAt" gorm:"column:expires_at"`
	CreatedAt time.Time `json:"createdAt" gorm:"column:created_at"`
	ImageID   int       `json:"image_id" gorm:"column:image_id"`
}
