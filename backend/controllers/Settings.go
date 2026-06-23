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

// GetDisplaySettingsHandler fetches display settings for the logged-in user
func GetDisplaySettingsHandler(c *gin.Context) {
	log.Println("--- Starting GetDisplaySettingsHandler ---")

	userID := c.Param("id")
	log.Printf("Fetching display settings for UserID=%d", userID)

	query := `
		SELECT id, user_id, dark_mode, timezone, created_at, updated_at
		FROM user_display_settings
		WHERE user_id = $1
	`
	var settings models.UserDisplaySettings
	err := config.DB.QueryRow(query, userID).Scan(
		&settings.ID,
		&settings.UserID,
		&settings.DarkMode,
		&settings.Timezone,
		&settings.CreatedAt,
		&settings.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		log.Printf("No display settings found for UserID=%d, returning defaults", userID)
		c.JSON(http.StatusOK, gin.H{
			"user_id":   userID,
			"dark_mode": false,
			"timezone":  "UTC",
		})
		log.Println("--- GetDisplaySettingsHandler finished (defaults returned) ---")
		return
	} else if err != nil {
		log.Printf("Database error while fetching settings for UserID=%d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch display settings: %v", err)})
		log.Println("--- GetDisplaySettingsHandler finished with error ---")
		return
	}

	log.Printf("Display settings fetched successfully for UserID=%d: DarkMode=%t, Timezone=%s",
		userID, settings.DarkMode, settings.Timezone)

	c.JSON(http.StatusOK, settings)
	log.Println("--- GetDisplaySettingsHandler finished successfully ---")
}

// UpdateDisplaySettingsHandler updates or inserts display settings
func UpdateDisplaySettingsHandler(c *gin.Context) {
	log.Println("--- Starting UpdateDisplaySettingsHandler ---")

	userID := c.Param("id")
	log.Printf("Updating display settings for UserID=%d", userID)

	var input struct {
		DarkMode bool   `json:"dark_mode"`
		Timezone string `json:"timezone"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Invalid JSON payload for UserID=%d: %v", userID, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		log.Println("--- UpdateDisplaySettingsHandler finished with bad request ---")
		return
	}

	log.Printf("Payload received for UserID=%d: DarkMode=%t, Timezone=%s", userID, input.DarkMode, input.Timezone)

	now := time.Now()
	query := `
		INSERT INTO user_display_settings (user_id, dark_mode, timezone, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id)
		DO UPDATE SET dark_mode = EXCLUDED.dark_mode,
					  timezone = EXCLUDED.timezone,
					  updated_at = EXCLUDED.updated_at
	`
	_, err := config.DB.Exec(query, userID, input.DarkMode, input.Timezone, now, now)
	if err != nil {
		log.Printf("Database error while updating settings for UserID=%d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update display settings: %v", err)})
		log.Println("--- UpdateDisplaySettingsHandler finished with error ---")
		return
	}

	log.Printf("Display settings updated successfully for UserID=%d", userID)
	c.JSON(http.StatusOK, gin.H{
		"message":   "Display settings updated successfully",
		"user_id":   userID,
		"dark_mode": input.DarkMode,
		"timezone":  input.Timezone,
	})
	log.Println("--- UpdateDisplaySettingsHandler finished successfully ---")
}
