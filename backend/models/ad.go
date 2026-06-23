package models

import (
	"time"
	"vite-project/backend/config"
)

type Published_Ads struct {
	ID          int       `json:"id"`
	AdID        int       `json:"ad_id" db:"ad_id"`
	PublishedAt time.Time `json:"publishedAt" db:"published_at"`
	Publisher   int       `json:"publisher" db:"publisher"`
}

type Ad struct {
	ID          int         `json:"id" gorm:"primaryKey"`
	CampaignID  string      `json:"campaignId" binding:"required"`
	Headline    string      `json:"headline" binding:"required,max=60"`
	Audience    string      `json:"audience"`
	Location    string      `json:"location"`
	MediaType   string      `json:"mediaType" binding:"required,oneof=image video"`
	MediaURL    string      `json:"mediaUrl" binding:"omitempty,url"`
	MediaId     int         `json:"mediaId"`
	BidStrategy string      `json:"bidStrategy"`
	EnableAR    bool        `json:"enableAR"`
	ARURL       string      `json:"arUrl" binding:"omitempty,url"`
	Status      string      `json:"status" binding:"required,oneof=enabled paused"`
	CreatedAt   time.Time   `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time   `json:"updatedAt" db:"updated_at"`
	AdComments  []AdComment `json:"comments,omitempty" gorm:"foreignKey:AdID"`
	AdLikes     []AdLike    `json:"-" gorm:"foreignKey:AdID"`
}

type AdComment struct {
	ID        int       `json:"id" gorm:"primaryKey"`
	AdID      int       `json:"ad_id"`
	UserID    int       `json:"user_id"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	Text      string    `json:"text"`
	CreatedAt time.Time `json:"createdAt"`
}

type AdLike struct {
	ID     int  `json:"id" gorm:"primaryKey"`
	UserID int  `json:"user_id"`
	AdID   int  `json:"ad_id"`
	User   User `json:"user" gorm:"foreignKey:UserID"`
	Ad     Ad   `json:"ad" gorm:"foreignKey:AdID"`
}

// Helper: Get the limit based on plan type
func GetAdLimitByPlanType(planType string) int64 {
	// Based on your JSON:
	// Monthly & Annual both allow "10 ads per campaign"
	switch planType {
	case "Monthly Plan":
		return 10
	case "Annual Plan":
		return 10
	default:
		return 0
	}
}

func GetARLimitByPlanType(planType string) int64 {
	// Based on your JSON:
	// Monthly Plan: "3 AR ads"
	// Annual Plan: "4 AR ads"
	switch planType {
	case "Monthly Plan":
		return 3
	case "Annual Plan":
		return 4
	default:
		return 3
	}
}

// Helper: We need to find who owns the campaign to check their plan
func GetBrandIDByCampaignID(campaignID string) (int, error) {
	var brandUserID int
	query := `SELECT brand_user_id FROM campaigns WHERE id = $1`
	err := config.DB.QueryRow(query, campaignID).Scan(&brandUserID)
	return brandUserID, err
}

// Helper: Count how many ads exist specifically for this campaign
func GetAdCountByCampaignID(campaignID string) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM ads WHERE campaign_id = $1`
	err := config.DB.QueryRow(query, campaignID).Scan(&count)
	return count, err
}

func GetARAdCountByCampaignID(campaignID string) (int64, error) {
	var count int64
	// We check campaign_id, not id. And we check enable_ar = true
	query := `SELECT COUNT(*) FROM ads WHERE campaign_id = $1 AND enable_ar = true`

	err := config.DB.QueryRow(query, campaignID).Scan(&count)
	return count, err
}
