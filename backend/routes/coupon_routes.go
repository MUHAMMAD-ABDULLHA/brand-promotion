package routes

import (
	"vite-project/backend/controllers"

	"github.com/gin-gonic/gin"
)

// RegisterCouponRoutes sets up all coupon-related endpoints
// Add to main.go: routes.RegisterCouponRoutes(server)
func RegisterCouponRoutes(r *gin.Engine) {
	couponGroup := r.Group("/api/coupons")
	{
		// User redeems points for a coupon
		couponGroup.POST("/redeem", controllers.RedeemPoints)

		// Brand scans QR to validate/redeem coupon
		couponGroup.POST("/scan", controllers.ValidateCoupon)

		// User gets their point balance
		couponGroup.GET("/points/:user_id", controllers.GetUserPoints)

		// User gets their coupons
		couponGroup.GET("/my-coupons/:user_id", controllers.GetUserCoupons)

		// Brand gets coupons issued for their rewards
		couponGroup.GET("/brand-coupons/:brand_id", controllers.GetBrandCoupons)

		// Brand gets coupon redemption analytics
		couponGroup.GET("/analytics/:brand_id", controllers.GetCouponAnalytics)
	}
}
