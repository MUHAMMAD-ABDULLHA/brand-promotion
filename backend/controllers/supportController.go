package controllers

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"
	"vite-project/backend/models"

	"github.com/gin-gonic/gin"
)

// CreateSupportHandler saves user support queries and sends acknowledgment email to the user
func CreateSupportHandler(c *gin.Context) {
	var s models.Support

	// Parse incoming JSON
	if err := c.ShouldBindJSON(&s); err != nil {
		fmt.Println("LOG: [CreateSupportHandler] ERROR: Invalid request data received. Details:", err.Error()) // Log added
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}
	fmt.Println("LOG: [CreateSupportHandler] INFO: Received support request from email:", s.Email) // Log added

	// Validation
	if s.Email == "" || s.Description == "" {
		fmt.Println("LOG: [CreateSupportHandler] ERROR: Validation failed. Email or description is empty.") // Log added
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email and description are required"})
		return
	}

	// Set created_at if not already
	if s.CreatedAt.IsZero() {
		s.CreatedAt = time.Now()
	}

	// Save to database
	if err := models.CreateSupport(&s); err != nil {
		fmt.Println("LOG: [CreateSupportHandler] ERROR: Failed to save support request for email:", s.Email, "Details:", err.Error()) // Log added
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save support request", "details": err.Error()})
		return
	}
	fmt.Println("LOG: [CreateSupportHandler] INFO: Support request saved to DB. ID:", s.ID, "Email:", s.Email) // Log added

	// Send acknowledgment email to user
	emailSubject := "We’ve received your support request"
	emailBody := fmt.Sprintf(
		"Hello,\n\nWe’ve received your support request and our team will respond within 2–3 working days.\n\nYour submitted message:\n\"%s\"\n\nThank you for contacting AdEngage Support.\n\nBest regards,\nAdEngage Team",
		s.Description,
	)

	// Send confirmation email (to user)
	if err := sendEmail(s.Email, emailSubject, emailBody); err != nil {
		fmt.Println("LOG: [CreateSupportHandler] WARNING: Support request saved but failed to send acknowledgment email to:", s.Email, "Details:", err.Error()) // Log added
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Support request saved, but email could not be sent",
			"details": err.Error(),
		})
		return
	}
	fmt.Println("LOG: [CreateSupportHandler] INFO: Acknowledgment email successfully sent to:", s.Email) // Log added

	c.JSON(http.StatusOK, gin.H{
		"message": "Support request submitted successfully. Confirmation email sent.",
		"data":    s,
	})
}

/*
	=========================
	  Get Support by ID (GET /support/:id)

=========================
*/
func GetSupportByIDHandler(c *gin.Context) {
	id := c.Param("id")
	fmt.Println("LOG: [GetSupportByIDHandler] INFO: Attempting to fetch support request with ID:", id) // Log added
	var supportID int
	_, err := fmt.Sscan(id, &supportID)
	if err != nil {
		fmt.Println("LOG: [GetSupportByIDHandler] ERROR: Invalid ID format received:", id) // Log added
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid support ID"})
		return
	}

	s, err := models.GetSupportByID(supportID)
	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Println("LOG: [GetSupportByIDHandler] WARNING: Support request not found for ID:", supportID) // Log added
			c.JSON(http.StatusNotFound, gin.H{"error": "Support request not found"})
		} else {
			fmt.Println("LOG: [GetSupportByIDHandler] ERROR: Failed to fetch support request ID:", supportID, "Details:", err.Error()) // Log added
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch support", "details": err.Error()})
		}
		return
	}

	fmt.Println("LOG: [GetSupportByIDHandler] INFO: Successfully fetched support request ID:", supportID) // Log added
	c.JSON(http.StatusOK, s)
}

/*
	=========================
	  Get Supports by User (GET /support/user/:user_id)

=========================
*/
func GetSupportByUserHandler(c *gin.Context) {
	userID := c.Param("user_id")
	fmt.Println("LOG: [GetSupportByUserHandler] INFO: Attempting to fetch supports for User ID:", userID) // Log added
	var uid int
	_, err := fmt.Sscan(userID, &uid)
	if err != nil {
		fmt.Println("LOG: [GetSupportByUserHandler] ERROR: Invalid User ID format received:", userID) // Log added
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	supports, err := models.GetSupportByUser(uid)
	if err != nil {
		fmt.Println("LOG: [GetSupportByUserHandler] ERROR: Failed to fetch supports for User ID:", uid, "Details:", err.Error()) // Log added
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user supports", "details": err.Error()})
		return
	}

	fmt.Println("LOG: [GetSupportByUserHandler] INFO: Successfully fetched", len(supports), "supports for User ID:", uid) // Log added
	c.JSON(http.StatusOK, gin.H{"supports": supports})
}

/*
	=========================
	  Get All Supports (Admin View)
	  GET /support/

=========================
*/
func GetAllSupportsHandler(c *gin.Context) {
	fmt.Println("LOG: [GetAllSupportsHandler] INFO: Attempting to fetch all support requests (Admin View).") // Log added
	supports, err := models.GetAllSupport()
	if err != nil {
		fmt.Println("LOG: [GetAllSupportsHandler] ERROR: Failed to fetch all supports. Details:", err.Error()) // Log added
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch supports", "details": err.Error()})
		return
	}

	fmt.Println("LOG: [GetAllSupportsHandler] INFO: Successfully fetched", len(supports), "total support requests.") // Log added
	c.JSON(http.StatusOK, gin.H{"supports": supports})
}
