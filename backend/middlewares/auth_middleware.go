package middlewares

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func AuthMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			fmt.Println("🚫 Missing Authorization header")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		fmt.Println("🧾 Raw Token:", tokenString)

		jwtSecret := os.Getenv("JWT_SECRET")
		if jwtSecret == "" {
			fmt.Println("🚨 JWT_SECRET is not loaded from environment")
		} else {
			fmt.Println("🔑 JWT_SECRET is loaded")
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				fmt.Printf("🚫 Unexpected signing method: %v\n", token.Header["alg"])
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(jwtSecret), nil
		})

		if err != nil {
			fmt.Println("❌ JWT parse error:", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		if !token.Valid {
			fmt.Println("❌ JWT token is not valid")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token is not valid"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			fmt.Println("❌ JWT claims cast failed")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		fmt.Println("📦 JWT Claims:", claims)

		role, ok := claims["role"].(string)
		if !ok {
			fmt.Println("❌ Role missing or not string in token claims")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Role not found in token claims"})
			c.Abort()
			return
		}

		userIDRaw, ok := claims["user_id"]
		if !ok {
			fmt.Println("❌ user_id missing in token claims")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
			c.Abort()
			return
		}

		userIDFloat, ok := userIDRaw.(float64)
		if !ok {
			fmt.Println("❌ user_id is not float64, got:", userIDRaw)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user_id format"})
			c.Abort()
			return
		}
		userID := int(userIDFloat)

		fmt.Printf("✅ Authenticated user: ID=%d, Role=%s\n", userID, role)

		// Store in context
		c.Set("user_id", userID)
		c.Set("role", role)

		// Role validation
		for _, allowed := range allowedRoles {
			if role == allowed {
				fmt.Println("✅ Role authorized:", role)
				c.Next()
				return
			}
		}

		fmt.Println("🚫 Access denied for role:", role, "Allowed roles:", allowedRoles)
		c.JSON(http.StatusForbidden, gin.H{"error": "Access forbidden: role not allowed"})
		c.Abort()
	}
}
