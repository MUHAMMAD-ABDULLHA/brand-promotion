package routes

import (
	"vite-project/backend/controllers"

	"github.com/gin-gonic/gin"
)

func SentimentRoutes(server *gin.Engine) {
	sentiment := server.Group("/sentiment")
	{
		// Get sentiment analysis for all ads of a brand
		sentiment.GET("/brand/:user_id", controllers.GetBrandSentimentAnalysis)
	}
}
