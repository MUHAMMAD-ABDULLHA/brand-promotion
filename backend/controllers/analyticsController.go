package controllers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"time"
	"vite-project/backend/config"
	"vite-project/backend/models"

	"github.com/gin-gonic/gin"
)

// ComprehensiveAnalytics is the "Temp" structure to make analytics make sense
type ComprehensiveAnalytics struct {
	// Unique Event ID
	AnalyticsID int       `json:"analytics_id"`
	EventType   string    `json:"event_type"` // impression, click, like
	Timestamp   time.Time `json:"timestamp"`

	// 1. Who Saw/Interacted with it? (The Viewer)
	ViewerID   int    `json:"viewer_id"`
	ViewerName string `json:"viewer_name"`
	ViewerAge  int    `json:"viewer_age"`

	// 2. Who Published this specific ad instance? (The Source)
	PublisherID   int    `json:"publisher_id"`
	PublisherName string `json:"publisher_name"`
	PublisherRole string `json:"publisher_role"` // "influencer", "brand", or "owner"

	// 3. Context (Campaign & Ad)
	CampaignID   int    `json:"campaign_id"`
	CampaignName string `json:"campaign_name"`
	AdID         int    `json:"ad_id"`
	Headline     string `json:"ad_headline"`
	Objective    string `json:"objective"` // e.g., Lead Gen, Awareness
}

// AnalyticsSummary is optional if you want pre-calculated totals
type AnalyticsSummary struct {
	TotalEvents      int `json:"total_events"`
	TotalImpressions int `json:"impressions"`
	TotalEngagements int `json:"engagements"`
}

func CreateAnalytics(c *gin.Context) {
	log.Println("=== [CreateAnalytics] Called ===")

	var analytics models.AdAnalytics

	// Bind request body
	if err := c.ShouldBindJSON(&analytics); err != nil {
		log.Printf("[ERROR] Binding JSON failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("[DEBUG] Inserting Analytics => AdID: %d | UserID: %d | Type: %s | Publisher: %s",
		analytics.AdID, analytics.UserID, analytics.EventType, analytics.Publisher)

	// Insert analytics event (timestamp handled by DB)
	query := `
        INSERT INTO ad_analytics (ad_id, user_id, event_type, publisher)
        VALUES ($1, $2, $3, $4)
        RETURNING id, timestamp;
    `

	err := config.DB.QueryRow(
		query,
		analytics.AdID,
		analytics.UserID,
		analytics.EventType,
		analytics.Publisher,
	).Scan(&analytics.ID, &analytics.Timestamp)

	if err != nil {
		log.Printf("[ERROR] Insert analytics failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create analytics event: %v", err)})
		return
	}

	log.Printf("[SUCCESS] Analytics created => ID: %d | Time: %v", analytics.ID, analytics.Timestamp)
	c.JSON(http.StatusOK, analytics)
}

func GetDetailedBrandAnalytics(c *gin.Context) {
	// 1. Get the Brand User ID from URL param
	brandUserID := c.Param("user_id")

	// LOG: Entry point
	log.Printf("[Analytics] Request received for user_id: %s", brandUserID)

	if brandUserID == "" {
		log.Println("[Analytics] Error: brand_user_id is missing")
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	// 2. The Complex SQL Query
	query := `
        SELECT 
            aa.id,
            aa.event_type,
            aa.timestamp,
            
            -- Viewer Details (Nullable)
            u_viewer.id,
            u_viewer.full_name,
            u_viewer.age,
        

            -- Publisher Details
            aa.publisher,
            u_publisher.full_name,
            CASE 
                WHEN inf.user_id IS NOT NULL THEN 'influencer'
                WHEN u_publisher.id = c.brand_user_id THEN 'owner'
                ELSE 'collaborator_brand'
            END AS publisher_role,

            -- Context
            c.id,
            c.name,
            c.objective,
            a.id,
            a.headline

        FROM ad_analytics aa
        JOIN ads a ON aa.ad_id = a.id
        JOIN campaigns c ON CAST(a.campaign_id AS INTEGER) = c.id
        LEFT JOIN users u_viewer ON aa.user_id = u_viewer.id
        LEFT JOIN users u_publisher ON aa.publisher = u_publisher.id
        LEFT JOIN influencers inf ON u_publisher.id = inf.user_id
        
        WHERE c.brand_user_id = $1
        ORDER BY aa.timestamp DESC
    `

	// 3. Execute Query using config.DB
	log.Println("[Analytics] Executing SQL query...")
	rows, err := config.DB.Query(query, brandUserID)
	if err != nil {
		log.Printf("[Analytics] Database Query Error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch analytics", "details": err.Error()})
		return
	}
	defer rows.Close()

	var results []ComprehensiveAnalytics
	var totalImpressions, totalEngagements int

	// 4. Iterate and Scan
	log.Println("[Analytics] Starting row iteration...")

	for rows.Next() {
		var item ComprehensiveAnalytics

		// Nullable variables for scanning
		var (
			vID   sql.NullInt32
			vName sql.NullString
			vAge  sql.NullInt32
			pName sql.NullString
		)

		err := rows.Scan(
			&item.AnalyticsID,
			&item.EventType,
			&item.Timestamp,

			&vID,   // u_viewer.id
			&vName, // u_viewer.full_name
			&vAge,  // u_viewer.age

			&item.PublisherID,
			&pName, // u_publisher.full_name
			&item.PublisherRole,

			&item.CampaignID,
			&item.CampaignName,
			&item.Objective,
			&item.AdID,
			&item.Headline,
		)

		if err != nil {
			// LOG: Specific scan error
			log.Printf("[Analytics] Row Scan Error (Skipping row): %v", err)
			continue
		}

		// 5. Handle Nulls and Assign to Struct
		if vID.Valid {
			id := int(vID.Int32)
			item.ViewerID = id
		}
		if vName.Valid {
			item.ViewerName = vName.String
		}
		if vAge.Valid {
			age := int(vAge.Int32)
			item.ViewerAge = age
		}

		if pName.Valid {
			item.PublisherName = pName.String
		}

		// 6. Calculate Aggregates
		if item.EventType == "impression" {
			totalImpressions++
		} else {
			// clicks, likes, etc.
			totalEngagements++
		}

		results = append(results, item)
	}

	// 7. Check for iteration errors
	if err = rows.Err(); err != nil {
		log.Printf("[Analytics] Row Iteration Error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error iterating rows"})
		return
	}

	// LOG: Final summary
	log.Printf("[Analytics] Success. Retrieved %d events (Impressions: %d, Engagements: %d)",
		len(results), totalImpressions, totalEngagements)

	// 8. Return JSON
	c.JSON(http.StatusOK, gin.H{
		"summary": AnalyticsSummary{
			TotalEvents:      len(results),
			TotalImpressions: totalImpressions,
			TotalEngagements: totalEngagements,
		},
		"analytics_data": results,
	})
}

// ===========================
// DTOs (only for responses)
// ===========================

type AnalyticsResponse struct {
	ID        int       `json:"id"`
	AdID      int       `json:"ad_id"`
	UserID    *int      `json:"user_id,omitempty"`
	EventType string    `json:"event_type"`
	Timestamp time.Time `json:"timestamp"`
	Publisher int       `json:"publisher"`

	// From ads
	CampaignID string `json:"campaign_id"`
	Headline   string `json:"headline"`
	Audience   string `json:"audience"`
	Location   string `json:"location"`
	MediaType  string `json:"media_type"`
	MediaURL   string `json:"media_url"`

	// From users (if available)
	UserName string `json:"user_name,omitempty"`
	UserAge  *int   `json:"user_age,omitempty"`
}

/*
===========================

	GET ALL ANALYTICS (Admin)
	===========================
*/

func GetAllAnalytics(c *gin.Context) {
	query := `
		SELECT aa.id, aa.ad_id, aa.user_id, aa.event_type, aa.timestamp, aa.publisher,
		       a.campaign_id, a.headline, a.audience, a.location, a.media_type, a.media_url,
		       u.full_name, u.age
		FROM ad_analytics aa
		JOIN ads a ON aa.ad_id = a.id
		LEFT JOIN users u ON aa.user_id = u.id
		ORDER BY aa.timestamp DESC
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch analytics"})
		return
	}
	defer rows.Close()

	var analyticsList []AnalyticsResponse
	for rows.Next() {
		var ar AnalyticsResponse
		var userAge sql.NullInt32
		var userName sql.NullString

		if err := rows.Scan(
			&ar.ID, &ar.AdID, &ar.UserID, &ar.EventType, &ar.Timestamp, &ar.Publisher,
			&ar.CampaignID, &ar.Headline, &ar.Audience, &ar.Location, &ar.MediaType, &ar.MediaURL,
			&userName, &userAge,
		); err != nil {
			continue
		}

		if userName.Valid {
			ar.UserName = userName.String
		}
		if userAge.Valid {
			tmp := int(userAge.Int32)
			ar.UserAge = &tmp
		}

		analyticsList = append(analyticsList, ar)
	}

	c.JSON(http.StatusOK, analyticsList)
}

/*
===========================

	GET ANALYTICS BY BRAND USER
	===========================
*/

func GetAnalyticsByUserId(c *gin.Context) {
	brandUserID := c.Param("id")

	query := `
		SELECT aa.id, aa.ad_id, aa.user_id, aa.event_type, aa.timestamp, aa.publisher,
		       a.campaign_id, a.headline, a.audience, a.location, a.media_type, a.media_url,
		       u.full_name, u.age
		FROM ad_analytics aa
		JOIN ads a ON aa.ad_id = a.id
		JOIN campaigns c ON a.campaign_id = c.id
		LEFT JOIN users u ON aa.user_id = u.id
		WHERE c.brand_user_id = $1
		ORDER BY aa.timestamp DESC
	`

	rows, err := config.DB.Query(query, brandUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch analytics"})
		return
	}
	defer rows.Close()

	var analyticsList []AnalyticsResponse
	for rows.Next() {
		var ar AnalyticsResponse
		var userAge sql.NullInt32
		var userName sql.NullString

		if err := rows.Scan(
			&ar.ID, &ar.AdID, &ar.UserID, &ar.EventType, &ar.Timestamp, &ar.Publisher,
			&ar.CampaignID, &ar.Headline, &ar.Audience, &ar.Location, &ar.MediaType, &ar.MediaURL,
			&userName, &userAge,
		); err != nil {
			continue
		}

		if userName.Valid {
			ar.UserName = userName.String
		}
		if userAge.Valid {
			tmp := int(userAge.Int32)
			ar.UserAge = &tmp
		}

		analyticsList = append(analyticsList, ar)
	}

	c.JSON(http.StatusOK, analyticsList)
}

/*
===========================

	GET ANALYTICS BY AD
	===========================
*/

func GetAnalyticsByAdId(c *gin.Context) {
	adID := c.Param("id")

	query := `
		SELECT aa.id, aa.ad_id, aa.user_id, aa.event_type, aa.timestamp, aa.publisher,
		       a.campaign_id, a.headline, a.audience, a.location, a.media_type, a.media_url,
		       u.full_name, u.age
		FROM ad_analytics aa
		JOIN ads a ON aa.ad_id = a.id
		LEFT JOIN users u ON aa.user_id = u.id
		WHERE aa.ad_id = $1
		ORDER BY aa.timestamp DESC
	`

	rows, err := config.DB.Query(query, adID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch analytics"})
		return
	}
	defer rows.Close()

	var analyticsList []AnalyticsResponse
	for rows.Next() {
		var ar AnalyticsResponse
		var userAge sql.NullInt32
		var userName sql.NullString

		if err := rows.Scan(
			&ar.ID, &ar.AdID, &ar.UserID, &ar.EventType, &ar.Timestamp, &ar.Publisher,
			&ar.CampaignID, &ar.Headline, &ar.Audience, &ar.Location, &ar.MediaType, &ar.MediaURL,
			&userName, &userAge,
		); err != nil {
			continue
		}

		if userName.Valid {
			ar.UserName = userName.String
		}
		if userAge.Valid {
			tmp := int(userAge.Int32)
			ar.UserAge = &tmp
		}

		analyticsList = append(analyticsList, ar)
	}

	c.JSON(http.StatusOK, analyticsList)
}

/*
===========================

	GET AD METRICS (CTR etc.)
	===========================
*/
func GetAdMetrics(c *gin.Context) {
	adID := c.Param("id")

	var impressions, clicks, engagements int

	err := config.DB.QueryRow(
		`SELECT COUNT(*) FROM ad_analytics WHERE ad_id = $1 AND event_type = 'impression'`,
		adID,
	).Scan(&impressions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get impressions"})
		return
	}

	err = config.DB.QueryRow(
		`SELECT COUNT(*) FROM ad_analytics WHERE ad_id = $1 AND event_type = 'click'`,
		adID,
	).Scan(&clicks)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get clicks"})
		return
	}

	err = config.DB.QueryRow(
		`SELECT COUNT(*) FROM ad_analytics WHERE ad_id = $1 AND event_type = 'engagement'`,
		adID,
	).Scan(&engagements)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get engagements"})
		return
	}

	var ctr float64
	if impressions > 0 {
		ctr = (float64(clicks) / float64(impressions)) * 100
	}

	c.JSON(http.StatusOK, gin.H{
		"ad_id":       adID,
		"impressions": impressions,
		"clicks":      clicks,
		"engagements": engagements,
		"ctr":         ctr,
	})
}

/*
===========================

	DELETE ANALYTICS (Admin)
	===========================
*/
func DeleteAnalytics(c *gin.Context) {
	id := c.Param("id")
	_, err := config.DB.Exec(`DELETE FROM ad_analytics WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete analytics"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Analytics deleted successfully"})
}

/*
-----------------------

	Add Post Analytics Event

-----------------------
*/
func AddPostAnalyticsEvent(c *gin.Context) {
	log.Println("=== [AddPostAnalyticsEvent] Called ===")

	var pa models.PostAnalytics
	if err := c.ShouldBindJSON(&pa); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pa.Timestamp = time.Now()

	err := config.DB.QueryRow(`
		INSERT INTO post_analytics (post_id, user_id, event_type, timestamp)
		VALUES ($1,$2,$3,$4) RETURNING id
	`, pa.PostID, pa.UserID, pa.EventType, pa.Timestamp).Scan(&pa.ID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add analytics event"})
		return
	}

	c.JSON(http.StatusCreated, pa)
}

/*
-----------------------

	Get Analytics for Post

-----------------------
*/
func GetPostAnalytics(c *gin.Context) {
	log.Println("=== [GetPostAnalytics] Called ===")

	postID := c.Param("post_id")

	rows, err := config.DB.Query(`
		SELECT id, post_id, user_id, event_type, timestamp
		FROM post_analytics
		WHERE post_id=$1
		ORDER BY timestamp DESC
	`, postID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch analytics"})
		return
	}
	defer rows.Close()

	var analytics []models.PostAnalytics
	for rows.Next() {
		var pa models.PostAnalytics
		if err := rows.Scan(&pa.ID, &pa.PostID, &pa.UserID, &pa.EventType, &pa.Timestamp); err != nil {
			continue
		}
		analytics = append(analytics, pa)
	}

	c.JSON(http.StatusOK, analytics)
}
