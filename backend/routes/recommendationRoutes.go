package routes

import (
	"time"
	"vite-project/backend/controllers"
	"vite-project/backend/middlewares"

	"github.com/gin-gonic/gin"
)

func RecommendataionRoutes(rg *gin.RouterGroup) {
	// Rate limit: 30 requests per 60s per IP for recommendation endpoints
	rl := middlewares.RateLimit(30, 60*time.Second)

	// ---------------------------
	// Feed Recommendations
	// ---------------------------
	rg.GET("/posts/:user_id", rl, controllers.RecommendPosts)
	rg.GET("/posts/qwen/:user_id", rl, controllers.RecommendPostsQwen)
	rg.GET("/ads/:user_id", rl, controllers.RecommendAds)
	rg.POST("/feedback", rl, controllers.RecordRecommendationFeedback)

	// ---------------------------
	// AI Content Tools
	// ---------------------------

	// 1. Generate new headline from description
	rg.POST("/headline/generate", controllers.GenerateHeadline)

	// 2. Enhance an existing headline (fix grammar, make punchy)
	// Body: { "current_headline": "..." }
	rg.POST("/headline/enhance", controllers.EnhanceHeadline)

	// 3. Generate full Ad Details (Headline + Audience + Location)
	//    using the Brand's history (analytics/past ads).
	// Param: user_id (The publisher/brand ID)
	// Body: { "description": "new product details..." }
	rg.POST("/ads/generate/:user_id", controllers.GenerateAdDetails)

	// ---------------------------
	// Campaign Collaboration (NEW)
	// ---------------------------

	// 4. Recommend Influencers/Brands for a specific Campaign
	// Param: user_id (The Brand/User ID looking for collaborators)
	// Query: ?campaign_id=123 (The specific campaign context for matching)
	rg.GET("/collaborators/:user_id", controllers.RecommendCollaborators)
}
