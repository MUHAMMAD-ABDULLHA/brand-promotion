package routes

import (
	"vite-project/backend/controllers"

	"github.com/gin-gonic/gin"
)

func AdminRoutes(rg *gin.RouterGroup) {
	// ============= USER MANAGEMENT (Admin) =============
	rg.GET("/users", controllers.GetAllUsers)             // all users with brand/influencer details
	rg.PUT("/users/:id/role", controllers.UpdateUserRole) // update role (e.g., user → brand)
	rg.DELETE("/users", controllers.DeleteUsers)          // bulk delete

	// ============= ADS / CAMPAIGNS / ANALYTICS ==========
	rg.GET("/ads", controllers.GetAllAds)
	rg.GET("/campaigns", controllers.GetAllCampaigns)
	rg.GET("/analytics", controllers.GetAllAnalytics)
	rg.DELETE("/analytics/:id", controllers.DeleteAnalytics)

	// ============= COMBINE CAMPAIGNS ====================
	rg.GET("/combine-campaigns", controllers.GetAllCombineCampaigns)
	rg.DELETE("/combine-campaigns/:id", controllers.DeleteCombineCampaign)
}
