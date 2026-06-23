package models

import (
	"time"
)

type Post struct {
	ID             int       `json:"id" gorm:"primaryKey"`
	UserID         int       `json:"user_id"`
	User           User      `json:"user" gorm:"foreignKey:UserID"`
	Caption        string    `json:"caption"`
	ImageURL       string    `json:"image_url"` // updated JSON tag for clarity
	Likes          int       `json:"likes" gorm:"default:0"`
	CommentsCount  int       `json:"commentsCount" gorm:"default:0"`
	Impressions    int       `json:"impressions" gorm:"default:0"`
	EngagementRate float64   `json:"engagementRate" gorm:"default:0"`
	IsSponsored    bool      `json:"isSponsored" gorm:"default:false"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
	Comments       []Comment `json:"comments,omitempty" gorm:"foreignKey:PostID"`
	PostLikes      []Like    `json:"-" gorm:"foreignKey:PostID"`
	ImageID        int       `json:"image_id"`
}

type Comment struct {
	ID        int       `json:"id" gorm:"primaryKey"`
	PostID    int       `json:"post_id"`
	UserID    int       `json:"user_id"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	Text      string    `json:"text"`
	CreatedAt time.Time `json:"createdAt"`
}

type Like struct {
	ID     int  `json:"id" gorm:"primaryKey"`
	UserID int  `json:"user_id"`
	PostID int  `json:"post_id"`
	User   User `json:"user" gorm:"foreignKey:UserID"`
	Post   Post `json:"post" gorm:"foreignKey:PostID"`
}

type Saved struct {
	ID        int       `json:"id" gorm:"primaryKey"`
	UserID    int       `json:"user_id" db:"user_id"`
	PostID    int       `json:"post_id" db:"post_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	Post      Post      `json:"post" gorm:"foreignKey:PostID"` // Eager load post details
}

type PublishedPost struct {
	ID          int       `json:"id"`
	PostID      int       `json:"post_id"`
	PublisherID int       `json:"publisher_id"`
	PublishedAt time.Time `json:"published_at"`
}

type PublishedPostResponse struct {
	ID          int       `json:"id"`
	PostID      int       `json:"post_id"`
	PublisherID int       `json:"publisher_id"`
	PublishedAt time.Time `json:"published_at"`
	Post        Post      `json:"post"`
}
