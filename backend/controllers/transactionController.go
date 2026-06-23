package controllers

import (
	"net/http"
	"strconv"
	"time"
	"vite-project/backend/models"

	"github.com/gin-gonic/gin"
)

func CreateTransaction(c *gin.Context) {
	var req models.Transaction
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.Status = "SUCCESS"
	req.CreatedAt = time.Now()

	if err := models.CreateTransaction(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment simulated successfully"})
}

func GetTransactionByUser(c *gin.Context) {
	id := c.Param("user_id")
	userID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	transaction, err := models.GetTransactionsByUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve transaction"})
		return
	}
	c.JSON(http.StatusOK, transaction)
}
