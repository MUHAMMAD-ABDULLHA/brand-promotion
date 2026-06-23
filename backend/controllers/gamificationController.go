package controllers

import (
	"log"
	"net/http"
	"strconv"
	"time"
	"vite-project/backend/models"

	"github.com/gin-gonic/gin"
)

// =========================
// CREATE GAMIFICATION
// =========================
func CreateGamificationHandler(c *gin.Context) {
	log.Println("CreateGamificationHandler: Request received")

	var g models.Gamification
	if err := c.ShouldBindJSON(&g); err != nil {
		log.Printf("CreateGamificationHandler: Invalid request body: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	if g.BrandID == 0 {
		log.Println("CreateGamificationHandler: Missing brand_id")
		c.JSON(http.StatusBadRequest, gin.H{"error": "brand_id is required"})
		return
	}

	if err := models.CreateGamification(&g); err != nil {
		log.Printf("CreateGamificationHandler: Failed to create gamification in DB: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create gamification"})
		return
	}

	log.Printf("CreateGamificationHandler: Successfully created gamification ID: %d for Brand: %d", g.ID, g.BrandID)
	c.JSON(http.StatusOK, gin.H{
		"message": "Gamification created successfully",
		"data":    g,
	})
}

// =========================
// GET SINGLE GAMIFICATION
// =========================
func GetGamificationByIDHandler(c *gin.Context) {
	idParam := c.Param("id")
	log.Printf("GetGamificationByIDHandler: Request received for ID: %s", idParam)

	id, err := strconv.Atoi(idParam)
	if err != nil {
		log.Printf("GetGamificationByIDHandler: Invalid ID format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid gamification ID"})
		return
	}

	g, err := models.GetGamificationByID(id)
	if err != nil {
		log.Printf("GetGamificationByIDHandler: Gamification not found for ID %d: %v", id, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Gamification not found"})
		return
	}

	log.Printf("GetGamificationByIDHandler: Successfully retrieved gamification ID: %d", id)
	c.JSON(http.StatusOK, gin.H{"data": g})
}

// =========================
// GET GAMIFICATIONS BY BRAND
// =========================
func GetGamificationsByBrandHandler(c *gin.Context) {
	brandIDParam := c.Param("brand_id")
	log.Printf("GetGamificationsByBrandHandler: Request received for Brand ID: %s", brandIDParam)

	brandID, err := strconv.Atoi(brandIDParam)
	if err != nil {
		log.Printf("GetGamificationsByBrandHandler: Invalid Brand ID format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid brand ID"})
		return
	}

	list, err := models.GetGamificationsByBrand(brandID)
	if err != nil {
		log.Printf("GetGamificationsByBrandHandler: DB error getting gamifications: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch gamifications"})
		return
	}

	log.Printf("GetGamificationsByBrandHandler: Successfully retrieved %d gamifications for Brand ID: %d", len(list), brandID)
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// =========================
// UPDATE GAMIFICATION
// =========================
func UpdateGamificationHandler(c *gin.Context) {
	idParam := c.Param("id")
	log.Printf("UpdateGamificationHandler: Request received for ID: %s", idParam)

	var g models.Gamification
	if err := c.ShouldBindJSON(&g); err != nil {
		log.Printf("UpdateGamificationHandler: Invalid JSON format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	id, err := strconv.Atoi(idParam)
	if err != nil {
		log.Printf("UpdateGamificationHandler: Invalid ID format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid gamification ID"})
		return
	}
	g.ID = id

	if err := models.UpdateGamification(&g); err != nil {
		log.Printf("UpdateGamificationHandler: Failed to update gamification ID %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update gamification"})
		return
	}

	log.Printf("UpdateGamificationHandler: Successfully updated gamification ID: %d", id)
	c.JSON(http.StatusOK, gin.H{"message": "Gamification updated successfully"})
}

// =========================
// DELETE GAMIFICATION
// =========================
func DeleteGamificationHandler(c *gin.Context) {
	idParam := c.Param("id")
	brandIDParam := c.Param("brand_id")
	log.Printf("DeleteGamificationHandler: Request received for ID: %s, Brand ID: %s", idParam, brandIDParam)

	id, err := strconv.Atoi(idParam)
	if err != nil {
		log.Printf("DeleteGamificationHandler: Invalid ID format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid gamification ID"})
		return
	}

	brandID, err := strconv.Atoi(brandIDParam)
	if err != nil {
		log.Printf("DeleteGamificationHandler: Invalid Brand ID format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid brand ID"})
		return
	}

	if err := models.DeleteGamification(id, brandID); err != nil {
		log.Printf("DeleteGamificationHandler: Failed to delete gamification ID %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete gamification"})
		return
	}

	log.Printf("DeleteGamificationHandler: Successfully deleted gamification ID: %d", id)
	c.JSON(http.StatusOK, gin.H{"message": "Gamification deleted successfully"})
}

// =========================
// CREATE ANALYTICS EVENT
// =========================
func CreateGamificationAnalyticsHandler(c *gin.Context) {
	log.Println("CreateGamificationAnalyticsHandler: Request received")

	var a models.GamificationAnalytics
	if err := c.ShouldBindJSON(&a); err != nil {
		log.Printf("CreateGamificationAnalyticsHandler: Invalid JSON format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	if a.GameID == 0 || a.UserID == 0 || a.EventType == "" {
		log.Println("CreateGamificationAnalyticsHandler: Missing required fields (game_id, user_id, event_type)")
		c.JSON(http.StatusBadRequest, gin.H{"error": "game_id, user_id, and event_type are required"})
		return
	}

	if err := models.CreateAnalytics(&a); err != nil {
		log.Printf("CreateGamificationAnalyticsHandler: Failed to record analytics: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record analytics"})
		return
	}

	log.Printf("CreateGamificationAnalyticsHandler: Analytics recorded successfully for User: %d, Game: %d", a.UserID, a.GameID)
	c.JSON(http.StatusOK, gin.H{"message": "Analytics recorded", "data": a})
}

// =========================
// GET ANALYTICS BY BRAND
// =========================
func GetAnalyticsByBrandHandler(c *gin.Context) {
	brandIDParam := c.Param("brand_id")
	log.Printf("GetAnalyticsByBrandHandler: Request received for Brand ID: %s", brandIDParam)

	brandID, err := strconv.Atoi(brandIDParam)
	if err != nil {
		log.Printf("GetAnalyticsByBrandHandler: Invalid Brand ID format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid brand ID"})
		return
	}

	data, err := models.GetAnalyticsByBrand(brandID)
	if err != nil {
		log.Printf("GetAnalyticsByBrandHandler: Failed to fetch analytics: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch analytics"})
		return
	}

	log.Printf("GetAnalyticsByBrandHandler: Successfully fetched analytics for Brand ID: %d", brandID)
	c.JSON(http.StatusOK, gin.H{"data": data})
}

// =========================
// USER PROGRESS + LEADERBOARD
// =========================
func GetUserProgressHandler(c *gin.Context) {
	userIDParam := c.Param("user_id")
	log.Printf("GetUserProgressHandler: Request received for User ID: %s", userIDParam)

	userID, err := strconv.Atoi(userIDParam)
	if err != nil {
		log.Printf("GetUserProgressHandler: Invalid User ID format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	progress, err := models.GetUserProgress(userID)
	if err != nil {
		log.Printf("GetUserProgressHandler: Failed to fetch user progress: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user progress"})
		return
	}

	log.Printf("GetUserProgressHandler: Successfully retrieved progress for User ID: %d", userID)
	c.JSON(http.StatusOK, gin.H{"data": progress})
}

func GetLeaderboardHandler(c *gin.Context) {
	gameIDParam := c.Param("game_id")
	log.Printf("GetLeaderboardHandler: Request received for Game ID: %s", gameIDParam)

	gameID, err := strconv.Atoi(gameIDParam)
	if err != nil {
		log.Printf("GetLeaderboardHandler: Invalid Game ID format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid game ID"})
		return
	}

	leaderboard, err := models.GetLeaderboardByGame(gameID)
	if err != nil {
		log.Printf("GetLeaderboardHandler: Failed to fetch leaderboard: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch leaderboard"})
		return
	}

	log.Printf("GetLeaderboardHandler: Successfully retrieved leaderboard for Game ID: %d", gameID)
	c.JSON(http.StatusOK, gin.H{"data": leaderboard})
}

// =========================
// UPDATE USER POINTS
// =========================
func UpdateUserPointsHandler(c *gin.Context) {
	log.Println("UpdateUserPointsHandler: Request received")

	var req struct {
		UserID int `json:"user_id"`
		GameID int `json:"game_id"`
		Points int `json:"points"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("UpdateUserPointsHandler: Invalid JSON format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	err := models.CreateOrUpdateUserProgress(req.UserID, req.GameID, req.Points)
	if err != nil {
		log.Printf("UpdateUserPointsHandler: Failed to update user progress for User %d, Game %d: %v", req.UserID, req.GameID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user progress"})
		return
	}

	log.Printf("UpdateUserPointsHandler: Successfully updated points for User ID: %d, Game ID: %d", req.UserID, req.GameID)
	c.JSON(http.StatusOK, gin.H{"message": "User progress updated successfully", "timestamp": time.Now()})
}

// GET /gamification/analytics/:user_id/:ad_id
func GetUserGamificationAnalyticsHandler(c *gin.Context) {
	userIDParam := c.Param("user_id")

	log.Printf("GetUserGamificationAnalyticsHandler: Request received. UserID: %s", userIDParam)

	userID, err := strconv.Atoi(userIDParam)
	if err != nil {
		log.Printf("GetUserGamificationAnalyticsHandler: Invalid user_id format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id"})
		return
	}

	analytics, err := models.GetUserGamificationAnalytics(userID)
	if err != nil {
		log.Printf("GetUserGamificationAnalyticsHandler: DB error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	log.Printf("GetUserGamificationAnalyticsHandler: Successfully retrieved analytics for User: %d", userID)
	c.JSON(http.StatusOK, gin.H{"data": analytics})
}

func GetTopUsersHandler(c *gin.Context) {
	log.Println("GetTopUsersHandler: Request received")

	topUsers, err := models.GetTopThreeGlobalUsers()
	if err != nil {
		// Log the error internally and return a 500
		log.Printf("GetTopUsersHandler: Failed to retrieve top users: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve top users",
			"details": err.Error(),
		})
		return
	}

	// Return empty array instead of null if no users found
	if topUsers == nil {
		log.Println("GetTopUsersHandler: No users found, returning empty list")
		topUsers = []models.TopUser{}
	}

	log.Println("GetTopUsersHandler: Successfully retrieved top users")
	c.JSON(http.StatusOK, gin.H{
		"message": "Top 3 users retrieved successfully",
		"data":    topUsers,
	})
}
