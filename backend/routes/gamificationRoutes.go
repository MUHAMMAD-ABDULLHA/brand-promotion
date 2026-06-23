package routes

import (
	"vite-project/backend/controllers"

	"github.com/gin-gonic/gin"
)

func GamificationRoutes(r *gin.Engine) {
	g := r.Group("/gamification")
	{
		// CRUD
		g.POST("/", controllers.CreateGamificationHandler)
		g.GET("/:id", controllers.GetGamificationByIDHandler)
		g.GET("/brand/:brand_id", controllers.GetGamificationsByBrandHandler)
		g.PUT("/:id", controllers.UpdateGamificationHandler)
		g.DELETE("/:id/brand/:brand_id", controllers.DeleteGamificationHandler)

		// Analytics
		g.POST("/analytics", controllers.CreateGamificationAnalyticsHandler)
		g.GET("/analytics/brand/:brand_id", controllers.GetAnalyticsByBrandHandler)

		// User Progress & Leaderboard
		g.GET("/progress/:user_id", controllers.GetUserProgressHandler)
		g.POST("/progress/update", controllers.UpdateUserPointsHandler)
		g.GET("/leaderboard/:game_id", controllers.GetLeaderboardHandler)
		g.GET("/analytics/:user_id", controllers.GetUserGamificationAnalyticsHandler)
		g.GET("/leaderboard/global", controllers.GetTopUsersHandler)
	}
}
