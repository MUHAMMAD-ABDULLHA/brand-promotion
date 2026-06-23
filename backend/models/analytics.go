package models

import "time"

type AdAnalytics struct {
	ID        int       `json:"id" db:"id"`                     // Primary key
	AdID      int       `json:"ad_id" db:"ad_id"`               // FK to ads table
	UserID    *int      `json:"user_id,omitempty" db:"user_id"` // Optional: track which user interacted
	EventType string    `json:"event_type" db:"event_type"`     // "impression", "click", "engagement"
	Timestamp time.Time `json:"timestamp" db:"timestamp"`       // When the event occurred
	Publisher int       `json:"publisher" db:"publisher"`       // Publisher ID
}

type PostAnalytics struct {
	ID        int       `json:"id" db:"id"`                     // Primary key
	PostID    int       `json:"post_id" db:"post_id"`           // FK to posts table
	UserID    *int      `json:"user_id,omitempty" db:"user_id"` // Optional: user who performed action
	EventType string    `json:"event_type" db:"event_type"`     // "impression", "like", "comment", "share"
	Timestamp time.Time `json:"timestamp" db:"timestamp"`       // When event occurred
}
