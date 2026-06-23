package routes

import (
	"vite-project/backend/controllers"

	"github.com/gin-gonic/gin"
)

func AdRoutes(rg *gin.RouterGroup) {
	// Create new ad
	rg.POST("/", controllers.CreateAd)

	// Update ad
	rg.PUT("/:id", controllers.UpdateAd)

	// Delete ad
	rg.DELETE("/:id", controllers.DeleteAd)

}
