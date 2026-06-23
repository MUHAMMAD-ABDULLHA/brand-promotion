package routes

import (
	"vite-project/backend/controllers"

	"github.com/gin-gonic/gin"
)

func CampaignRoutes(rg *gin.RouterGroup) {
	// =============================
	// Existing Campaign Routes
	// =============================
	rg.POST("/", controllers.CreateCampaign)
	rg.GET("/brand/:id", controllers.GetCampaign) // campaigns by brand (user_id)
	rg.GET("/:id", controllers.GetSingleCampaign) // single campaign
	rg.PUT("/:id", controllers.UpdateCampaign)
	rg.DELETE("/:id", controllers.DeleteCampaign)

	// =============================
	// Combine Campaign Routes (Brand)
	// =============================

	// Create a combine campaign (admin brand initiates)
	rg.POST("/combine/:campaign_id", controllers.CreateCombineCampaign)
	rg.POST("/combine/collaborators/:id", controllers.AddCollaborators)

	// Get combine campaigns where current brand is admin
	rg.GET("/combine/admin/:admin_id", controllers.GetCombineCampaignsByAdmin)

	// Delete combine campaign (brand admin can delete)
	rg.DELETE("/combine/:id", controllers.DeleteCombineCampaign)

	rg.GET("/collaborators/:id", controllers.GetCollaborators)

	rg.PUT("/combine/update/:id", controllers.UpdateCombineCampaign)

}
