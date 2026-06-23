package routes

import (
	"vite-project/backend/controllers"

	"github.com/gin-gonic/gin"
)

func AnalyticsRoutes(rg *gin.RouterGroup) {
	// Create analytics (log event)

	// Get analytics by user
	rg.GET("/analytics/user/:id", controllers.GetAnalyticsByUserId)

	// Get analytics by ad
	rg.GET("/analytics/ad/:id", controllers.GetAnalyticsByAdId)

	// Get aggregated metrics (CTR, impressions, etc.)
	rg.GET("/analytics/ad/:id/metrics", controllers.GetAdMetrics)

	rg.GET("/analytics/detailed/:user_id", controllers.GetDetailedBrandAnalytics)

}
