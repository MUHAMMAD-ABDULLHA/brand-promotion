package routes

import (
	"vite-project/backend/controllers"
	"vite-project/backend/middlewares"

	// "github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func AuthRoutes(c *gin.Engine) {
	c.POST("/register/user", controllers.UserRegisterHandler)
	c.POST("/register/brand", controllers.BrandRegisterHandler)
	c.POST("/register/influencer", controllers.InfluencerRegisterHandler)
	c.POST("/login", controllers.LoginHandler)
	c.POST("/google-login", controllers.GoogleLoginHandler)
	c.POST("/forget-password", controllers.ForgetPasswordHandler)
	c.POST("/verify-code", controllers.VerifyCodeHandler)
	///add the
	c.POST("/settings", controllers.SaveNotificationSettings)
	c.GET("/settings", controllers.GetSettingsHandler)
	c.POST("/updatesettings", controllers.UpdateSettingsHandler)
	c.POST("/notifications/email", controllers.SendEmailNotificationHandler)
	c.POST("/notifications", controllers.SaveNotifications)
	c.GET("/notifications", controllers.FetchNotifications)
	c.POST("/notifications/status", controllers.UpdateNotificationStatus)
	c.POST("/notifications/mark-all-read/:id", controllers.UpdateAllNotificationsToRead)
	c.PUT("/update-profile/:id", controllers.UpdateOwnProfile) // update own profile (name, phone, image, etc.)
	c.DELETE("/delete-profile", controllers.DeleteOwnAccount)
	c.POST("/analytics", controllers.CreateAnalytics)

	//settings
	settings := c.Group("/settings")
	{
		settings.GET("/display/:id", controllers.GetDisplaySettingsHandler)
		settings.PUT("/display/:id", controllers.UpdateDisplaySettingsHandler)
	}

	// display_ads
	c.GET("/display_ads", controllers.Display_ads)
	// get the followers
	c.GET("/followers/:user_id", controllers.GetFollowers)

	// get followers count
	c.GET("/followers/:user_id/count", controllers.GetFollowersCount)

	// get following count
	c.GET("/following/:user_id/count", controllers.GetFollowingCount)

	// create a follower
	c.POST("/followers", controllers.CreateFollower)

	// unfollow
	c.DELETE("/followers/:follower_id/:following_id", controllers.Unfollow)

	// Follow request management
	c.POST("/follow-requests/approve", controllers.ApproveFollowRequest)
	c.POST("/follow-requests/reject", controllers.RejectFollowRequest)
	c.GET("/follow-requests/pending/:user_id", controllers.GetPendingFollowRequests)

	// Posts
	c.POST("/posts", controllers.CreatePost)                    // Create new post
	c.POST("/posts/:id/like", controllers.LikePost)             // Like a post
	c.GET("/posts", controllers.GetAllPosts)                    // Get all posts
	c.GET("/posts/:id/comments", controllers.GetCommentsByPost) // Get comments
	c.POST("/posts/:id/comment", controllers.AddComment)        // Add comment
	c.GET("/posts/:id", controllers.GetUsersPosts)

	// Delete post
	c.DELETE("/posts/:id", controllers.DeletePost)

	// Delete comment
	c.DELETE("/posts/:id/comments/:commentId", controllers.DeleteComment)
	c.POST("/post-analytics", controllers.CreatePostAnalytics)
	c.GET("/post-analytics", controllers.GetAllPostAnalytics)
	c.GET("/post-analytics/:id", controllers.GetPostAnalyticsByPostID)
	c.GET("/post-analytics/:id/metrics", controllers.GetPostMetrics)
	c.DELETE("/post-analytics/:id", controllers.DeletePostAnalytics)
	c.GET("/analytics/posts/user/:id", controllers.GetUserPostAnalytics)

	// chat
	// backend/routes.go (snippet)
	c.POST("/conversations", controllers.CreateConversation)
	c.POST("/conversations/:id/members", controllers.AddConversationMember)
	c.GET("/conversations/user/:user_id", controllers.GetConversationsForUser)
	c.GET("/conversations/:id/messages", controllers.GetMessagesByConversation)
	c.POST("/conversations/:id/messages", controllers.CreateMessage)

	// websocket
	c.GET("/ws", controllers.HandleWS)

	// Get combine campaigns where current brand is collaborator
	c.GET("/combine/collaborator/:collaborator_id", controllers.GetCombineCampaignsForCollaborator)

	// Update collaborator approval (approve/reject invite)
	c.PUT("/combine/collaborators/:id/approval", controllers.UpdateCollaboratorApproval)

	c.PUT("/combine/collaborator/approvals/:id", controllers.GetPendingCombineCampaigns)

	c.POST("/upload/image/:user_id", controllers.HandleAssetUpload)

	c.POST("/upload/files/:user_id", controllers.HandleFileUpload)

	// get published ads
	c.GET("/published", controllers.GetAllPublishedAds)

	c.GET("/search/collaborators", controllers.SearchCollaborators)

	// published posts
	publishPostGroup := c.Group("/publish-posts")
	PublishPostsRoutes(publishPostGroup)
	// stories
	storyGroup := c.Group("/stories")

	// Search routes
	searchRoutes := c.Group("/search")
	{
		searchRoutes.GET("/users", controllers.SearchUsers)
		searchRoutes.GET("/users/advanced", controllers.AdvancedSearchUsers)
		searchRoutes.GET("/optimize-indexes", controllers.OptimizeSearchIndexes) // Helper endpoint for DB optimization
	}

	// Public profile routes
	c.GET("/profile/:username", controllers.GetUserProfile)
	{
		storyGroup.POST("", controllers.CreateStory)                 // Upload a story
		storyGroup.GET("/:id", controllers.GetStory)                 // Get a story by ID
		storyGroup.GET("/user/:user_id", controllers.GetUserStories) // All stories for a user
		storyGroup.PUT("/:id", controllers.EditStory)                // Edit a story
		storyGroup.DELETE("/:id", controllers.DeleteStory)
		storyGroup.GET("/following/:user_id", controllers.GetFollowingStories) // Delete a story
	}
	saveGroup := c.Group("/posts")
	{
		saveGroup.POST("/:id/save", controllers.SavePost)           // Save post
		saveGroup.DELETE("/:id/save", controllers.UnsavePost)       // Unsave post
		saveGroup.GET("/saved/:user_id", controllers.GetSavedPosts) // Get saved posts

	}
	userGroup := c.Group("/user")
	{
		userGroup.POST("/ad/like/:id", controllers.LikeAd)
		userGroup.DELETE("/ad/like/:id", controllers.UnlikeAd)
		userGroup.GET("/ad/like/:id", controllers.GetLikesByAd)
		userGroup.GET("/ad/:user_id/like", controllers.GetAdsLikedByUser)
		userGroup.POST("/ad/comment/:id", controllers.AddAdComment)
		userGroup.GET("/ad/comment/:id", controllers.GetCommentsByAd)
		userGroup.DELETE("/ad/comment/:id/:comment_id", controllers.DeleteAdComment)
	}
	recommendationGroup := c.Group("/recommendation")
	RecommendataionRoutes(recommendationGroup)
	brandGroup := c.Group("/brand")
	brandGroup.Use(
		// cors.New(cors.Config{
		// 	AllowOrigins: []string{"http://localhost:5173", "http://192.168.110.112:5173"},
		// 	// AllowOrigins:     []string{"*"},
		// 	AllowMethods:     []string{"POST", "GET", "OPTIONS", "PUT", "DELETE"},
		// 	AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		// 	ExposeHeaders:    []string{"Content-Length"},
		// 	AllowCredentials: true,
		// 	MaxAge:           12 * time.Hour,
		// }),
		middlewares.AuthMiddleware("brandAdmin", "admin"),
	)
	combineGroup := c.Group("brand/ads")
	combineGroup.Use(middlewares.AuthMiddleware("brandAdmin", "influencer", "admin"))
	CombineRoutes(combineGroup)

	// publish ads group

	publishAdGroup := c.Group("/publish-ads")
	publishAdGroup.Use(middlewares.AuthMiddleware("brandAdmin", "admin", "influencer"))
	PublishAdsRoutes(publishAdGroup)

	campaignGroup := brandGroup.Group("/campaigns")
	CampaignRoutes(campaignGroup)
	adGroup := brandGroup.Group("/ads")
	AdRoutes(adGroup)
	analyticsGroup := brandGroup.Group("/analytics")
	AnalyticsRoutes(analyticsGroup)
	AdminGroup := c.Group("/admin")
	AdminGroup.Use(
		// 	cors.New(cors.Config{
		// 	AllowOrigins: []string{"http://localhost:5173", "http://192.168.110.112:5173"},
		// 	// AllowOrigins:     []string{"*"},
		// 	AllowMethods:     []string{"POST", "GET", "OPTIONS", "PUT", "DELETE"},
		// 	AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		// 	ExposeHeaders:    []string{"Content-Length"},
		// 	AllowCredentials: true,
		// 	MaxAge:           12 * time.Hour,
		// }),
		middlewares.AuthMiddleware("admin"))
	AdminRoutes(AdminGroup)
}
