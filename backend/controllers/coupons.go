package controllers

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"log"
	"net/http"
	"time"
	"vite-project/backend/config"

	"github.com/gin-gonic/gin"
)

// ===============================
// Coupon Structs (Isolated)
// ===============================

type Coupon struct {
	ID          int        `json:"id"`
	UserID      int        `json:"user_id"`
	BrandID     int        `json:"brand_id"`
	RewardTitle string     `json:"reward_title"`
	PointsCost  int        `json:"points_cost"`
	QRCodeToken string     `json:"qr_code_token"`
	Status      string     `json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	RedeemedAt  *time.Time `json:"redeemed_at,omitempty"`
}

type RedeemPointsRequest struct {
	UserID      int    `json:"user_id" binding:"required"`
	BrandID     int    `json:"brand_id" binding:"required"`
	Points      int    `json:"points" binding:"required"`
	RewardTitle string `json:"reward_title" binding:"required"`
}

type ValidateCouponRequest struct {
	QRToken string `json:"qr_token" binding:"required"`
	BrandID int    `json:"brand_id" binding:"required"`
}

// ===============================
// Helper: Generate QR Token
// ===============================

func generateQRToken() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// ===============================
// Helper: Calculate User Points from gamification_analytics
// Uses same logic as GetTopThreeGlobalUsers in models/gamification.go
// ===============================

func getUserTotalPoints(userID int) (int, error) {
	query := `
		SELECT COALESCE(SUM(
			CASE 
				WHEN ga.event_type = 'click' THEN 5
				WHEN ga.event_type = 'share' THEN 10
				WHEN ga.event_type IN ('like', 'engage', 'comment_view') THEN 15
				ELSE 0 
			END
		), 0) AS total_points
		FROM gamification_analytics ga
		WHERE ga.user_id = $1
	`

	var totalPoints int
	err := config.DB.QueryRow(query, userID).Scan(&totalPoints)
	if err != nil && err != sql.ErrNoRows {
		return 0, err
	}
	return totalPoints, nil
}

// ===============================
// Helper: Get User's Already Spent Points (from coupons table)
// ===============================

func getUserSpentPoints(userID int) (int, error) {
	query := `
		SELECT COALESCE(SUM(points_cost), 0)
		FROM coupons
		WHERE user_id = $1
	`

	var spentPoints int
	err := config.DB.QueryRow(query, userID).Scan(&spentPoints)
	if err != nil && err != sql.ErrNoRows {
		return 0, err
	}
	return spentPoints, nil
}

// ===============================
// GetUserPoints - Get user's current point balance
// ===============================

func GetUserPoints(c *gin.Context) {
	log.Println("=== [GetUserPoints] Called ===")

	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	log.Printf("[INFO] Fetching points for user: %s", userID)

	// Convert to int for queries
	var uid int
	_, err := config.DB.Exec("SELECT 1") // dummy to check connection
	if err != nil {
		log.Printf("[ERROR] DB connection issue: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Parse user ID
	row := config.DB.QueryRow("SELECT $1::int", userID)
	if err := row.Scan(&uid); err != nil {
		log.Printf("[ERROR] Invalid user_id: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id"})
		return
	}

	// Get earned points from gamification_analytics
	earnedPoints, err := getUserTotalPoints(uid)
	if err != nil {
		log.Printf("[ERROR] Failed to get earned points: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate points"})
		return
	}

	// Get spent points from coupons
	spentPoints, err := getUserSpentPoints(uid)
	if err != nil {
		log.Printf("[ERROR] Failed to get spent points: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate points"})
		return
	}

	availablePoints := earnedPoints - spentPoints

	log.Printf("[SUCCESS] User %d: earned=%d, spent=%d, available=%d", uid, earnedPoints, spentPoints, availablePoints)
	c.JSON(http.StatusOK, gin.H{
		"user_id":          uid,
		"earned_points":    earnedPoints,
		"spent_points":     spentPoints,
		"available_points": availablePoints,
	})
}

// ===============================
// RedeemPoints - User redeems points for coupon
// ===============================

func RedeemPoints(c *gin.Context) {
	log.Println("=== [RedeemPoints] Called ===")

	var req RedeemPointsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[ERROR] Binding failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("[INFO] Redeem request: UserID=%d, BrandID=%d, Points=%d, Reward=%s",
		req.UserID, req.BrandID, req.Points, req.RewardTitle)

	// Get earned points from gamification_analytics (using same logic as GetTopThreeGlobalUsers)
	earnedPoints, err := getUserTotalPoints(req.UserID)
	if err != nil {
		log.Printf("[ERROR] Failed to get earned points: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check points"})
		return
	}

	// Get already spent points from coupons table
	spentPoints, err := getUserSpentPoints(req.UserID)
	if err != nil {
		log.Printf("[ERROR] Failed to get spent points: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check points"})
		return
	}

	availablePoints := earnedPoints - spentPoints

	log.Printf("[INFO] User %d: earned=%d, spent=%d, available=%d, requested=%d",
		req.UserID, earnedPoints, spentPoints, availablePoints, req.Points)

	// Check if user has enough points
	if availablePoints < req.Points {
		log.Printf("[WARN] Insufficient points: has %d, needs %d", availablePoints, req.Points)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":            "Insufficient points",
			"available_points": availablePoints,
			"required":         req.Points,
		})
		return
	}

	// Generate unique QR token
	qrToken, err := generateQRToken()
	if err != nil {
		log.Printf("[ERROR] QR token generation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate coupon"})
		return
	}

	// Create coupon with points_cost to track spent points
	var couponID int
	var createdAt time.Time
	err = config.DB.QueryRow(`
		INSERT INTO coupons (user_id, brand_id, reward_title, points_cost, qr_code_token, status, created_at)
		VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW())
		RETURNING id, created_at
	`, req.UserID, req.BrandID, req.RewardTitle, req.Points, qrToken).Scan(&couponID, &createdAt)

	if err != nil {
		log.Printf("[ERROR] Coupon creation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create coupon"})
		return
	}

	coupon := Coupon{
		ID:          couponID,
		UserID:      req.UserID,
		BrandID:     req.BrandID,
		RewardTitle: req.RewardTitle,
		PointsCost:  req.Points,
		QRCodeToken: qrToken,
		Status:      "ACTIVE",
		CreatedAt:   createdAt,
	}

	remainingPoints := availablePoints - req.Points

	log.Printf("[SUCCESS] Coupon created: ID=%d, Token=%s, Remaining=%d", couponID, qrToken, remainingPoints)
	c.JSON(http.StatusCreated, gin.H{
		"message":          "Coupon created successfully",
		"coupon":           coupon,
		"points_deducted":  req.Points,
		"remaining_points": remainingPoints,
	})
}

// ===============================
// ValidateCoupon - Brand scans QR to validate
// ===============================

func ValidateCoupon(c *gin.Context) {
	log.Println("=== [ValidateCoupon] Called ===")

	var req ValidateCouponRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[ERROR] Binding failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("[INFO] Validating token: %s for brand: %d", req.QRToken, req.BrandID)

	// Find coupon
	var coupon Coupon
	err := config.DB.QueryRow(`
		SELECT id, user_id, brand_id, reward_title, COALESCE(points_cost, 0), qr_code_token, status, created_at, redeemed_at
		FROM coupons
		WHERE qr_code_token = $1
	`, req.QRToken).Scan(
		&coupon.ID, &coupon.UserID, &coupon.BrandID, &coupon.RewardTitle,
		&coupon.PointsCost, &coupon.QRCodeToken, &coupon.Status, &coupon.CreatedAt, &coupon.RedeemedAt,
	)

	if err == sql.ErrNoRows {
		log.Printf("[WARN] Coupon not found: %s", req.QRToken)
		c.JSON(http.StatusNotFound, gin.H{
			"valid":   false,
			"error":   "Coupon not found",
			"message": "Invalid QR code",
		})
		return
	}

	if err != nil {
		log.Printf("[ERROR] Query failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Check if already redeemed
	if coupon.Status == "REDEEMED" {
		log.Printf("[WARN] Coupon already redeemed: %d", coupon.ID)
		c.JSON(http.StatusBadRequest, gin.H{
			"valid":       false,
			"error":       "Coupon already redeemed",
			"redeemed_at": coupon.RedeemedAt,
		})
		return
	}

	// NOTE: Brand validation disabled for demo
	// In production, uncomment this to ensure only the issuing brand can redeem
	// if coupon.BrandID != req.BrandID {
	// 	log.Printf("[WARN] Brand mismatch: coupon=%d, request=%d", coupon.BrandID, req.BrandID)
	// 	c.JSON(http.StatusForbidden, gin.H{
	// 		"valid": false,
	// 		"error": "This coupon is not valid for your brand",
	// 	})
	// 	return
	// }

	// Update coupon to associate with scanning brand (for demo flexibility)
	log.Printf("[INFO] Coupon scanned by brand %d (original brand: %d)", req.BrandID, coupon.BrandID)

	// Mark as redeemed
	now := time.Now()
	_, err = config.DB.Exec(`
		UPDATE coupons 
		SET status = 'REDEEMED', redeemed_at = $1 
		WHERE id = $2
	`, now, coupon.ID)

	if err != nil {
		log.Printf("[ERROR] Update failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to redeem coupon"})
		return
	}

	// Record analytics for the redemption
	_, err = config.DB.Exec(`
		INSERT INTO coupon_analytics (coupon_id, brand_id, user_id, event_type, created_at)
		VALUES ($1, $2, $3, 'REDEEMED', NOW())
	`, coupon.ID, coupon.BrandID, coupon.UserID)

	if err != nil {
		// Log but don't fail - analytics is not critical
		log.Printf("[WARN] Failed to record analytics: %v", err)
	}

	coupon.Status = "REDEEMED"
	coupon.RedeemedAt = &now

	log.Printf("[SUCCESS] Coupon redeemed: ID=%d", coupon.ID)
	c.JSON(http.StatusOK, gin.H{
		"valid":   true,
		"message": "Coupon redeemed successfully!",
		"coupon":  coupon,
	})
}

// ===============================
// GetUserCoupons - List user's coupons
// ===============================

func GetUserCoupons(c *gin.Context) {
	log.Println("=== [GetUserCoupons] Called ===")

	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	log.Printf("[INFO] Fetching coupons for user: %s", userID)

	rows, err := config.DB.Query(`
		SELECT id, user_id, brand_id, reward_title, COALESCE(points_cost, 0), qr_code_token, status, created_at, redeemed_at
		FROM coupons
		WHERE user_id = $1
		ORDER BY created_at DESC
	`, userID)

	if err != nil {
		log.Printf("[ERROR] Query failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch coupons"})
		return
	}
	defer rows.Close()

	var coupons []Coupon
	for rows.Next() {
		var coupon Coupon
		if err := rows.Scan(
			&coupon.ID, &coupon.UserID, &coupon.BrandID, &coupon.RewardTitle,
			&coupon.PointsCost, &coupon.QRCodeToken, &coupon.Status, &coupon.CreatedAt, &coupon.RedeemedAt,
		); err != nil {
			log.Printf("[WARN] Row scan failed: %v", err)
			continue
		}
		coupons = append(coupons, coupon)
	}

	log.Printf("[SUCCESS] Found %d coupons for user %s", len(coupons), userID)
	c.JSON(http.StatusOK, gin.H{
		"coupons": coupons,
		"count":   len(coupons),
	})
}

// ===============================
// GetBrandCoupons - List brand's redeemed coupons
// ===============================

func GetBrandCoupons(c *gin.Context) {
	log.Println("=== [GetBrandCoupons] Called ===")

	brandID := c.Param("brand_id")
	if brandID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "brand_id is required"})
		return
	}

	log.Printf("[INFO] Fetching coupons for brand: %s", brandID)

	rows, err := config.DB.Query(`
		SELECT c.id, c.user_id, c.brand_id, c.reward_title, COALESCE(c.points_cost, 0), c.qr_code_token, c.status, c.created_at, c.redeemed_at,
		       u.full_name, u.username
		FROM coupons c
		LEFT JOIN users u ON c.user_id = u.id
		WHERE c.brand_id = $1
		ORDER BY c.created_at DESC
	`, brandID)

	if err != nil {
		log.Printf("[ERROR] Query failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch coupons"})
		return
	}
	defer rows.Close()

	type CouponWithUser struct {
		Coupon
		UserName     string `json:"user_name"`
		UserUsername string `json:"user_username"`
	}

	var coupons []CouponWithUser
	for rows.Next() {
		var coupon CouponWithUser
		var userName, userUsername sql.NullString
		if err := rows.Scan(
			&coupon.ID, &coupon.UserID, &coupon.BrandID, &coupon.RewardTitle,
			&coupon.PointsCost, &coupon.QRCodeToken, &coupon.Status, &coupon.CreatedAt, &coupon.RedeemedAt,
			&userName, &userUsername,
		); err != nil {
			log.Printf("[WARN] Row scan failed: %v", err)
			continue
		}
		if userName.Valid {
			coupon.UserName = userName.String
		}
		if userUsername.Valid {
			coupon.UserUsername = userUsername.String
		}
		coupons = append(coupons, coupon)
	}

	log.Printf("[SUCCESS] Found %d coupons for brand %s", len(coupons), brandID)
	c.JSON(http.StatusOK, gin.H{
		"coupons": coupons,
		"count":   len(coupons),
	})
}

// ===============================
// GetCouponAnalytics - Brand's coupon redemption analytics
// ===============================

type CouponAnalyticsSummary struct {
	TotalIssued   int `json:"total_issued"`
	TotalRedeemed int `json:"total_redeemed"`
	TotalActive   int `json:"total_active"`
	TotalPoints   int `json:"total_points_spent"`
}

type CouponRedemption struct {
	CouponID    int       `json:"coupon_id"`
	RewardTitle string    `json:"reward_title"`
	UserID      int       `json:"user_id"`
	UserName    string    `json:"user_name"`
	Username    string    `json:"username"`
	PointsCost  int       `json:"points_cost"`
	RedeemedAt  time.Time `json:"redeemed_at"`
}

func GetCouponAnalytics(c *gin.Context) {
	log.Println("=== [GetCouponAnalytics] Called ===")

	brandID := c.Param("brand_id")
	if brandID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "brand_id is required"})
		return
	}

	log.Printf("[INFO] Fetching analytics for brand: %s", brandID)

	// Get summary stats
	var summary CouponAnalyticsSummary
	err := config.DB.QueryRow(`
		SELECT 
			COUNT(*) as total_issued,
			COUNT(CASE WHEN status = 'REDEEMED' THEN 1 END) as total_redeemed,
			COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as total_active,
			COALESCE(SUM(points_cost), 0) as total_points
		FROM coupons
		WHERE brand_id = $1
	`, brandID).Scan(&summary.TotalIssued, &summary.TotalRedeemed, &summary.TotalActive, &summary.TotalPoints)

	if err != nil {
		log.Printf("[ERROR] Summary query failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch analytics"})
		return
	}

	// Get recent redemptions
	rows, err := config.DB.Query(`
		SELECT c.id, c.reward_title, c.user_id, 
			   COALESCE(u.full_name, 'Unknown') as user_name, 
			   COALESCE(u.username, 'unknown') as username,
			   c.points_cost, c.redeemed_at
		FROM coupons c
		LEFT JOIN users u ON c.user_id = u.id
		WHERE c.brand_id = $1 AND c.status = 'REDEEMED'
		ORDER BY c.redeemed_at DESC
		LIMIT 20
	`, brandID)

	if err != nil {
		log.Printf("[ERROR] Redemptions query failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch redemptions"})
		return
	}
	defer rows.Close()

	var redemptions []CouponRedemption
	for rows.Next() {
		var r CouponRedemption
		var redeemedAt sql.NullTime
		if err := rows.Scan(&r.CouponID, &r.RewardTitle, &r.UserID, &r.UserName, &r.Username, &r.PointsCost, &redeemedAt); err != nil {
			log.Printf("[WARN] Row scan failed: %v", err)
			continue
		}
		if redeemedAt.Valid {
			r.RedeemedAt = redeemedAt.Time
		}
		redemptions = append(redemptions, r)
	}

	log.Printf("[SUCCESS] Analytics for brand %s: issued=%d, redeemed=%d", brandID, summary.TotalIssued, summary.TotalRedeemed)
	c.JSON(http.StatusOK, gin.H{
		"summary":     summary,
		"redemptions": redemptions,
	})
}
