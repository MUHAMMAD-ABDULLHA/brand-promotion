package controllers

import (
	"fmt"
	"log"
	"net/http"
	"vite-project/backend/config"
	"vite-project/backend/models"

	"github.com/gin-gonic/gin"
)

// ==================== Create Post Analytics ====================
func CreatePostAnalytics(c *gin.Context) {
	log.Println("=== CreatePostAnalytics called ===")

	var analytics models.PostAnalytics

	// Bind JSON
	if err := c.ShouldBindJSON(&analytics); err != nil {
		log.Printf("[ERROR] Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[DEBUG] Incoming Analytics Data: %+v", analytics)

	// Insert query
	query := `
		INSERT INTO post_analytics (post_id, user_id, event_type)
		VALUES ($1, $2, $3)
		RETURNING id, timestamp;
	`
	log.Println("[DEBUG] Executing insert query for post analytics...")

	err := config.DB.QueryRow(query, analytics.PostID, analytics.UserID, analytics.EventType).
		Scan(&analytics.ID, &analytics.Timestamp)

	if err != nil {
		log.Printf("[ERROR] DB insert failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create post analytics: %v", err)})
		return
	}

	log.Printf("[INFO] Post analytics created successfully. ID: %d | Timestamp: %v", analytics.ID, analytics.Timestamp)
	c.JSON(http.StatusOK, analytics)
}

// ==================== Get All Post Analytics ====================
func GetAllPostAnalytics(c *gin.Context) {
	log.Println("=== GetAllPostAnalytics called ===")

	rows, err := config.DB.Query(`SELECT id, post_id, user_id, event_type, timestamp FROM post_analytics`)
	if err != nil {
		log.Printf("[ERROR] Failed to query all post analytics: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch post analytics: %v", err)})
		return
	}
	defer rows.Close()

	var analyticsList []models.PostAnalytics
	for rows.Next() {
		var analytics models.PostAnalytics
		if err := rows.Scan(&analytics.ID, &analytics.PostID, &analytics.UserID, &analytics.EventType, &analytics.Timestamp); err != nil {
			log.Printf("[ERROR] Row scan failed: %v", err)
			continue
		}
		analyticsList = append(analyticsList, analytics)
	}

	log.Printf("[INFO] Total analytics fetched: %d", len(analyticsList))
	c.JSON(http.StatusOK, analyticsList)
}

// ==================== Get Post Analytics by Post ID ====================
func GetPostAnalyticsByPostID(c *gin.Context) {
	log.Println("=== GetPostAnalyticsByPostID called ===")

	postID := c.Param("id")
	log.Printf("[DEBUG] Fetching analytics for post_id: %s", postID)

	query := `SELECT id, post_id, user_id, event_type, timestamp FROM post_analytics WHERE post_id = $1`
	rows, err := config.DB.Query(query, postID)
	if err != nil {
		log.Printf("[ERROR] Failed to query analytics for post_id=%s: %v", postID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch analytics: %v", err)})
		return
	}
	defer rows.Close()

	var analyticsList []models.PostAnalytics
	for rows.Next() {
		var analytics models.PostAnalytics
		if err := rows.Scan(&analytics.ID, &analytics.PostID, &analytics.UserID, &analytics.EventType, &analytics.Timestamp); err != nil {
			log.Printf("[ERROR] Row scan failed for post_id=%s: %v", postID, err)
			continue
		}
		analyticsList = append(analyticsList, analytics)
	}

	log.Printf("[INFO] Total analytics for post_id %s: %d", postID, len(analyticsList))
	c.JSON(http.StatusOK, analyticsList)
}

// ==================== Get Post Metrics (aggregated) ====================
func GetPostMetrics(c *gin.Context) {
	log.Println("=== GetPostMetrics called ===")

	postID := c.Param("id")
	log.Printf("[DEBUG] Calculating metrics for post_id: %s", postID)

	// Impressions
	var impressions int
	err := config.DB.QueryRow(`SELECT COUNT(*) FROM post_analytics WHERE post_id = $1 AND event_type = 'impression'`, postID).Scan(&impressions)
	if err != nil {
		log.Printf("[ERROR] Failed to count impressions: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get impressions"})
		return
	}

	// Likes
	var likes int
	err = config.DB.QueryRow(`SELECT COUNT(*) FROM post_analytics WHERE post_id = $1 AND event_type = 'like'`, postID).Scan(&likes)
	if err != nil {
		log.Printf("[ERROR] Failed to count likes: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get likes"})
		return
	}

	// Comments
	var comments int
	err = config.DB.QueryRow(`SELECT COUNT(*) FROM post_analytics WHERE post_id = $1 AND event_type = 'comment'`, postID).Scan(&comments)
	if err != nil {
		log.Printf("[ERROR] Failed to count comments: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get comments"})
		return
	}

	// Shares
	var shares int
	err = config.DB.QueryRow(`SELECT COUNT(*) FROM post_analytics WHERE post_id = $1 AND event_type = 'share'`, postID).Scan(&shares)
	if err != nil {
		log.Printf("[ERROR] Failed to count shares: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get shares"})
		return
	}

	log.Printf("[INFO] Metrics for post_id=%s => Impressions:%d | Likes:%d | Comments:%d | Shares:%d",
		postID, impressions, likes, comments, shares)

	c.JSON(http.StatusOK, gin.H{
		"post_id":     postID,
		"impressions": impressions,
		"likes":       likes,
		"comments":    comments,
		"shares":      shares,
	})
}

// ==================== Delete Post Analytics ====================
func DeletePostAnalytics(c *gin.Context) {
	log.Println("=== DeletePostAnalytics called ===")

	id := c.Param("id")
	log.Printf("[DEBUG] Deleting post analytics record ID: %s", id)

	_, err := config.DB.Exec(`DELETE FROM post_analytics WHERE id = $1`, id)
	if err != nil {
		log.Printf("[ERROR] Failed to delete post analytics ID=%s: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post analytics"})
		return
	}

	log.Printf("[INFO] Post analytics ID=%s deleted successfully", id)
	c.JSON(http.StatusOK, gin.H{"message": "Post analytics deleted successfully"})
}

// ==================== Get All Post Analytics for a Specific User ====================
func GetUserPostAnalytics(c *gin.Context) {
	log.Println("=== GetUserPostAnalytics called ===")

	// Assuming you get the user ID from the request context (e.g., from a JWT)
	// For this example, let's get it from the URL parameter for simplicity.
	userID := c.Param("id")
	log.Printf("[DEBUG] Fetching all post analytics for user_id: %s", userID)

	query := `
        SELECT 
			pa.id, 
			pa.post_id, 
			pa.user_id, 
			pa.event_type, 
			pa.timestamp
		FROM 
			post_analytics pa
		JOIN 
			posts p ON pa.post_id = p.id
		WHERE 
			p.user_id = $1;
    `
	rows, err := config.DB.Query(query, userID)
	if err != nil {
		log.Printf("[ERROR] Failed to query analytics for user_id=%s: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user's post analytics"})
		return
	}
	defer rows.Close()

	var analyticsList []models.PostAnalytics
	for rows.Next() {
		var analytics models.PostAnalytics
		if err := rows.Scan(&analytics.ID, &analytics.PostID, &analytics.UserID, &analytics.EventType, &analytics.Timestamp); err != nil {
			log.Printf("[ERROR] Row scan failed for user_id=%s: %v", userID, err)
			continue
		}
		analyticsList = append(analyticsList, analytics)
	}

	log.Printf("[INFO] Total analytics for user_id %s: %d", userID, len(analyticsList))
	c.JSON(http.StatusOK, analyticsList)
}
