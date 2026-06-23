package routes

import (
	"vite-project/backend/controllers"

	"github.com/gin-gonic/gin"
)

func TransactionRoutes(r *gin.Engine) {
	t := r.Group("/transaction")
	{
		t.POST("/", controllers.CreateTransaction)
		t.GET("/:user_id", controllers.GetTransactionByUser)
	}
}
