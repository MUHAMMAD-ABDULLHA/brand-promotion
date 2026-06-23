package main

import (
	"fmt"
	"log"
	"time"
	"vite-project/backend/config"
	"vite-project/backend/routes"

	"vite-project/backend/cloudinary"

	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/stripe/stripe-go/v74"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found or could not be loaded, using system env variables")
	} else {
		log.Println("✅ .env file loaded successfully")
	}
	// Connect to Database
	config.ConnectDB()
	cloudinary.InitCloudinary()
	stripe.Key = os.Getenv("SKSECRETKEY")
	// Setup Router
	server := gin.Default()
	server.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173", "http://192.168.110.112:5173"},
		// AllowOrigins:        []string{"*"},
		AllowMethods:        []string{"POST", "GET", "OPTIONS", "PUT", "DELETE"},
		AllowHeaders:        []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:       []string{"Content-Length"},
		AllowCredentials:    true,
		AllowPrivateNetwork: true,
		MaxAge:              12 * time.Hour,
	}))
	server.Use(func(c *gin.Context) {
		fmt.Println("🔍 Request Method:", c.Request.Method)
		fmt.Println("🔍 Request Path:", c.Request.URL.Path)
		fmt.Println("🔍 Origin:", c.Request.Header.Get("Origin"))
		c.Next()
	})

	routes.AuthRoutes(server)
	routes.GamificationRoutes(server)
	routes.SupportRoutes(server)
	routes.StripeRoutes(server)
	routes.PlanRoutes(server)
	routes.TransactionRoutes(server)
	routes.SentimentRoutes(server)
	routes.RegisterCouponRoutes(server)
	// Start Server
	server.Run("0.0.0.0:8080") // defaults to ":8080"

}
