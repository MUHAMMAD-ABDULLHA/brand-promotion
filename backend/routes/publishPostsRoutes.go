package routes

import (
	"vite-project/backend/controllers"

	"github.com/gin-gonic/gin"
)

func PublishPostsRoutes(rg *gin.RouterGroup) {
	// publish post
	rg.POST("/publish", controllers.PublishPost)

	// unpublish post
	rg.POST("/unpublish", controllers.UnpublishPost)

	// get all published post
	rg.GET("/publish", controllers.GetAllPublishedPosts)

	// get published posts by user id
	rg.GET("/publish/:user_id", controllers.GetPublishedPostsByUser)

	// get published post by id
	rg.GET("/:id", controllers.GetPublishedPostByID)
}
