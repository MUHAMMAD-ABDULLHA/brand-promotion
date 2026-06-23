package routes

import (
	"vite-project/backend/controllers"

	"github.com/gin-gonic/gin"
)

func PublishAdsRoutes(rg *gin.RouterGroup) {
	// publish ad
	rg.POST("/publish", controllers.PublishAd)

	// unpublish ad
	rg.POST("/unpublish", controllers.UnpublishAdHandler)

}
