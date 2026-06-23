package routes

import (
	"vite-project/backend/controllers"

	"github.com/gin-gonic/gin"
)

func PlanRoutes(router *gin.Engine) {
	r := router.Group("/plans")
	{
		r.POST("/create/:user_id", controllers.CreateDefaultPlanHandler)
		r.GET("/:user_id", controllers.GetPlanHandler)
		r.PUT("/upgrade", controllers.UpgradePlanHandler)
		r.PUT("/cancel/:user_id", controllers.CancelPlanHandler)
	}
}
