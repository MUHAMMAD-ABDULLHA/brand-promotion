package routes

import (
	"bytes"
	"io/ioutil"
	"vite-project/backend/controllers"

	"github.com/gin-gonic/gin"
)

func PreserveRawBody() gin.HandlerFunc {
	return func(c *gin.Context) {
		var bodyBytes []byte
		if c.Request.Body != nil {
			bodyBytes, _ = ioutil.ReadAll(c.Request.Body)
		}

		// Restore the body for later use
		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))

		// Store raw body in context
		c.Set("rawBody", bodyBytes)

		c.Next()
	}
}
func StripeRoutes(r *gin.Engine) {
	s := r.Group("/stripe")
	{
		s.POST("/create-checkout-session", controllers.CreateCheckoutSession)
		s.POST("/webhook", PreserveRawBody(), controllers.HandleStripeWebhook)
	}
}
