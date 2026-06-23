package models

import (
	"time"
)

//user activities

type User struct {
	ID            int       `json:"id"`
	Email         string    `json:"email"`
	Password      string    `json:"password"`
	FullName      string    `json:"full_name"`
	Username      string    `json:"username"`
	Phone         string    `json:"phone"`
	Age           int       `json:"age"`
	Role          string    `json:"role"`
	UpdatedAt     time.Time `json:"updated_at"`
	ImageURL      string    `json:"image_url"`
	Bio           string    `json:"bio"`
	AccountStatus string    `json:"account_status"`
	PrivacyStatus string    `json:"privacy_status" gorm:"default:public"`
	ImageID       int       `json:"image_id"`
}

type Influencer struct {
	User            User   `json:"user"`
	SocialMedia     string `json:"social_media"`
	SocialMediaLink string `json:"social_media_link"`
	Followers       int    `json:"followers"`
	Location        string `json:"location"`
	Pricing         string `json:"pricing"`
	Niche           string `json:"niche"`
	ContentType     string `json:"content_type"`
	TargetAudience  string `json:"target_audience"`
}

type SocialMediaProfile struct {
	User       User    `json:"user"`
	Followers  int     `json:"followers"`
	Followings int     `json:"followings"`
	Bio        string  `json:"bio"`
	Posts      []Post  `json:"posts"`
	Stories    []Story `json:"stories"`
}

type Follow struct {
	ID          int    `json:"id" gorm:"primaryKey"`
	FollowerID  int    `json:"follower_id"`
	FollowingID int    `json:"following_id"`
	Follower    User   `json:"follower" gorm:"foreignKey:FollowerID"`
	Following   User   `json:"following" gorm:"foreignKey:FollowingID"`
	Status      string `json:"status"`
}
