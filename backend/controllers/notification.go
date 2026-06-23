package controllers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
	"vite-project/backend/config"
	"vite-project/backend/models"

	"github.com/gin-gonic/gin"
)

func SaveNotificationSettings(c *gin.Context) {
	var notificationSettings models.NotificationSettings
	if err := c.ShouldBindJSON(&notificationSettings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	notificationSettings.CreatedAt = time.Now()
	notificationSettings.UpdatedAt = time.Now()

	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction begin failed"})
		return
	}
	defer tx.Rollback()

	query := `INSERT INTO user_notification_settings (user_id, email_notifications, push_notifications, sms_notifications, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id) DO UPDATE SET
         email_notifications = $2, push_notifications = $3, sms_notifications = $4, updated_at = $6`
	_, err = tx.Exec(query,
		notificationSettings.UserID, notificationSettings.EmailNotifications, notificationSettings.PushNotifications,
		notificationSettings.SmsNotifications, notificationSettings.CreatedAt, notificationSettings.UpdatedAt,
	)
	if err != nil {
		log.Printf("Error saving notification settings: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save notification settings"})
		return
	}

	if err = tx.Commit(); err != nil {
		log.Printf("Error committing transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification settings saved"})
}

// GetSettingsHandler fetches user notification settings
func GetSettingsHandler(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	// Fetch settings
	var settings models.NotificationSettings
	err := config.DB.QueryRow(
		"SELECT user_id, email_notifications, push_notifications, sms_notifications, created_at, updated_at FROM user_notification_settings WHERE user_id = $1",
		userID,
	).Scan(&settings.UserID, &settings.EmailNotifications, &settings.PushNotifications, &settings.SmsNotifications, &settings.CreatedAt, &settings.UpdatedAt)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusOK, gin.H{
			"email_notifications": false,
			"push_notifications":  false,
			"sms_notifications":   false,
		})
		return
	}
	if err != nil {
		log.Printf("Error fetching settings: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"email_notifications": settings.EmailNotifications,
		"push_notifications":  settings.PushNotifications,
		"sms_notifications":   settings.SmsNotifications,
	})
}

// UpdateSettingsHandler updates user notification settings
func UpdateSettingsHandler(c *gin.Context) {
	var notificationSettings models.NotificationSettings
	if err := c.ShouldBindJSON(&notificationSettings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	notificationSettings.CreatedAt = time.Now()
	notificationSettings.UpdatedAt = time.Now()

	// Save settings with upsert
	_, err := config.DB.Exec(
		`INSERT INTO user_notification_settings (user_id, email_notifications, push_notifications, sms_notifications, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 ON CONFLICT (user_id) DO UPDATE SET
		 email_notifications = $2, push_notifications = $3, sms_notifications = $4, updated_at = $6`,
		notificationSettings.UserID,
		notificationSettings.EmailNotifications,
		notificationSettings.PushNotifications,
		notificationSettings.SmsNotifications,
		notificationSettings.CreatedAt,
		notificationSettings.UpdatedAt,
	)
	if err != nil {
		log.Printf("Error saving settings: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save settings"})
		return
	}

	// Fetch user role and email for notification
	var user models.User
	err = config.DB.QueryRow(`SELECT id, email, role FROM users WHERE id = $1`, notificationSettings.UserID).
		Scan(&user.ID, &user.Email, &user.Role)
	if err != nil {
		log.Printf("Error fetching user for notification: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user details"})
		return
	}

	// Create notification metadata
	metadata, _ := json.Marshal(map[string]interface{}{"action": "settings_updated"})

	// Build notification object
	notification := models.Notification{
		UserID:    notificationSettings.UserID,
		Role:      user.Role,
		Type:      "SETTINGS_UPDATED",
		Title:     "Settings Updated",
		Message:   "Your notification settings have been updated successfully.",
		IsRead:    false,
		Metadata:  map[string]interface{}{"action": "settings_updated"},
		Timestamp: time.Now().Format(time.RFC3339),
		CreatedAt: time.Now(),
		ExpiresAt: nil,
	}

	// Save notification
	_, err = config.DB.Exec(
		`INSERT INTO notifications (user_id, role, type, title, message, is_read, metadata, timestamp, created_at, expires_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
		notification.UserID, notification.Role, notification.Type,
		notification.Title, notification.Message, notification.IsRead,
		metadata, notification.Timestamp, notification.CreatedAt, notification.ExpiresAt,
	)
	if err != nil {
		log.Printf("Error creating notification: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create notification"})
		return
	}

	// Send email to user
	if err := sendEmail(user.Email, notification.Title, notification.Message); err != nil {
		log.Printf("Error sending email: %v", err)
		// keep notification is_read = false
	} else {
		// Optionally update notification is_read = true
		config.DB.Exec(`UPDATE notifications SET is_read = true WHERE user_id = $1 AND timestamp = $2`, notification.UserID, notification.Timestamp)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Settings updated and notification sent"})
}

// SendEmailNotificationHandler sends an email notification
func SendEmailNotificationHandler(c *gin.Context) {
	var req struct {
		UserID  int    `json:"user_id"`
		Type    string `json:"type"`
		Title   string `json:"title"`
		Message string `json:"message"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Fetch user email and role
	var user models.User
	err := config.DB.QueryRow("SELECT id, email, role FROM users WHERE id = $1", req.UserID).Scan(&user.ID, &user.Email, &user.Role)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}
	if err != nil {
		log.Printf("Error fetching user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}

	metadata, _ := json.Marshal(map[string]interface{}{"notification_type": req.Type})

	// Create notification record
	notification := models.Notification{
		UserID:    req.UserID,
		Role:      user.Role,
		Type:      req.Type,
		Title:     req.Title,
		Message:   req.Message,
		IsRead:    false,
		Metadata:  map[string]interface{}{"notification_type": req.Type},
		Timestamp: time.Now().Format(time.RFC3339),
		CreatedAt: time.Now(),
		ExpiresAt: nil,
	}

	_, err = config.DB.Exec(
		`INSERT INTO notifications (user_id, role, type, title, message, is_read, metadata, timestamp, created_at, expires_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
		notification.UserID, notification.Role, notification.Type, notification.Title,
		notification.Message, notification.IsRead, metadata,
		notification.Timestamp, notification.CreatedAt, notification.ExpiresAt,
	)
	if err != nil {
		log.Printf("Error creating notification: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create notification"})
		return
	}

	// Send email
	if err := sendEmail(user.Email, req.Title, req.Message); err != nil {
		log.Printf("Error sending email: %v", err)
		// notification remains unread
	} else {
		config.DB.Exec(`UPDATE notifications SET is_read = true WHERE user_id = $1 AND timestamp = $2`, notification.UserID, notification.Timestamp)
	}

	c.JSON(http.StatusAccepted, gin.H{"message": "Notification queued and email sent"})
}

func SaveNotifications(c *gin.Context) {
	var notifications []models.Notification
	if err := c.ShouldBindJSON(&notifications); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction begin failed"})
		return
	}
	defer tx.Rollback()

	for _, notification := range notifications {
		notification.CreatedAt = time.Now()
		notification.Timestamp = time.Now().Format(time.RFC3339)

		result, err := tx.Exec(
			`INSERT INTO notifications (user_id, role, type, title, message, is_read, metadata, timestamp, created_at, expires_at)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
			notification.UserID, notification.Role, notification.Type,
			notification.Title, notification.Message, notification.IsRead,
			notification.Metadata, notification.Timestamp,
			notification.CreatedAt, notification.ExpiresAt,
		)
		if err != nil {
			log.Printf("Error saving notification: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save notifications"})
			return
		}
		fmt.Println(result)
	}

	if err = tx.Commit(); err != nil {
		log.Printf("Error committing transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notifications saved successfully"})
}

func FetchNotifications(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	rows, err := config.DB.Query("SELECT id, user_id, role, type, title, message, is_read, metadata, timestamp, created_at, expires_at FROM notifications WHERE user_id = $1", userID)
	if err != nil {
		log.Printf("Error fetching notifications: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var notification models.Notification
		var metadata []byte
		var timestamp sql.NullString
		if err := rows.Scan(&notification.ID, &notification.UserID, &notification.Role, &notification.Type,
			&notification.Title, &notification.Message, &notification.IsRead,
			&metadata, &timestamp, &notification.CreatedAt, &notification.ExpiresAt); err != nil {
			log.Printf("Error scanning notification: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse notifications"})
			return
		}
		if metadata != nil {
			if err := json.Unmarshal(metadata, &notification.Metadata); err != nil {
				log.Printf("Error unmarshaling metadata: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse notification metadata"})
				return
			}
		} else {
			notification.Metadata = map[string]interface{}{}
		}
		notification.Timestamp = timestamp.String // Use empty string if NULL
		notifications = append(notifications, notification)
	}

	c.JSON(http.StatusOK, notifications)
}

func UpdateNotificationStatus(c *gin.Context) {
	var req struct {
		ID     int  `json:"id"`
		IsRead bool `json:"is_read"`
	}
	fmt.Println(req)
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	_, err := config.DB.Exec("UPDATE notifications SET is_read = $1 WHERE id = $2", req.IsRead, req.ID)
	if err != nil {
		log.Printf("Error updating notification status: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification status updated"})
}

func UpdateAllNotificationsToRead(c *gin.Context) {
	userID := c.Param("id")
	log.Printf("📩 UpdateAllNotificationsToRead called | user_id=%s", userID)

	if userID == "" {
		log.Println("❌ Missing user_id in request")
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	log.Println("➡️ Executing SQL UPDATE for unread notifications...")
	result, err := config.DB.Exec(`
		UPDATE notifications 
		SET is_read = true 
		WHERE user_id = $1 AND is_read = false
	`, userID)
	if err != nil {
		log.Printf("❌ Error updating notification status for user_id=%s | error=%v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification status"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("⚠️ Could not fetch rows affected | user_id=%s | error=%v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch update results"})
		return
	}

	log.Printf("✅ Notifications updated | user_id=%s | rows_affected=%d", userID, rowsAffected)

	c.JSON(http.StatusOK, gin.H{
		"message":       "Unread notifications marked as read",
		"rows_affected": rowsAffected,
	})
}

// save the notification in database to use in the api functions
func saveSingleNotification(userID int, role, notifType, title, message string, metadata map[string]interface{}) {
	fmt.Println("=== saveSingleNotification CALLED ===")
	fmt.Printf("[DEBUG] Inputs → userID=%d, role=%s, type=%s, title=%s\n", userID, role, notifType, title)

	// Marshal metadata to JSON (Postgres JSONB expects []byte/string)
	metadataJSON, err := json.Marshal(metadata)
	if err != nil {
		log.Printf("[ERROR] Failed to marshal metadata: %v", err)
		return
	}
	fmt.Printf("[DEBUG] Marshalled Metadata: %s\n", string(metadataJSON))

	// Build notification
	notifications := []models.Notification{
		{
			UserID:    userID,
			Role:      role,
			Type:      notifType,
			Title:     title,
			Message:   message,
			IsRead:    false,
			Timestamp: time.Now().Format(time.RFC3339),
			CreatedAt: time.Now(),
		},
	}

	// Start transaction
	tx, err := config.DB.Begin()
	if err != nil {
		log.Printf("[ERROR] Starting transaction failed: %v", err)
		return
	}
	fmt.Println("[DEBUG] Transaction started successfully")

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			log.Printf("[PANIC] Recovered in saveSingleNotification: %v", p)
		}
	}()

	for _, notification := range notifications {
		fmt.Printf("[DEBUG] Inserting notification → user_id=%d, role=%s\n", notification.UserID, notification.Role)
		_, err := tx.Exec(
			`INSERT INTO notifications (user_id, role, type, title, message, is_read, metadata, timestamp, created_at, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
			notification.UserID,
			notification.Role,
			notification.Type,
			notification.Title,
			notification.Message,
			notification.IsRead,
			metadataJSON,
			notification.Timestamp,
			notification.CreatedAt,
			notification.ExpiresAt,
		)
		if err != nil {
			log.Printf("[ERROR] Insert notification failed: %v", err)
			tx.Rollback()
			return
		}
		fmt.Println("[DEBUG] Insert successful for notification")
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		log.Printf("[ERROR] Committing transaction failed: %v", err)
		return
	}
	fmt.Println("[DEBUG] Transaction committed successfully (notification saved)")
}
