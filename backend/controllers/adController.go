package controllers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"
	"vite-project/backend/cloudinary"
	"vite-project/backend/config"
	"vite-project/backend/models"

	"github.com/gin-gonic/gin"
)

func CreateAd(c *gin.Context) {
	log.Println("=== [CreateAd] Called ===")

	type tempAd struct {
		ID          int                `json:"id" gorm:"primaryKey"`
		CampaignID  int                `json:"campaignId" binding:"required"`
		Headline    string             `json:"headline" binding:"required,max=60"`
		Audience    string             `json:"audience"`
		Location    string             `json:"location"`
		MediaType   string             `json:"mediaType" binding:"required,oneof=image video"`
		MediaURL    string             `json:"mediaUrl" binding:"omitempty,url"`
		MediaId     int                `json:"mediaId"`
		BidStrategy string             `json:"bidStrategy"`
		EnableAR    bool               `json:"enableAR"`
		ARURL       string             `json:"arUrl" binding:"omitempty,url"`
		Status      string             `json:"status" binding:"required,oneof=enabled paused"`
		CreatedAt   time.Time          `json:"createdAt" db:"created_at"`
		UpdatedAt   time.Time          `json:"updatedAt" db:"updated_at"`
		AdComments  []models.AdComment `json:"comments,omitempty" gorm:"foreignKey:AdID"`
		AdLikes     []models.AdLike    `json:"-" gorm:"foreignKey:AdID"`
	}
	var ad tempAd
	// Step 1: Bind JSON request
	if err := c.ShouldBindJSON(&ad); err != nil {
		log.Printf("[ERROR] Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("[INFO] Received Ad Request for Campaign ID: %d", ad.CampaignID)
	campaignID := strconv.Itoa(ad.CampaignID)

	// ============================================================
	// 🛡️ MIDDLEWARE / PLAN ENFORCEMENT LOGIC
	// ============================================================

	// A. Find the Brand ID associated with this Campaign
	brandID, err := models.GetBrandIDByCampaignID(campaignID)
	if err != nil {
		log.Printf("[ERROR] Campaign %d not found or has no owner: %v", ad.CampaignID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaign not found"})
		return
	}

	// B. Fetch the user's plan
	userPlan, err := models.GetPlanByUserID(brandID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "No active subscription plan found for the campaign owner.",
		})
		return
	}

	// ------------------------------------------------------------
	// CHECK 1: TOTAL ADS LIMIT (Ad Count per Campaign)
	// ------------------------------------------------------------

	// Get the max ads allowed per campaign
	totalLimit := models.GetAdLimitByPlanType(userPlan.PlanType)

	// Count existing ads for this campaign
	currentAdCount, err := models.GetAdCountByCampaignID(campaignID)
	if err != nil {
		log.Printf("[ERROR] Failed to count ads: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify ad limits"})
		return
	}

	log.Printf("[INFO] Total Check: Plan='%s', Limit=%d, CurrentAds=%d", userPlan.PlanType, totalLimit, currentAdCount)

	if currentAdCount >= totalLimit {
		c.JSON(http.StatusForbidden, gin.H{
			"error": fmt.Sprintf("Ad limit reached. Your %s allows a maximum of %d ads per campaign.", userPlan.PlanType, totalLimit),
			"code":  "LIMIT_REACHED",
		})
		return
	}

	// ------------------------------------------------------------
	// CHECK 2: AR ADS LIMIT (Only if AR is requested)
	// ------------------------------------------------------------
	if ad.EnableAR {
		// Get AR limit for this plan
		arLimit := models.GetARLimitByPlanType(userPlan.PlanType)

		// Count existing AR ads for this campaign
		currentARCount, err := models.GetARAdCountByCampaignID(campaignID)
		if err != nil {
			log.Printf("[ERROR] Failed to count AR ads: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify AR limits"})
			return
		}

		log.Printf("[INFO] AR Check: Plan='%s', Limit=%d, CurrentAR=%d", userPlan.PlanType, arLimit, currentARCount)

		if currentARCount >= arLimit {
			c.JSON(http.StatusForbidden, gin.H{
				"error": fmt.Sprintf("AR Ad limit reached. Your %s allows a maximum of %d AR ads per campaign.", userPlan.PlanType, arLimit),
				"code":  "AR_LIMIT_REACHED",
			})
			return
		}
	}

	// ============================================================
	// END ENFORCEMENT LOGIC
	// ============================================================

	ad.CreatedAt = time.Now()
	ad.UpdatedAt = time.Now()

	// Step 2: Begin transaction
	tx, err := config.DB.Begin()
	if err != nil {
		log.Printf("[ERROR] Failed to start transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	// Safety handling for panics and rollbacks
	defer func() {
		if r := recover(); r != nil {
			log.Printf("[PANIC] Panic recovered in CreateAd: %v", r)
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected server error"})
		}
	}()

	// Step 3: Insert Ad
	query := `
        INSERT INTO ads (campaign_id, headline, audience, location, media_type, media_url,
                         bid_strategy, enable_ar, ar_url, status, created_at, updated_at, media_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
    `
	log.Println("[INFO] Executing INSERT query for new ad record...")

	err = tx.QueryRow(query,
		ad.CampaignID, ad.Headline, ad.Audience, ad.Location,
		ad.MediaType, ad.MediaURL, ad.BidStrategy, ad.EnableAR,
		ad.ARURL, ad.Status, ad.CreatedAt, ad.UpdatedAt, ad.MediaId,
	).Scan(&ad.ID)

	if err != nil {
		tx.Rollback() // Explicit rollback on error
		log.Printf("[ERROR] Failed to execute INSERT query: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create ad: %v", err)})
		return
	}

	log.Printf("[SUCCESS] Ad inserted successfully with ID=%d", ad.ID)

	// Step 4: Commit transaction
	if err := tx.Commit(); err != nil {
		log.Printf("[ERROR] Failed to commit transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	log.Printf("[SUCCESS] Transaction committed successfully for AdID=%d", ad.ID)
	c.JSON(http.StatusCreated, ad)
	log.Println("=== [CreateAd] Completed Successfully ===")
}

// ===============================
// Get Ads by User ID
// ===============================
func GetAds(c *gin.Context) {
	log.Println("=== [GetAds] Called ===")

	userIDParam := c.Param("id")
	userID, err := strconv.Atoi(userIDParam)
	if err != nil {
		log.Printf("[ERROR] Invalid user ID: %v", userIDParam)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	query := `
		SELECT a.id, a.campaign_id, a.headline, a.audience, a.location,
			   a.media_type, a.media_url, a.bid_strategy, a.enable_ar,
			   a.ar_url, a.status, a.created_at, a.updated_at
		FROM ads a
		JOIN campaigns c ON a.campaign_id = c.id
		WHERE c.brand_user_id = $1
	`
	log.Printf("[INFO] Executing query to fetch ads for user_id=%d", userID)
	rows, err := config.DB.Query(query, userID)
	if err != nil {
		log.Printf("[ERROR] Failed to query ads: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to query ads: %v", err)})
		return
	}
	defer rows.Close()

	var ads []models.Ad
	for rows.Next() {
		var ad models.Ad
		if err := rows.Scan(
			&ad.ID, &ad.CampaignID, &ad.Headline, &ad.Audience, &ad.Location,
			&ad.MediaType, &ad.MediaURL, &ad.BidStrategy, &ad.EnableAR,
			&ad.ARURL, &ad.Status, &ad.CreatedAt, &ad.UpdatedAt,
		); err != nil {
			log.Printf("[ERROR] Failed to scan ad row: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to scan ad: %v", err)})
			return
		}
		ads = append(ads, ad)
	}

	log.Printf("[SUCCESS] Retrieved %d ads for user_id=%d", len(ads), userID)
	c.JSON(http.StatusOK, ads)
	log.Println("=== [GetAds] Completed ===")
}

// ===============================
// Get All Ads
// ===============================
func GetAllAds(c *gin.Context) {
	log.Println("=== [GetAllAds] Called ===")

	query := `
		SELECT id, campaign_id, headline, audience, location,
			   media_type, media_url, bid_strategy, enable_ar,
			   ar_url, status, created_at, updated_at
		FROM ads
	`
	log.Println("[INFO] Fetching all ads...")
	rows, err := config.DB.Query(query)
	if err != nil {
		log.Printf("[ERROR] Failed to fetch ads: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch ads: %v", err)})
		return
	}
	defer rows.Close()

	var ads []models.Ad
	for rows.Next() {
		var ad models.Ad
		if err := rows.Scan(
			&ad.ID, &ad.CampaignID, &ad.Headline, &ad.Audience, &ad.Location,
			&ad.MediaType, &ad.MediaURL, &ad.BidStrategy, &ad.EnableAR,
			&ad.ARURL, &ad.Status, &ad.CreatedAt, &ad.UpdatedAt,
		); err != nil {
			log.Printf("[ERROR] Failed to scan ad row: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to scan ad: %v", err)})
			return
		}
		ads = append(ads, ad)
	}

	log.Printf("[SUCCESS] Retrieved %d total ads", len(ads))
	c.JSON(http.StatusOK, ads)
	log.Println("=== [GetAllAds] Completed ===")
}

// ===============================
// Get Ads by Campaign ID
// ===============================
func GetAdsByCampaignID(c *gin.Context) {
	log.Println("=== [GetAdsByCampaignID] Called ===")

	campaignID := c.Param("id")
	log.Printf("[INFO] Fetching ads for campaign_id=%s", campaignID)

	query := `
		SELECT id, campaign_id, headline, audience, location,
			   media_type, media_url, bid_strategy, enable_ar,
			   ar_url, status, created_at, updated_at
		FROM ads WHERE campaign_id = $1
	`

	rows, err := config.DB.Query(query, campaignID)
	if err != nil {
		log.Printf("[ERROR] Failed to fetch ads: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch ads: %v", err)})
		return
	}
	defer rows.Close()

	var ads []models.Ad
	for rows.Next() {
		var ad models.Ad
		if err := rows.Scan(
			&ad.ID, &ad.CampaignID, &ad.Headline, &ad.Audience, &ad.Location,
			&ad.MediaType, &ad.MediaURL, &ad.BidStrategy, &ad.EnableAR,
			&ad.ARURL, &ad.Status, &ad.CreatedAt, &ad.UpdatedAt,
		); err != nil {
			log.Printf("[ERROR] Failed to scan ad row: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to scan ad: %v", err)})
			return
		}
		ads = append(ads, ad)
	}

	log.Printf("[SUCCESS] Retrieved %d ads for campaign_id=%s", len(ads), campaignID)
	c.JSON(http.StatusOK, ads)
	log.Println("=== [GetAdsByCampaignID] Completed ===")
}

// ===============================
// Get Single Ad
// ===============================
func GetSingleAd(c *gin.Context) {
	log.Println("=== [GetSingleAd] Called ===")

	adID := c.Param("id")
	log.Printf("[INFO] Fetching ad with ID=%s", adID)

	query := `
		SELECT id, campaign_id, headline, audience, location,
			   media_type, media_url, bid_strategy, enable_ar,
			   ar_url, status, created_at, updated_at
		FROM ads WHERE id = $1
	`

	var ad models.Ad
	err := config.DB.QueryRow(query, adID).Scan(
		&ad.ID, &ad.CampaignID, &ad.Headline, &ad.Audience, &ad.Location,
		&ad.MediaType, &ad.MediaURL, &ad.BidStrategy, &ad.EnableAR,
		&ad.ARURL, &ad.Status, &ad.CreatedAt, &ad.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		log.Printf("[WARN] Ad not found with ID=%s", adID)
		c.JSON(http.StatusNotFound, gin.H{"error": "Ad not found"})
		return
	} else if err != nil {
		log.Printf("[ERROR] Failed to fetch ad: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch ad: %v", err)})
		return
	}

	log.Printf("[SUCCESS] Retrieved Ad ID=%s", adID)
	c.JSON(http.StatusOK, ad)
	log.Println("=== [GetSingleAd] Completed ===")
}

// ===============================
// Update Advertisement
// ===============================
func UpdateAd(c *gin.Context) {
	log.Println("=== [UpdateAd] Called ===")

	adID := c.Param("id")
	var ad models.Ad

	if err := c.ShouldBindJSON(&ad); err != nil {
		log.Printf("[ERROR] Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ad.UpdatedAt = time.Now()

	query := `
		UPDATE ads
		SET campaign_id = $1, headline = $2, audience = $3, location = $4,
			media_type = $5, media_url = $6, bid_strategy = $7,
			enable_ar = $8, ar_url = $9, status = $10,
			updated_at = $11, media_id = $12
		WHERE id = $13
	`

	log.Printf("[INFO] Updating Ad ID=%s", adID)
	_, err := config.DB.Exec(query,
		ad.CampaignID, ad.Headline, ad.Audience, ad.Location,
		ad.MediaType, ad.MediaURL, ad.BidStrategy, ad.EnableAR,
		ad.ARURL, ad.Status, ad.UpdatedAt, ad.MediaId, adID,
	)

	if err != nil {
		log.Printf("[ERROR] Failed to update ad: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update ad: %v", err)})
		return
	}

	log.Printf("[SUCCESS] Ad updated successfully (ID=%s)", adID)
	c.JSON(http.StatusOK, gin.H{"message": "Ad updated successfully"})
	log.Println("=== [UpdateAd] Completed ===")
}

// ===============================
// Delete Advertisement (with image cleanup)
// ===============================
func DeleteAd(c *gin.Context) {
	log.Println("=== [DeleteAd] Called ===")

	adID := c.Param("id")
	log.Printf("[DEBUG] Deleting ad with ID: %s", adID)

	// 1. Fetch media_id and corresponding cloudinary_id before deleting ad
	var mediaID *int
	var cloudinaryID *string

	err := config.DB.QueryRow(`
		SELECT media_id,
		       (SELECT cloudinary_id FROM images WHERE id = ads.media_id)
		FROM ads WHERE id = $1
	`, adID).Scan(&mediaID, &cloudinaryID)

	if err != nil && err != sql.ErrNoRows {
		log.Printf("[ERROR] Failed to fetch ad media info: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch ad info"})
		return
	}

	// 2. Delete the ad record
	res, err := config.DB.Exec(`DELETE FROM ads WHERE id = $1`, adID)
	if err != nil {
		log.Printf("[ERROR] Failed to delete ad: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete ad"})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		log.Printf("[WARN] No ad found to delete (adID=%s)", adID)
		c.JSON(http.StatusNotFound, gin.H{"error": "Ad not found"})
		return
	}

	// 3. Delete media record and Cloudinary asset if present
	if mediaID != nil {
		_, delErr := config.DB.Exec(`DELETE FROM images WHERE id = $1`, *mediaID)
		if delErr != nil {
			log.Printf("[WARN] Failed to delete image record for media_id=%d: %v", *mediaID, delErr)
		} else {
			log.Printf("[INFO] Deleted image record (media_id=%d)", *mediaID)
		}
	}

	if cloudinaryID != nil {
		if err := cloudinary.DeleteImage(*cloudinaryID); err != nil {
			log.Printf("[WARN] Failed to delete Cloudinary asset: %v", err)
		} else {
			log.Printf("[INFO] Deleted Cloudinary image (cloudinary_id=%s)", *cloudinaryID)
		}
	}

	// 4. Final success log and response
	log.Printf("[SUCCESS] Ad ID %s and its media (if any) deleted successfully", adID)
	c.JSON(http.StatusOK, gin.H{"message": "Ad deleted successfully", "ad_id": adID})
	log.Println("=== [DeleteAd] Completed ===")
}

func Display_ads(c *gin.Context) {
	log.Println("=== [Display_ads] Called ===")

	query := `SELECT * FROM ads WHERE status='enabled'`
	log.Println("[INFO] Fetching all enabled ads...")
	rows, err := config.DB.Query(query)
	if err != nil {
		log.Printf("[ERROR] Failed to fetch ads: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch ads: %v", err)})
		return
	}
	defer rows.Close()

	// ✅ Temporary struct to hold extra fields (likes_count, comments_count)
	type tempAd struct {
		ID            int64          `json:"id"`
		CampaignID    int64          `json:"campaign_id"`
		Headline      string         `json:"headline"`
		Audience      string         `json:"audience"`
		Location      string         `json:"location"`
		MediaType     string         `json:"media_type"`
		MediaURL      string         `json:"media_url"`
		BidStrategy   string         `json:"bid_strategy"`
		EnableAR      bool           `json:"enable_ar"`
		ARURL         sql.NullString `json:"ar_url"`
		Status        string         `json:"status"`
		CreatedAt     time.Time      `json:"created_at"`
		UpdatedAt     time.Time      `json:"updated_at"`
		LikesCount    int64          `json:"likes_count"`
		CommentsCount int64          `json:"comments_count"`
	}

	var ads []tempAd
	for rows.Next() {
		var ad tempAd
		if err := rows.Scan(
			&ad.ID, &ad.CampaignID, &ad.Headline, &ad.Audience, &ad.Location,
			&ad.MediaType, &ad.MediaURL, &ad.BidStrategy, &ad.EnableAR,
			&ad.ARURL, &ad.Status, &ad.CreatedAt, &ad.UpdatedAt,
			&ad.LikesCount, &ad.CommentsCount,
		); err != nil {
			log.Printf("[ERROR] Failed to scan ad row: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to scan ad: %v", err)})
			continue
		}
		ads = append(ads, ad)
	}

	log.Printf("[SUCCESS] Retrieved %d enabled ads", len(ads))
	c.JSON(http.StatusOK, ads)
	log.Println("=== [Display_ads] Completed ===")
}

func PublishAd(c *gin.Context) {
	var req struct {
		AdID      int `json:"ad_id"`
		Publisher int `json:"publisher"`
	}

	// Bind JSON
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Safety check
	if req.AdID == 0 || req.Publisher == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ad_id and publisher are required"})
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	// ✅ Check if the ad is already published by this user
	var exists bool
	checkQuery := `SELECT EXISTS (
		SELECT 1 FROM published_ads WHERE ad_id = $1 AND publisher = $2
	)`
	err = tx.QueryRow(checkQuery, req.AdID, req.Publisher).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to check existing publish: %v", err)})
		return
	}

	if exists {
		c.JSON(http.StatusConflict, gin.H{
			"error": fmt.Sprintf("Ad %d is already published by user %d", req.AdID, req.Publisher),
		})
		return
	}

	// Insert new published record
	query := `
		INSERT INTO published_ads (ad_id, publisher, published_at)
		VALUES ($1, $2, CURRENT_TIMESTAMP)
		RETURNING id, published_at
	`

	var pubID int
	var publishedAt time.Time
	err = tx.QueryRow(query, req.AdID, req.Publisher).Scan(&pubID, &publishedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to publish ad: %v", err)})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":      "Ad published successfully",
		"published_id": pubID,
		"ad_id":        req.AdID,
		"publisher":    req.Publisher,
		"published_at": publishedAt,
	})
}

/// removing ads from published_ads function

func UnpublishAd(adID int, publisherID int) error {
	_, err := config.DB.Exec(
		`DELETE FROM published_ads WHERE ad_id = $1 AND publisher = $2`,
		adID, publisherID,
	)
	return err
}

// unpublish ad api function

func UnpublishAdHandler(c *gin.Context) {
	var req struct {
		AdID      int `json:"ad_id"`
		Publisher int `json:"publisher"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.AdID == 0 || req.Publisher == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ad_id and publisher are required"})
		return
	}

	err := UnpublishAd(req.AdID, req.Publisher)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to unpublish ad: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ad unpublished successfully"})
}

func GetAllPublishedAds(c *gin.Context) {
	query := `
		SELECT
			pa.id AS published_id,
			pa.ad_id AS published_ad_id,
			pa.publisher,
			pa.published_at,
			a.id AS ad_id, a.campaign_id, a.headline, a.audience, a.location,
			a.media_type, a.media_url, a.bid_strategy, a.enable_ar, a.ar_url,
			a.status, a.created_at, a.updated_at,
			a.likes_count, a.comments_count,
			g.id AS gamification_id, g.brand_id, g.ad_id AS gam_ad_id, g.points,
			g.description, g.media_url AS gam_media_url, g.created_at AS gam_created_at,
			g.expire_date
		FROM published_ads pa
		JOIN ads a ON pa.ad_id = a.id
		LEFT JOIN gamifications g ON a.id = g.ad_id
		ORDER BY pa.published_at DESC;
	`

	log.Println("[INFO] Executing GetAllPublishedAds query...")
	rows, err := config.DB.Query(query)
	if err != nil {
		log.Printf("[ERROR] Failed to query published ads: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to query published ads: %v", err)})
		return
	}
	defer rows.Close()

	type tempAd struct {
		ID            int64          `json:"id"`
		CampaignID    string         `json:"campaign_id"`
		Headline      string         `json:"headline"`
		Audience      string         `json:"audience"`
		Location      string         `json:"location"`
		MediaType     string         `json:"media_type"`
		MediaURL      string         `json:"media_url"`
		BidStrategy   string         `json:"bid_strategy"`
		EnableAR      bool           `json:"enable_ar"`
		ARURL         sql.NullString `json:"ar_url"`
		Status        string         `json:"status"`
		CreatedAt     time.Time      `json:"created_at"`
		UpdatedAt     time.Time      `json:"updated_at"`
		LikesCount    int64          `json:"likes_count"`
		CommentsCount int64          `json:"comments_count"`
	}

	type publishedAdResponse struct {
		Published    models.Published_Ads `json:"published_ad"`
		Ad           tempAd               `json:"ad"`
		Gamification models.Gamification  `json:"gamification"`
	}

	var results []publishedAdResponse
	count := 0

	for rows.Next() {
		var (
			paID, paAdID, paPublisher                       sql.NullInt64
			paPublished                                     sql.NullTime
			aID                                             sql.NullInt64
			aCampaignID, aHeadline, aAudience, aLocation    sql.NullString
			aMediaType, aMediaURL, aBidStr, aARURL, aStatus sql.NullString
			aEnableAR                                       sql.NullBool
			aCreated, aUpdated                              sql.NullTime
			aLikesCount, aCommentsCount                     sql.NullInt64
			gID, gBrandID, gAdID, gPoints                   sql.NullInt64
			gDescription, gMediaURL                         sql.NullString
			gCreatedAt, gExpireDate                         sql.NullTime
		)

		if err := rows.Scan(
			&paID, &paAdID, &paPublisher, &paPublished,
			&aID, &aCampaignID, &aHeadline, &aAudience, &aLocation,
			&aMediaType, &aMediaURL, &aBidStr, &aEnableAR, &aARURL,
			&aStatus, &aCreated, &aUpdated,
			&aLikesCount, &aCommentsCount,
			&gID, &gBrandID, &gAdID, &gPoints, &gDescription, &gMediaURL,
			&gCreatedAt, &gExpireDate,
		); err != nil {
			log.Printf("[ERROR] Row scan failed: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to scan published ad row: %v", err)})
			return
		}

		pub := models.Published_Ads{}
		if paID.Valid {
			pub.ID = int(paID.Int64)
		}
		if paAdID.Valid {
			pub.AdID = int(paAdID.Int64)
		}
		if paPublisher.Valid {
			pub.Publisher = int(paPublisher.Int64)
		}
		if paPublished.Valid {
			pub.PublishedAt = paPublished.Time
		}

		ad := tempAd{}
		if aID.Valid {
			ad.ID = aID.Int64
		}
		ad.CampaignID = aCampaignID.String
		ad.Headline = aHeadline.String
		ad.Audience = aAudience.String
		ad.Location = aLocation.String
		ad.MediaType = aMediaType.String
		ad.MediaURL = aMediaURL.String
		ad.BidStrategy = aBidStr.String
		ad.EnableAR = aEnableAR.Bool
		ad.ARURL = aARURL
		ad.Status = aStatus.String
		ad.CreatedAt = aCreated.Time
		ad.UpdatedAt = aUpdated.Time
		ad.LikesCount = aLikesCount.Int64
		ad.CommentsCount = aCommentsCount.Int64

		gamification := models.Gamification{}
		if gID.Valid {
			gamification.ID = int(gID.Int64)
		}
		if gBrandID.Valid {
			gamification.BrandID = int(gBrandID.Int64)
		}
		if gAdID.Valid {
			gamification.AdID = int(gAdID.Int64)
		}
		if gPoints.Valid {
			gamification.Points = int(gPoints.Int64)
		}
		gamification.Description = gDescription.String
		gamification.MediaURL = gMediaURL.String
		if gCreatedAt.Valid {
			gamification.CreatedAt = gCreatedAt.Time
		}
		if gExpireDate.Valid {
			gamification.ExpireDate = gExpireDate.Time
		}

		results = append(results, publishedAdResponse{
			Published:    pub,
			Ad:           ad,
			Gamification: gamification,
		})
		count++
	}

	if err := rows.Err(); err != nil {
		log.Printf("[ERROR] Row iteration error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Row iteration error: %v", err)})
		return
	}

	log.Printf("[INFO] Successfully fetched %d published ads.\n", count)
	c.JSON(http.StatusOK, results)
}

// like ad

func LikeAd(c *gin.Context) {
	log.Println("=== [LikeAd] Called ===")

	adID := c.Param("id")
	userID := c.Query("user_id") // TODO: replace with JWT later
	log.Printf("[DEBUG] Like Request => AdID: %s | UserID: %s", adID, userID)

	var existing int
	err := config.DB.QueryRow(`SELECT COUNT(*) FROM ad_likes WHERE user_id=$1 AND ad_id=$2`, userID, adID).Scan(&existing)
	if err != nil {
		log.Printf("[ERROR] Checking existing like failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking like"})
		return
	}
	if existing > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already liked"})
		return
	}

	_, err = config.DB.Exec(`INSERT INTO ad_likes (user_id, ad_id) VALUES ($1,$2)`, userID, adID)
	if err != nil {
		log.Printf("[ERROR] Inserting like failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like ad"})
		return
	}

	_, _ = config.DB.Exec(`UPDATE ads SET likes_count = COALESCE(likes_count,0) + 1 WHERE id = $1`, adID)

	log.Println("[SUCCESS] Ad liked successfully")
	c.JSON(http.StatusOK, gin.H{"message": "Ad liked successfully"})
}

// unlike ad
func UnlikeAd(c *gin.Context) {
	log.Println("=== [UnlikeAd] Called ===")

	adID := c.Param("id")
	userID := c.Query("user_id")
	log.Printf("[DEBUG] Unlike Request => AdID: %s | UserID: %s", adID, userID)

	res, err := config.DB.Exec(`DELETE FROM ad_likes WHERE user_id=$1 AND ad_id=$2`, userID, adID)
	if err != nil {
		log.Printf("[ERROR] Deleting like failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlike ad"})
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Like not found"})
		return
	}

	_, _ = config.DB.Exec(`UPDATE ads SET likes_count = GREATEST(COALESCE(likes_count,1) - 1, 0) WHERE id = $1`, adID)

	log.Println("[SUCCESS] Ad unliked successfully")
	c.JSON(http.StatusOK, gin.H{"message": "Ad unliked successfully"})
}

// add comments

func AddAdComment(c *gin.Context) {
	log.Println("=== [AddAdComment] Called ===")

	// 1. Bind the incoming JSON
	var input models.AdComment
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("[ERROR] Binding JSON failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.CreatedAt = time.Now()

	// 2. INSERT the raw comment and get the generated ID
	insertQuery := `
        INSERT INTO ad_comments (ad_id, user_id, text, created_at)
        VALUES ($1, $2, $3, $4) 
        RETURNING id
    `
	var newCommentID int
	err := config.DB.QueryRow(insertQuery,
		input.AdID,
		input.UserID,
		input.Text,
		input.CreatedAt,
	).Scan(&newCommentID)

	if err != nil {
		log.Printf("[ERROR] Insert ad comment failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add comment"})
		return
	}

	// 3. Increment comment count on the ad
	_, _ = config.DB.Exec(`UPDATE ads SET comments_count = COALESCE(comments_count,0) + 1 WHERE id = $1`, input.AdID)

	// 4. FETCH the full details (JOIN with Users) for the comment we just created
	fetchQuery := `
        SELECT 
            c.id, c.ad_id, c.user_id, c.text, c.created_at,
            u.id, u.username, u.full_name, u.image_url
        FROM ad_comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1
    `

	var fullComment models.AdComment
	var commentUser models.User // Temp struct to hold user data

	err = config.DB.QueryRow(fetchQuery, newCommentID).Scan(
		&fullComment.ID,
		&fullComment.AdID,
		&fullComment.UserID,
		&fullComment.Text,
		&fullComment.CreatedAt,
		&commentUser.ID,
		&commentUser.Username,
		&commentUser.FullName,
		&commentUser.ImageURL,
	)

	if err != nil {
		log.Printf("[ERROR] Fetching full ad comment details failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Comment created but failed to fetch details"})
		return
	}

	// Nest the user details so React (c.user.username) works correctly
	fullComment.User = commentUser

	log.Printf("[SUCCESS] Ad Comment added and enriched: ID %d", fullComment.ID)

	// 5. Return the Enriched Object
	c.JSON(http.StatusCreated, fullComment)
}

// delete comment
func DeleteAdComment(c *gin.Context) {
	log.Println("=== [DeleteAdComment] Called ===")

	commentID := c.Param("comment_id")
	adID := c.Param("id")
	log.Printf("[DEBUG] Deleting comment ID: %s from Ad ID: %s", commentID, adID)

	res, err := config.DB.Exec(`DELETE FROM ad_comments WHERE id=$1 AND ad_id=$2`, commentID, adID)
	if err != nil {
		log.Printf("[ERROR] Deleting comment failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comment"})
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}

	_, _ = config.DB.Exec(`UPDATE ads SET comments_count = GREATEST(COALESCE(comments_count,1) - 1, 0) WHERE id = $1`, adID)

	log.Printf("[SUCCESS] Comment ID %s deleted successfully", commentID)
	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}

func GetCommentsByAd(c *gin.Context) {
	log.Println("=== [GetCommentsByAd] Called ===")

	adID := c.Param("id")
	log.Printf("[DEBUG] Fetching comments for AdID: %s", adID)

	// Updated Query to include ad_id, user_id, and full_name
	query := `
        SELECT 
            c.id, c.ad_id, c.user_id, c.text, c.created_at,
            u.id, u.username, u.full_name, u.image_url
        FROM ad_comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.ad_id = $1
        ORDER BY c.created_at DESC
    `

	rows, err := config.DB.Query(query, adID)
	if err != nil {
		log.Printf("[ERROR] Querying comments failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}
	defer rows.Close()

	var comments []models.AdComment

	for rows.Next() {
		var comment models.AdComment
		var user models.User

		// Updated Scan to match the new SELECT order
		// Note: If full_name or image_url can be NULL in your DB,
		// you might need to use sql.NullString here, but I followed your snippet pattern.
		if err := rows.Scan(
			&comment.ID,
			&comment.AdID,
			&comment.UserID,
			&comment.Text,
			&comment.CreatedAt,
			&user.ID,
			&user.Username,
			&user.FullName,
			&user.ImageURL,
		); err != nil {
			log.Printf("[ERROR] Row scan failed: %v", err)
			continue
		}

		// Attach user details to the comment
		comment.User = user
		comments = append(comments, comment)
	}

	if err = rows.Err(); err != nil {
		log.Printf("[ERROR] Rows iteration error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing comments"})
		return
	}

	log.Printf("[INFO] Total comments fetched: %d", len(comments))
	c.JSON(http.StatusOK, comments)
}

// get likes of ad
func GetLikesByAd(c *gin.Context) {
	log.Println("=== [GetLikesByAd] Called ===")

	adID := c.Param("id")
	log.Printf("[DEBUG] Fetching likes for AdID: %s", adID)

	rows, err := config.DB.Query(`
		SELECT l.id, u.id, u.username, u.image_url
		FROM ad_likes l
		JOIN users u ON l.user_id = u.id
		WHERE l.ad_id = $1
		ORDER BY l.id DESC
	`, adID)
	if err != nil {
		log.Printf("[ERROR] Querying likes failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch likes"})
		return
	}
	defer rows.Close()

	var likes []models.AdLike
	for rows.Next() {
		var like models.AdLike
		var user models.User

		if err := rows.Scan(&like.ID, &user.ID, &user.Username, &user.ImageURL); err != nil {
			log.Printf("[ERROR] Row scan failed: %v", err)
			continue
		}

		like.User = user
		likes = append(likes, like)
	}

	log.Printf("[INFO] Total likes fetched: %d", len(likes))
	c.JSON(http.StatusOK, likes)
}

// get ads liked by user

func GetAdsLikedByUser(c *gin.Context) {
	log.Println("=== [GetAdsLikedByUser] Called ===")

	userID := c.Param("user_id")
	log.Printf("[DEBUG] Fetching ads liked by UserID: %s", userID)

	rows, err := config.DB.Query(`
		SELECT 
			l.id,
			a.id, a.campaign_id, a.headline, a.audience, a.location,
			a.media_type, a.media_url, a.media_id, a.bid_strategy,
			a.enable_ar, a.ar_url, a.status, a.created_at, a.updated_at
		FROM ad_likes l
		JOIN ads a ON l.ad_id = a.id
		WHERE l.user_id = $1
		ORDER BY l.id DESC
	`, userID)
	if err != nil {
		log.Printf("[ERROR] Querying liked ads failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch liked ads"})
		return
	}
	defer rows.Close()

	var likedAds []models.AdLike

	for rows.Next() {
		var like models.AdLike
		var ad models.Ad

		if err := rows.Scan(
			&like.ID,
			&ad.ID, &ad.CampaignID, &ad.Headline, &ad.Audience, &ad.Location,
			&ad.MediaType, &ad.MediaURL, &ad.MediaId, &ad.BidStrategy,
			&ad.EnableAR, &ad.ARURL, &ad.Status, &ad.CreatedAt, &ad.UpdatedAt,
		); err != nil {
			log.Printf("[ERROR] Row scan failed: %v", err)
			continue
		}

		like.Ad = ad
		likedAds = append(likedAds, like)
	}

	log.Printf("[INFO] Total liked ads fetched: %d", len(likedAds))
	c.JSON(http.StatusOK, likedAds)
}
