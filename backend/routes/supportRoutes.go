package routes

import (
	"vite-project/backend/controllers"

	"github.com/gin-gonic/gin"
)

func SupportRoutes(r *gin.Engine) {
	support := r.Group("/support")
	{
		support.POST("/", controllers.CreateSupportHandler)
		support.GET("/", controllers.GetAllSupportsHandler)
		support.GET("/:id", controllers.GetSupportByIDHandler)
		support.GET("/user/:user_id", controllers.GetSupportByUserHandler)
	}
}
