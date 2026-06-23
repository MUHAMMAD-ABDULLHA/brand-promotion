package routes

import (
	"vite-project/backend/controllers"

	"github.com/gin-gonic/gin"
)

func CombineRoutes(rg *gin.RouterGroup) {
	rg.GET("/ads/:id", controllers.GetAds)
	rg.GET("/campaign/:id", controllers.GetAdsByCampaignID) // must come before :id
	rg.GET("/:id", controllers.GetSingleAd)

}
