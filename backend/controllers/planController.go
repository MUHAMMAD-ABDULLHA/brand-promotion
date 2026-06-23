package controllers

import (
	"net/http"
	"strconv"
	"vite-project/backend/models"

	"github.com/gin-gonic/gin"
)

func CreateDefaultPlanHandler(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid user_id"})
		return
	}

	if err := models.CreateDefaultPlan(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Default plan created"})
}

// Get current plan
func GetPlanHandler(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid user_id"})
		return
	}

	plan, err := models.GetPlanByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Plan not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "plan": plan})
}

// Upgrade plan (used by Stripe webhook)
func UpgradePlanHandler(c *gin.Context) {
	var req struct {
		UserID  int    `json:"user_id"`
		NewPlan string `json:"new_plan"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid body"})
		return
	}

	if err := models.UpgradePlan(req.UserID, req.NewPlan); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Plan upgraded successfully"})
}

// Cancel plan (used by webhook or manual)
func CancelPlanHandler(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid user_id"})
		return
	}
	if err := models.CancelPlan(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Plan reverted to default"})
}
