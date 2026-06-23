package models

import (
	"encoding/json"
	"time"
	"vite-project/backend/config"
)

type Campaign struct {
	ID               int       `json:"id" db:"id"`
	BrandUserID      int       `json:"brand_user_id" db:"brand_user_id"`
	Name             string    `json:"name" db:"name"`
	Description      string    `json:"description" db:"description"`
	Objective        string    `json:"objective" db:"objective"`
	OverallBudget    float64   `json:"overall_budget" db:"overall_budget"`
	DailyBudget      float64   `json:"daily_budget" db:"daily_budget"`
	Spend            float64   `json:"spend" db:"spend"` // Added for remaining budget
	StartDate        string    `json:"start_date" db:"start_date"`
	EndDate          string    `json:"end_date" db:"end_date"`
	Demographics     string    `json:"demographics" db:"demographics"`
	HasHistorical    bool      `json:"has_historical" db:"has_historical"`
	HistoricalData   string    `json:"historical_data" db:"historical_data"`
	KeyMessages      string    `json:"key_messages" db:"key_messages"`
	Cta              string    `json:"cta" db:"cta"`
	Offers           string    `json:"offers" db:"offers"`
	EnableAR         bool      `json:"enable_ar" db:"enable_ar"`
	EnableVoice      bool      `json:"enable_voice" db:"enable_voice"`
	MultiStepForm    bool      `json:"multi_step_form" db:"multi_step_form"`
	PersonalizedPage bool      `json:"personalized_page" db:"personalized_page"`
	Status           string    `json:"status" db:"status"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
	Kpis             []string  `json:"kpis"`
}

type CampaignKPI struct {
	CampaignID int    `json:"campaign_id" db:"campaign_id"`
	KPIName    string `json:"kpi_name" db:"kpi_name"`
}

type AdCreative struct {
	ID            int       `json:"id" db:"id"`
	CampaignID    int       `json:"campaign_id" db:"campaign_id"`
	CreativeType  string    `json:"creative_type" db:"creative_type"`
	AssetURL      string    `json:"asset_url" db:"asset_url"`
	Headline      string    `json:"headline" db:"headline"`
	BodyText      string    `json:"body_text" db:"body_text"`
	CtaButtonText string    `json:"cta_button_text" db:"cta_button_text"`
	ArAssetURL    string    `json:"ar_asset_url" db:"ar_asset_url"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	Impressions   int64     `json:"impressions" db:"impressions"` // Added for metrics
	Clicks        int64     `json:"clicks" db:"clicks"`           // Added for metrics
	Conversions   int64     `json:"conversions" db:"conversions"` // Added for metrics
	CTR           string    `json:"ctr" db:"ctr"`                 // Added for metrics
}

type AudienceSegment struct {
	ID          int             `json:"id" db:"id"`
	CampaignID  int             `json:"campaign_id" db:"campaign_id"`
	SegmentName string          `json:"segment_name" db:"segment_name"`
	Criteria    json.RawMessage `json:"criteria_json" db:"criteria_json"`
}

type CombineCampaign struct {
	ID         int       `json:"id"`
	CampaignID int       `json:"campaign_id"` // main campaign
	AdminID    int       `json:"admin_id"`    // brand owner
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

type CombineCampaignCollaborator struct {
	ID                int    `json:"id"`
	CombineCampaignID int    `json:"combine_campaign_id"`
	CollaboratorID    int    `json:"collaborator_id"` // brand collaborator
	Approved          string `json:"approved"`        // "pending", "approved", "rejected"

}

type Metrics struct {
	Impressions     int64    `json:"impressions"`
	Clicks          int64    `json:"clicks"`
	Conversions     int64    `json:"conversions"`
	CTR             string   `json:"ctr"`
	Spend           float64  `json:"spend"`
	Dates           []string `json:"dates"`
	ImpressionsData []int64  `json:"impressionsData"`
	ClicksData      []int64  `json:"clicksData"`
}

func GetCampaignCountByUserID(userID int) (int64, error) {
	var count int64
	// Changed 'user_id' to 'brand_user_id' to match your campaigns table schema
	query := `SELECT COUNT(*) FROM campaigns WHERE brand_user_id=$1`

	err := config.DB.QueryRow(query, userID).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func GetCampaignLimitByPlanType(planType string) int64 {
	// Based on your provided JS object:
	// Monthly Plan: 10 campaigns
	// Annual Plan: 10 campaigns
	switch planType {
	case "Monthly Plan":
		return 10
	case "Annual Plan":
		return 10
	default:
		return 5 // No plan or unknown plan = 5 campaigns allowed
	}
}
