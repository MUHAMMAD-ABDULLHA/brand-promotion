package controllers

import (
	"bytes"
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	"golang.org/x/crypto/bcrypt"

	"database/sql"
	"vite-project/backend/config"
	"vite-project/backend/models"
	"vite-project/backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"google.golang.org/api/idtoken"
)

// --- Brand Registration ---
func BrandRegisterHandler(c *gin.Context) {
	log.Println("--- Starting BrandRegisterHandler ---")
	var brand models.Brand

	// 1. Bind JSON
	if err := c.ShouldBindJSON(&brand); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	log.Printf("Brand data received: Name='%s', Email='%s', ImageID=%d", brand.BrandName, brand.User.Email, brand.User.ImageID)

	// 2. Hash Password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(brand.User.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Password hashing failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// 3. Start Transaction
	tx, err := config.DB.Begin()
	if err != nil {
		log.Printf("Transaction start failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	// 4. Insert User (Initially with NULL ImageID)
	// We insert the user first to get the ID, passing nil for image_id
	var userID int
	userQuery := `
		INSERT INTO users (email, password, full_name, username, phone, 
		age, role, image_url, bio, account_status, privacy_status, image_id) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`

	err = tx.QueryRow(userQuery,
		brand.User.Email, string(hashedPassword), brand.User.FullName, brand.User.Username,
		brand.User.Phone, brand.User.Age, brand.User.Role, brand.User.ImageURL,
		brand.User.Bio, brand.User.AccountStatus, brand.User.PrivacyStatus, nil, // Pass nil initially
	).Scan(&userID)

	if err != nil {
		log.Printf("Brand user insert failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "User registration failed (Email might exist)"})
		return
	}
	log.Printf("User inserted with ID: %d", userID)

	// 4.5 Handle Image Linking (If ImageID exists)
	if brand.User.ImageID != 0 {
		// A. Update the Image with the new UserID
		_, err = tx.Exec("UPDATE images SET user_id = $1 WHERE id = $2", userID, brand.User.ImageID)
		if err != nil {
			log.Printf("Failed to link user to image: %v", err)
			// We log but maybe don't fail the whole registration if image link fails?
			// Or strict: return error. Let's be strict to ensure consistency.
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link image"})
			return
		}

		// B. Update the User with the ImageID
		_, err = tx.Exec("UPDATE users SET image_id = $1 WHERE id = $2", brand.User.ImageID, userID)
		if err != nil {
			log.Printf("Failed to link image to user: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user image"})
			return
		}
		log.Printf("Bi-directional link established between User %d and Image %d", userID, brand.User.ImageID)
	}

	// 5. Insert Brand Details (Includes Location, SocialMediaLink, Niche)
	brandQuery := `
		INSERT INTO brands (user_id, brand_name, brand_website, location, social_media_link, niche)
		VALUES ($1, $2, $3, $4, $5, $6)`

	_, err = tx.Exec(brandQuery, userID, brand.BrandName, brand.BrandWebsite, brand.Location, brand.SocialMediaLink, brand.Niche)
	if err != nil {
		log.Printf("Brand details insert failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Brand registration failed"})
		return
	}

	// 6. Create Default Plan
	planQuery := `INSERT INTO plans (user_id, plan_type, status, created_at, updated_at) VALUES ($1, 'standard', 'active', NOW(), NOW())`
	_, err = tx.Exec(planQuery, userID)
	if err != nil {
		log.Printf("Plan creation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize plan"})
		return
	}

	// 7. Commit Transaction
	if err = tx.Commit(); err != nil {
		log.Printf("Transaction commit failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	// 8. Post-Registration Actions
	go saveSingleNotification(userID, "admin", "NEW_BRAND_REGISTRATION", "New Brand Registered", fmt.Sprintf("Brand '%s' has joined.", brand.BrandName), map[string]interface{}{"brand_id": userID})
	go sendEmail(brand.User.Email, "Welcome to AdEngage", fmt.Sprintf("Hello %s, your brand account is active!", brand.User.FullName))

	token, _ := utils.GenerateJWT(userID, "brand")
	c.JSON(http.StatusOK, gin.H{
		"message": "Brand registered successfully",
		"token":   token,
	})
	log.Println("--- BrandRegisterHandler Success ---")
}

// --- Influencer Registration ---
func InfluencerRegisterHandler(c *gin.Context) {
	log.Println("--- Starting InfluencerRegisterHandler ---")
	var influencer models.Influencer

	if err := c.ShouldBindJSON(&influencer); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	log.Printf("Influencer data received: Email='%s', ImageID=%d", influencer.User.Email, influencer.User.ImageID)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(influencer.User.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	// 2. Insert User (Initially with NULL ImageID)
	var userID int
	userQuery := `
		INSERT INTO users (email, password, full_name, username, phone, 
		age, role, image_url, bio, account_status, privacy_status, image_id) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`

	err = tx.QueryRow(userQuery,
		influencer.User.Email, string(hashedPassword), influencer.User.FullName, influencer.User.Username,
		influencer.User.Phone, influencer.User.Age, influencer.User.Role, influencer.User.ImageURL,
		influencer.User.Bio, influencer.User.AccountStatus, influencer.User.PrivacyStatus, nil, // Pass nil
	).Scan(&userID)

	if err != nil {
		log.Printf("Influencer user insert failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "User registration failed"})
		return
	}
	log.Printf("User inserted with ID: %d", userID)

	// 2.5 Handle Image Linking
	if influencer.User.ImageID != 0 {
		// A. Update Image
		_, err = tx.Exec("UPDATE images SET user_id = $1 WHERE id = $2", userID, influencer.User.ImageID)
		if err != nil {
			log.Printf("Failed to link user to image: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link image"})
			return
		}
		// B. Update User
		_, err = tx.Exec("UPDATE users SET image_id = $1 WHERE id = $2", influencer.User.ImageID, userID)
		if err != nil {
			log.Printf("Failed to link image to user: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user image"})
			return
		}
	}

	// 3. Insert Influencer Details (Includes Location, Pricing, Niche, ContentType, TargetAudience)
	influencerQuery := `
		INSERT INTO influencers (
			user_id, social_media, social_media_link, followers, 
			location, pricing, niche, content_type, target_audience
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

	_, err = tx.Exec(influencerQuery,
		userID, influencer.SocialMedia, influencer.SocialMediaLink, influencer.Followers,
		influencer.Location, influencer.Pricing, influencer.Niche, influencer.ContentType, influencer.TargetAudience,
	)

	if err != nil {
		log.Printf("Influencer details insert failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to register influencer details"})
		return
	}

	// 4. Create Default Plan
	planQuery := `INSERT INTO plans (user_id, plan_type, status, created_at, updated_at) VALUES ($1, 'standard', 'active', NOW(), NOW())`
	_, err = tx.Exec(planQuery, userID)
	if err != nil {
		log.Printf("Plan creation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize plan"})
		return
	}

	// 5. Commit Transaction
	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	// 6. Post-Registration Actions
	go saveSingleNotification(userID, "admin", "NEW_INFLUENCER_REGISTRATION", "New Influencer Registered", fmt.Sprintf("Influencer '%s' has joined.", influencer.User.FullName), map[string]interface{}{"influencer_id": userID})
	go sendEmail(influencer.User.Email, "Welcome to AdEngage", fmt.Sprintf("Hello %s, your influencer account is active now!", influencer.User.FullName))

	token, _ := utils.GenerateJWT(userID, "influencer")
	c.JSON(http.StatusOK, gin.H{
		"message": "Influencer registered successfully",
		"token":   token,
	})
	log.Println("--- InfluencerRegisterHandler Success ---")
}

// --- Regular User Registration ---
func UserRegisterHandler(c *gin.Context) {
	log.Println("--- Starting UserRegisterHandler ---")
	var nested struct {
		User models.User `json:"user"`
	}

	if err := c.ShouldBindJSON(&nested); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	user := nested.User
	log.Printf("User data received: FullName='%s', Email='%s', ImageID=%d", user.FullName, user.Email, user.ImageID)

	// Check if email exists
	var existingUserID int
	err := config.DB.QueryRow("SELECT id FROM users WHERE email = $1", user.Email).Scan(&existingUserID)
	if err != sql.ErrNoRows && err == nil {
		log.Printf("Email '%s' already registered (UserID: %d)", user.Email, existingUserID)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Password hash failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Start transaction
	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction error"})
		return
	}
	defer tx.Rollback()

	// Insert User (Initially with NULL ImageID)
	query := `
		INSERT INTO users (email, password, full_name, username, phone, 
		age, role, image_url, bio, account_status, privacy_status, image_id) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`

	err = tx.QueryRow(query,
		user.Email, string(hashedPassword), user.FullName, user.Username,
		user.Phone, user.Age, user.Role, user.ImageURL,
		user.Bio, user.AccountStatus, user.PrivacyStatus, nil, // Pass nil
	).Scan(&user.ID)

	if err != nil {
		log.Printf("Failed to register user: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to register user"})
		return
	}
	log.Printf("User registered successfully with ID: %d", user.ID)

	// Handle Image Linking
	if user.ImageID != 0 {
		// A. Update Image
		_, err = tx.Exec("UPDATE images SET user_id = $1 WHERE id = $2", user.ID, user.ImageID)
		if err != nil {
			log.Printf("Failed to link user to image: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link image"})
			return
		}
		// B. Update User
		_, err = tx.Exec("UPDATE users SET image_id = $1 WHERE id = $2", user.ImageID, user.ID)
		if err != nil {
			log.Printf("Failed to link image to user: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user image"})
			return
		}
	}

	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit error"})
		return
	}

	go saveSingleNotification(user.ID, "admin", "NEW_USER_REGISTRATION", "New User Registered", fmt.Sprintf("User '%s' has registered.", user.FullName), map[string]interface{}{"user_id": user.ID})
	go sendEmail(user.Email, "Welcome to AdEngage", fmt.Sprintf("Hello %s, thank you for registering!", user.FullName))

	token, _ := utils.GenerateJWT(user.ID, user.Role)
	c.JSON(http.StatusOK, gin.H{
		"message": "User registered successfully",
		"token":   token,
	})
	log.Println("--- UserRegisterHandler Success ---")
}

func LoginHandler(c *gin.Context) {
	fmt.Println("=== [DEBUG] LoginHandler CALLED ===")

	// Parse credentials
	var credentials struct {
		Role     string `json:"role" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&credentials); err != nil {
		fmt.Println("[ERROR] Invalid login JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "❌ Invalid email or password format"})
		return
	}

	fmt.Printf("[DEBUG] Login attempt for Email: %s | Role Attempt: %s\n", credentials.Email, credentials.Role)

	// Full user struct
	var user models.User

	query := `
		SELECT id, email, username, full_name, role, phone, age,
		COALESCE(image_url, '') AS image_url, password, COALESCE(bio, '') AS bio,
		account_status, privacy_status, COALESCE(image_id, 0) AS image_id
		FROM users WHERE email=$1
	`
	fmt.Println("[DEBUG] Executing query:", query)

	err := config.DB.QueryRow(query, credentials.Email).Scan(
		&user.ID,
		&user.Email,
		&user.Username,
		&user.FullName,
		&user.Role,
		&user.Phone,
		&user.Age,
		&user.ImageURL,
		&user.Password,
		&user.Bio,
		&user.AccountStatus,
		&user.PrivacyStatus,
		&user.ImageID,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Println("[DEBUG] No user found with email:", credentials.Email)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "❌ Email not found"})
		} else {
			fmt.Println("[ERROR] Database error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "❌ Database error"})
		}
		return
	}

	// 2. Check for Role Mismatch
	if user.Role != credentials.Role {
		fmt.Printf("[WARN] Role Mismatch! User is '%s' but tried to login as '%s'\n", user.Role, credentials.Role)
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": fmt.Sprintf("❌ Incorrect role. This account is registered as '%s'. Please go back and select the correct role.", user.Role),
		})
		return
	}

	// Log DB result before password check
	fmt.Printf("[DEBUG] DB Returned: ID=%d Email=%s Username=%s Role=%s\n", user.ID, user.Email, user.Username, user.Role)

	// Check if password is empty (debugging)
	if user.Password == "" {
		fmt.Println("[ERROR] Password hash in DB is empty! Check DB data.")
	}

	// 3. Compare password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password))
	if err != nil {
		fmt.Println("[DEBUG] Password mismatch for user:", credentials.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "❌ Incorrect password"})
		return
	}

	// 4. Generate JWT
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(5 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, signErr := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if signErr != nil {
		fmt.Println("[ERROR] Failed to sign JWT:", signErr)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "❌ Failed to generate token"})
		return
	}

	fmt.Println("[DEBUG] JWT generated successfully")

	// Save notification
	saveSingleNotification(
		user.ID,
		user.Role,
		"USER_LOGIN",
		"User Logged In",
		fmt.Sprintf("User '%s' has logged in.", user.Username),
		map[string]interface{}{"user_id": user.ID},
	)

	// Return full user info
	c.JSON(http.StatusOK, gin.H{
		"message": "✅ Login successful",
		"token":   signedToken,
		"user": gin.H{
			"id":             user.ID,
			"email":          user.Email,
			"username":       user.Username,
			"full_name":      user.FullName,
			"role":           user.Role,
			"phone":          user.Phone,
			"age":            user.Age,
			"image":          user.ImageURL,
			"bio":            user.Bio,
			"account_status": user.AccountStatus,
			"privacy_status": user.PrivacyStatus,
			"image_id":       user.ImageID,
		},
	})
}

// create follower
// func CreateFollower(c *gin.Context) {
// 	var follower models.Follow
// 	if err := c.ShouldBindJSON(&follower); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
// 		return
// 	}

// 	query := `
// 		INSERT INTO follows (follower_id, following_id)
// 		VALUES ($1, $2)
// 		ON CONFLICT (follower_id, following_id) DO NOTHING
// 	`
// 	_, err := config.DB.Exec(query, follower.FollowerID, follower.FollowingID)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create follower"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"message": "Follower created successfully"})
// }

// func CreateFollower(c *gin.Context) {
// 	// Log incoming request
// 	log.Println("[CreateFollower] Incoming request:", c.Request.Method, c.Request.URL.Path)
// 	log.Println("[CreateFollower] Headers:", c.Request.Header)

// 	var follower models.Follow

// 	// Log request body before binding
// 	bodyBytes, _ := ioutil.ReadAll(c.Request.Body)
// 	log.Println("[CreateFollower] Raw request body:", string(bodyBytes))

// 	// Reset the request body so ShouldBindJSON can read it again
// 	c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))

// 	// Bind JSON and log errors
// 	if err := c.ShouldBindJSON(&follower); err != nil {
// 		log.Println("[CreateFollower] JSON binding error:", err)
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
// 		return
// 	}

// 	log.Printf("[CreateFollower] Parsed follower data: %+v\n", follower)

// 	// Set default status to "pending" if not provided
// 	if follower.Status == "" {
// 		follower.Status = "pending"
// 		log.Println("[CreateFollower] Status not provided, defaulting to 'pending'")
// 	}
// 	if follower.FollowerID == follower.FollowingID {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "You cannot follow yourself"})
// 		return
// 	}
// 	log.Printf("[CreateFollower] Final status: %s", follower.Status)

// 	query := `
//         INSERT INTO follows (follower_id, following_id, status)
//         VALUES ($1, $2, $3)
//         ON CONFLICT (follower_id, following_id) DO NOTHING
//         RETURNING id
//     `

// 	log.Println("[CreateFollower] Executing SQL query:", query)
// 	log.Println("[CreateFollower] With parameters:", follower.FollowerID, follower.FollowingID, follower.Status)

// 	var (
// 		id int
// 	)

// 	err := config.DB.QueryRow(query, follower.FollowerID, follower.FollowingID, follower.Status).Scan(&id)
// 	if err != nil {
// 		if err == sql.ErrNoRows {
// 			log.Println("[CreateFollower] No rows affected - likely duplicate entry")
// 			c.JSON(http.StatusOK, gin.H{"message": "Relationship already exists"})
// 			return
// 		}

// 		log.Println("[CreateFollower] Database error:", err)
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create follower"})
// 		return
// 	}

// 	log.Printf("[CreateFollower] Successfully created follow relationship. ID: %d", id)

// 	// Send notification to the user being followed if status is pending
// 	if follower.Status == "pending" {
// 		// Get follower and following user names for notification
// 		var followerName, followingName string

// 		followerQuery := `SELECT full_name FROM users WHERE id = $1`
// 		config.DB.QueryRow(followerQuery, follower.FollowerID).Scan(&followerName)

// 		followingQuery := `SELECT full_name FROM users WHERE id = $1`
// 		config.DB.QueryRow(followingQuery, follower.FollowingID).Scan(&followingName)

// 		// Save notification for the user being followed
// 		saveSingleNotification(
// 			follower.FollowingID,
// 			"user",
// 			"NEW_FOLLOW_REQUEST",
// 			"New Follow Request",
// 			fmt.Sprintf("%s wants to follow you", followerName),
// 			map[string]interface{}{
// 				"follower_id":  follower.FollowerID,
// 				"following_id": follower.FollowingID,
// 			},
// 		)

// 		log.Printf("[CreateFollower] Sent follow request notification to user %d", follower.FollowingID)
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"message": fmt.Sprintf("Follow request sent with status: %s", follower.Status),
// 		"id":      id,
// 		"status":  follower.Status,
// 	})
// }

func CreateFollower(c *gin.Context) {
	log.Println("[CreateFollower] Incoming request:", c.Request.Method, c.Request.URL.Path)
	log.Println("[CreateFollower] Headers:", c.Request.Header)

	var follower models.Follow

	bodyBytes, _ := ioutil.ReadAll(c.Request.Body)
	log.Println("[CreateFollower] Raw request body:", string(bodyBytes))
	c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))

	if err := c.ShouldBindJSON(&follower); err != nil {
		log.Println("[CreateFollower] JSON binding error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	log.Printf("[CreateFollower] Parsed follower data: %+v\n", follower)

	if follower.FollowerID == follower.FollowingID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You cannot follow yourself"})
		return
	}

	// ✅ Check privacy status of the target user (the one being followed)
	privacyStatus, err := GetUserPrivacyStatus(follower.FollowingID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check user privacy status"})
		return
	}

	if privacyStatus == "public" {
		follower.Status = "accepted" // Auto-accept follow for public profiles
		log.Println("[CreateFollower] Target user is public, auto-accepting follow")
	} else {
		if follower.Status == "" {
			follower.Status = "pending"
			log.Println("[CreateFollower] Target user is private, defaulting status to 'pending'")
		}
	}

	log.Printf("[CreateFollower] Final status: %s", follower.Status)

	query := `
        INSERT INTO follows (follower_id, following_id, status)
        VALUES ($1, $2, $3)
        ON CONFLICT (follower_id, following_id) DO NOTHING
        RETURNING id
    `
	log.Println("[CreateFollower] Executing SQL query:", query)
	log.Println("[CreateFollower] With parameters:", follower.FollowerID, follower.FollowingID, follower.Status)

	var id int
	err = config.DB.QueryRow(query, follower.FollowerID, follower.FollowingID, follower.Status).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Println("[CreateFollower] No rows affected - likely duplicate entry")
			c.JSON(http.StatusOK, gin.H{"message": "Relationship already exists"})
			return
		}
		log.Println("[CreateFollower] Database error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create follower"})
		return
	}

	log.Printf("[CreateFollower] Successfully created follow relationship. ID: %d", id)

	// Send notification only if status is pending (private account case)
	if follower.Status == "pending" {
		var followerName string
		config.DB.QueryRow(`SELECT full_name FROM users WHERE id = $1`, follower.FollowerID).Scan(&followerName)

		saveSingleNotification(
			follower.FollowingID,
			"user",
			"NEW_FOLLOW_REQUEST",
			"New Follow Request",
			fmt.Sprintf("%s wants to follow you", followerName),
			map[string]interface{}{
				"follower_id":  follower.FollowerID,
				"following_id": follower.FollowingID,
			},
		)
		log.Printf("[CreateFollower] Sent follow request notification to user %d", follower.FollowingID)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Follow request processed with status: %s", follower.Status),
		"id":      id,
		"status":  follower.Status,
	})
}

// getting the user who we are going to follow the privacy_status of his account
// GetUserPrivacyStatus returns the privacy status ("public" or "private") of a user
func GetUserPrivacyStatus(userID int) (string, error) {
	var privacyStatus string
	query := `SELECT privacy_status FROM users WHERE id = $1`
	err := config.DB.QueryRow(query, userID).Scan(&privacyStatus)
	if err != nil {
		log.Printf("[GetUserPrivacyStatus] Error fetching privacy_status for UserID=%d: %v", userID, err)
		return "", err
	}
	log.Printf("[GetUserPrivacyStatus] UserID=%d has privacy_status=%s", userID, privacyStatus)
	return privacyStatus, nil
}

// get followers
func GetFollowers(c *gin.Context) {
	userID := c.Param("user_id")
	log.Printf("[GetFollowers] Getting followers for user ID: %s", userID)

	query := `
		SELECT f.follower_id, f.following_id, f.status,
		       u.username, u.full_name, COALESCE(u.image_url, '') as image_url, 
		       COALESCE(u.bio, '') as bio, u.role
		FROM follows f
		JOIN users u ON f.follower_id = u.id
		WHERE f.following_id = $1 AND f.status = 'approved'
		ORDER BY u.username
	`
	rows, err := config.DB.Query(query, userID)
	if err != nil {
		log.Printf("[GetFollowers] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get followers"})
		return
	}
	defer rows.Close()

	var followers []map[string]interface{}
	for rows.Next() {
		var (
			followerID  int
			followingID int
			status      string
			username    string
			fullName    string
			imageURL    string
			bio         string
			role        string
		)

		if err := rows.Scan(&followerID, &followingID, &status, &username, &fullName, &imageURL, &bio, &role); err != nil {
			log.Printf("[GetFollowers] Scan error: %v", err)
			continue
		}

		follower := map[string]interface{}{
			"follower_id":  followerID,
			"following_id": followingID,
			"status":       status,
			"username":     username,
			"full_name":    fullName,
			"image_url":    imageURL,
			"bio":          bio,
			"role":         role,
		}
		followers = append(followers, follower)
	}

	log.Printf("[GetFollowers] Found %d followers for user %s", len(followers), userID)
	c.JSON(http.StatusOK, followers)
}

// GetFollowersCount - get count of approved followers for a user
func GetFollowersCount(c *gin.Context) {
	userID := c.Param("user_id")
	log.Printf("[GetFollowersCount] Getting follower count for user ID: %s", userID)

	query := `
		SELECT COUNT(*) 
		FROM follows 
		WHERE following_id = $1 AND status = 'approved'
	`

	var count int
	err := config.DB.QueryRow(query, userID).Scan(&count)
	if err != nil {
		log.Printf("[GetFollowersCount] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get follower count"})
		return
	}

	log.Printf("[GetFollowersCount] User %s has %d followers", userID, count)
	c.JSON(http.StatusOK, gin.H{
		"user_id":         userID,
		"followers_count": count,
	})
}

// GetFollowingCount - get count of users this user is following (approved)
func GetFollowingCount(c *gin.Context) {
	userID := c.Param("user_id")
	log.Printf("[GetFollowingCount] Getting following count for user ID: %s", userID)

	query := `
		SELECT COUNT(*) 
		FROM follows 
		WHERE follower_id = $1 AND status = 'approved'
	`

	var count int
	err := config.DB.QueryRow(query, userID).Scan(&count)
	if err != nil {
		log.Printf("[GetFollowingCount] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get following count"})
		return
	}

	log.Printf("[GetFollowingCount] User %s is following %d users", userID, count)
	c.JSON(http.StatusOK, gin.H{
		"user_id":         userID,
		"following_count": count,
	})
}

func verifyGoogleToken(idToken string) (string, error) {
	payload, err := idtoken.Validate(context.Background(), idToken, "268718797943-ka8u44ld2gaa75losn91l7vo81iccd2d.apps.googleusercontent.com")
	if err != nil {
		return "", err
	}
	fmt.Println("Payload:", payload)
	email := payload.Claims["email"].(string)
	fmt.Println("Email:", email)
	return email, nil
}

func Unfollow(c *gin.Context) {
	var unfollow models.Follow
	if err := c.ShouldBindJSON(&unfollow); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	query := `
		DELETE FROM follows
		WHERE follower_id = $1 AND following_id = $2
	`
	_, err := config.DB.Exec(query, unfollow.FollowerID, unfollow.FollowingID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unfollow"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Unfollowed successfully"})
}

func ApproveFollowRequest(c *gin.Context) {
	var request struct {
		FollowerID  int `json:"follower_id" binding:"required"`
		FollowingID int `json:"following_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		log.Println("[ApproveFollowRequest] JSON binding error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	log.Printf("[ApproveFollowRequest] Approving follow request: follower_id=%d, following_id=%d",
		request.FollowerID, request.FollowingID)

	// Update the follow request status to "approved"
	query := `
        UPDATE follows 
        SET status = 'approved'
        WHERE follower_id = $1 AND following_id = $2 AND status = 'pending'
    `

	result, err := config.DB.Exec(query, request.FollowerID, request.FollowingID)
	if err != nil {
		log.Println("[ApproveFollowRequest] Database error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve follow request"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Println("[ApproveFollowRequest] Error checking rows affected:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify approval"})
		return
	}

	if rowsAffected == 0 {
		log.Println("[ApproveFollowRequest] No pending follow request found")
		c.JSON(http.StatusNotFound, gin.H{"error": "No pending follow request found"})
		return
	}

	log.Printf("[ApproveFollowRequest] Successfully approved follow request")

	// NEW STEP: Trigger Direct Message Conversation Creation
	log.Println("[ApproveFollowRequest] Triggering chat creation for new follow relationship...")

	// Call a new function to handle the chat creation logic
	chatErr := createDirectChat(request.FollowerID, request.FollowingID)
	if chatErr != nil {
		// Log the error but continue, as the follow approval was successful.
		log.Printf("[ApproveFollowRequest] ⚠️ FAILED to create direct chat between %d and %d: %v", request.FollowerID, request.FollowingID, chatErr)
		// You can return a 200 OK with a warning message to the client
		c.JSON(http.StatusOK, gin.H{
			"message": "Follow request approved, but failed to create chat.",
			"status":  "approved",
		})
		return
	}

	log.Printf("[ApproveFollowRequest] ✅ Direct chat successfully created between %d and %d.", request.FollowerID, request.FollowingID)

	// Get follower details for notification
	var followerName string
	followerQuery := `SELECT full_name FROM users WHERE id = $1`
	err = config.DB.QueryRow(followerQuery, request.FollowerID).Scan(&followerName)
	if err != nil {
		log.Println("[ApproveFollowRequest] Error getting follower name:", err)
		followerName = "Unknown User"
	}

	// Save notification for the follower
	saveSingleNotification(
		request.FollowerID,
		"user",
		"FOLLOW_REQUEST_APPROVED",
		"Follow Request Approved",
		fmt.Sprintf("Your follow request has been approved!"),
		map[string]interface{}{
			"follower_id":  request.FollowerID,
			"following_id": request.FollowingID,
		},
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "Follow request approved successfully",
		"status":  "approved",
	})
}

// createDirectChat is a new helper function to manage the conversation creation logic.
func createDirectChat(user1ID, user2ID int) error {
	// Check if a direct conversation already exists
	// You'll need to write this query to check for an existing conversation
	// with type='direct' and both user1ID and user2ID as members.
	// This part is crucial to avoid duplicate chats.

	// If no existing conversation is found:
	// Create the new conversation record. Note the NULL value for user_id.
	conversationQuery := `
        INSERT INTO conversations (title, type, user_id) 
        VALUES ($1, $2, NULL) RETURNING id
    `
	var conversationID int
	err := config.DB.QueryRow(conversationQuery, "Direct Message", "direct").Scan(&conversationID)
	if err != nil {
		return fmt.Errorf("failed to create new conversation: %w", err)
	}

	// Add both users to the new conversation
	membersQuery := `
        INSERT INTO members (conversation_id, user_id) 
        VALUES ($1, $2), ($1, $3)
    `
	_, err = config.DB.Exec(membersQuery, conversationID, user1ID, user2ID)
	if err != nil {
		return fmt.Errorf("failed to add members to conversation: %w", err)
	}

	return nil
}

// RejectFollowRequest updates the status of a follow request to "rejected"
func RejectFollowRequest(c *gin.Context) {
	var request struct {
		FollowerID  int `json:"follower_id" binding:"required"`
		FollowingID int `json:"following_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		log.Println("[RejectFollowRequest] JSON binding error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	log.Printf("[RejectFollowRequest] Rejecting follow request: follower_id=%d, following_id=%d",
		request.FollowerID, request.FollowingID)

	// Update the follow request status to "rejected" or delete the record
	query := `
		DELETE FROM follows 
		WHERE follower_id = $1 AND following_id = $2 AND status = 'pending'
	`

	result, err := config.DB.Exec(query, request.FollowerID, request.FollowingID)
	if err != nil {
		log.Println("[RejectFollowRequest] Database error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject follow request"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Println("[RejectFollowRequest] Error checking rows affected:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify rejection"})
		return
	}

	if rowsAffected == 0 {
		log.Println("[RejectFollowRequest] No pending follow request found")
		c.JSON(http.StatusNotFound, gin.H{"error": "No pending follow request found"})
		return
	}

	log.Printf("[RejectFollowRequest] Successfully rejected follow request")

	// Save notification for the follower
	saveSingleNotification(
		request.FollowerID,
		"user",
		"FOLLOW_REQUEST_REJECTED",
		"Follow Request Rejected",
		fmt.Sprintf("Your follow request was not approved."),
		map[string]interface{}{
			"follower_id":  request.FollowerID,
			"following_id": request.FollowingID,
		},
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "Follow request rejected successfully",
		"status":  "rejected",
	})
}

// GetPendingFollowRequests retrieves all pending follow requests for a user
func GetPendingFollowRequests(c *gin.Context) {
	userID := c.Param("user_id")

	query := `
		SELECT f.id, f.follower_id, f.following_id, f.status, 
		       u.username, u.full_name, COALESCE(u.image_url, '') as image_url, COALESCE(u.bio, '') as bio
		FROM follows f
		JOIN users u ON f.follower_id = u.id
		WHERE f.following_id = $1 AND f.status = 'pending'
	`

	rows, err := config.DB.Query(query, userID)
	if err != nil {
		log.Println("[GetPendingFollowRequests] Database error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get pending requests"})
		return
	}
	defer rows.Close()

	var requests []gin.H
	for rows.Next() {
		var (
			id, followerID, followingID int
			status, username, fullName  string
			imageURL, bio               sql.NullString
		)

		if err := rows.Scan(&id, &followerID, &followingID, &status,
			&username, &fullName, &imageURL, &bio); err != nil {
			log.Println("[GetPendingFollowRequests] Scan error:", err)
			continue
		}

		request := gin.H{
			"id":           id,
			"follower_id":  followerID,
			"following_id": followingID,
			"status":       status,
			"follower": gin.H{
				"username":  username,
				"full_name": fullName,
				"image_url": imageURL.String,
				"bio":       bio.String,
			},
		}
		requests = append(requests, request)
	}

	c.JSON(http.StatusOK, gin.H{
		"pending_requests": requests,
		"count":            len(requests),
	})
}

func GoogleLoginHandler(c *gin.Context) {
	var req struct {
		IDToken string `json:"id_token"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	email, err := verifyGoogleToken(req.IDToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Google token: " + err.Error()})
		return
	}

	var user models.User
	query := `SELECT id, role FROM users WHERE email=$1`
	err = config.DB.QueryRow(query, email).Scan(&user.ID, &user.Role)
	if err != nil {
		if err == sql.ErrNoRows {
			// 👉 Optionally create user if doesn't exist
			// If you don't want auto-register:
			c.JSON(http.StatusUnauthorized, gin.H{"error": "❌ Email not found"})
			return

			// Otherwise, auto-insert user:
			/*
				insertQuery := `INSERT INTO users (email, role) VALUES ($1, 'user') RETURNING id, role`
				err = config.DB.QueryRow(insertQuery, email).Scan(&user.ID, &user.Role)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
					return
				}
			*/
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "❌ Database error"})
			return
		}
	}

	// ✅ Generate JWT
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, _ := token.SignedString([]byte(os.Getenv("JWT_SECRET")))

	c.JSON(http.StatusOK, gin.H{
		"message": "✅ Google login successful",
		"token":   signedToken,
		"role":    user.Role,
		"user_id": user.ID,
		"email":   email,
	})
}
