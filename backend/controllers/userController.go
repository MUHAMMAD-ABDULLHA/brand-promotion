package controllers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
	"vite-project/backend/cloudinary"
	"vite-project/backend/config"
	"vite-project/backend/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/lib/pq"
)

//////////////////////
// Helper Functions //
//////////////////////

// Fetch current user ID from JWT middleware context
func getUserIDFromContext(c *gin.Context) (int, error) {
	user, exists := c.Get("user")
	if !exists {
		return 0, fmt.Errorf("user not found in context")
	}

	claims, ok := user.(*jwt.StandardClaims)
	if !ok {
		return 0, fmt.Errorf("invalid claims format")
	}

	id, err := strconv.Atoi(claims.Subject)
	if err != nil {
		return 0, fmt.Errorf("invalid user ID format")
	}

	return id, nil
}

func UpdateOwnProfile(c *gin.Context) {
	log.Println("=== UpdateOwnProfile called ===")

	// 1. Get ID from URL param
	idParam := c.Param("id")
	userID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// 2. Bind request JSON body
	var req models.User
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// 3. Prepare UpdatedAt
	req.UpdatedAt = time.Now()

	// --- Fetch old image_id and cloudinary_id ---
	var oldImageID *int
	var oldCloudinaryID *string
	err = config.DB.QueryRow(
		"SELECT image_id, (SELECT cloudinary_id FROM images WHERE id = users.image_id) FROM users WHERE id = $1",
		userID,
	).Scan(&oldImageID, &oldCloudinaryID)
	if err != nil && err != sql.ErrNoRows {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch existing image"})
		return
	}

	// --- If user is uploading a new image ---
	if oldImageID != nil && req.ImageID != 0 && *oldImageID != req.ImageID {
		// Delete old image record
		_, delErr := config.DB.Exec("DELETE FROM images WHERE id = $1", *oldImageID)
		if delErr != nil {
			log.Printf("Warning: Failed to delete old image_id %d: %v", *oldImageID, delErr)
		} else {
			log.Printf("Deleted old image record: %d", *oldImageID)
		}

		// Delete old Cloudinary asset
		if oldCloudinaryID != nil {
			if err := cloudinary.DeleteImage(*oldCloudinaryID); err != nil {
				log.Printf("Warning: Failed to delete old Cloudinary asset %s: %v", *oldCloudinaryID, err)
			}
		}
	}

	// 4. SQL Update query
	query := `
		UPDATE users
		SET email = $1, full_name = $2, username = $3, phone = $4, age = $5, image_url = $6, updated_at = $7,
		    bio = $8, account_status = $9, privacy_status = $10, image_id = $11
		WHERE id = $12
	`
	_, err = config.DB.Exec(query,
		req.Email,
		req.FullName,
		req.Username,
		req.Phone,
		req.Age,
		req.ImageURL,
		req.UpdatedAt,
		req.Bio,
		req.AccountStatus,
		req.PrivacyStatus,
		req.ImageID,
		userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update profile: %v", err)})
		return
	}

	// 5. Fetch the updated user
	var updatedUser models.User
	selectQuery := `
		SELECT id, email, full_name, username, phone, age, image_url, bio,
		       account_status, updated_at, role, privacy_status, image_id
		FROM users
		WHERE id = $1
	`
	err = config.DB.QueryRow(selectQuery, userID).Scan(
		&updatedUser.ID,
		&updatedUser.Email,
		&updatedUser.FullName,
		&updatedUser.Username,
		&updatedUser.Phone,
		&updatedUser.Age,
		&updatedUser.ImageURL,
		&updatedUser.Bio,
		&updatedUser.AccountStatus,
		&updatedUser.UpdatedAt,
		&updatedUser.Role,
		&updatedUser.PrivacyStatus,
		&updatedUser.ImageID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Profile updated but failed to fetch user"})
		return
	}

	// 6. Return response
	c.JSON(http.StatusOK, gin.H{
		"message": "✅ Profile updated successfully",
		"user": gin.H{
			"id":             updatedUser.ID,
			"email":          updatedUser.Email,
			"username":       updatedUser.Username,
			"full_name":      updatedUser.FullName,
			"role":           updatedUser.Role,
			"phone":          updatedUser.Phone,
			"age":            updatedUser.Age,
			"image":          updatedUser.ImageURL,
			"bio":            updatedUser.Bio,
			"account_status": updatedUser.AccountStatus,
			"privacy_status": updatedUser.PrivacyStatus,
			"image_id":       updatedUser.ImageID,
		},
	})
}

// DeleteOwnAccount - user deletes their own account (hard delete)
func DeleteOwnAccount(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Delete brand/influencer details first
	_, _ = config.DB.Exec(`DELETE FROM brands WHERE user_id = $1`, userID)
	_, _ = config.DB.Exec(`DELETE FROM influencers WHERE user_id = $1`, userID)

	// Delete user record
	_, err = config.DB.Exec(`DELETE FROM users WHERE id = $1`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete account: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Account deleted successfully"})
}

func GetAllUsers(c *gin.Context) {
	log.Println("GetAllUsers: Starting query execution")

	query := `
		SELECT u.id, u.email, u.full_name, u.username, u.phone, u.age, u.role, 
		       u.image_url, u.bio, u.account_status,
		       b.brand_name, b.brand_website,
		       i.social_media, i.social_media_link, i.followers
		FROM users u
		LEFT JOIN brands b ON u.id = b.user_id
		LEFT JOIN influencers i ON u.id = i.user_id
		ORDER BY u.id
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		log.Printf("GetAllUsers: Query failed - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch users: %v", err)})
		return
	}
	defer rows.Close()
	log.Println("GetAllUsers: Query executed successfully")

	var users []map[string]interface{}

	for rows.Next() {
		var (
			u            models.User
			imageURL     sql.NullString
			bio          sql.NullString
			accountStat  sql.NullString
			brandName    sql.NullString
			brandWebsite sql.NullString
			socialMedia  sql.NullString
			socialLink   sql.NullString
			followers    sql.NullInt64
		)

		err := rows.Scan(
			&u.ID, &u.Email, &u.FullName, &u.Username, &u.Phone, &u.Age, &u.Role,
			&imageURL, &bio, &accountStat,
			&brandName, &brandWebsite,
			&socialMedia, &socialLink, &followers,
		)
		if err != nil {
			log.Printf("GetAllUsers: Scan error - %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Scan error: %v", err)})
			return
		}

		log.Printf("GetAllUsers: Scanned user ID=%d, Role=%s", u.ID, u.Role)

		userMap := map[string]interface{}{
			"id":        u.ID,
			"email":     u.Email,
			"full_name": u.FullName,
			"username":  u.Username,
			"phone":     u.Phone,
			"age":       u.Age,
			"role":      u.Role,
		}

		// Handle nullable values safely
		if imageURL.Valid {
			userMap["image_url"] = imageURL.String
		}
		if bio.Valid {
			userMap["bio"] = bio.String
		}
		if accountStat.Valid {
			userMap["account_status"] = accountStat.String
		}
		if brandName.Valid {
			userMap["brand_name"] = brandName.String
		}
		if brandWebsite.Valid {
			userMap["brand_website"] = brandWebsite.String
		}
		if socialMedia.Valid {
			userMap["social_media"] = socialMedia.String
		}
		if socialLink.Valid {
			userMap["social_media_link"] = socialLink.String
		}
		if followers.Valid {
			userMap["followers"] = followers.Int64
		}

		users = append(users, userMap)
		log.Printf("GetAllUsers: Added user ID=%d to response", u.ID)
	}

	if err = rows.Err(); err != nil {
		log.Printf("GetAllUsers: Row iteration error - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Row iteration error: %v", err)})
		return
	}

	log.Printf("GetAllUsers: Returning %d users", len(users))
	c.JSON(http.StatusOK, users)
}

// GetUsersByRole - fetch users by role (admin filter)
func GetUsersByRole(c *gin.Context) {
	role := c.Param("role")

	query := `
		SELECT id, email, full_name, username, phone, age, role, image_url, bio, account_status
		FROM users
		WHERE role = $1
	`
	rows, err := config.DB.Query(query, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch users: %v", err)})
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Email, &u.FullName, &u.Username, &u.Phone, &u.Age, &u.Role, &u.ImageURL, &u.Bio, &u.AccountStatus); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Scan error: %v", err)})
			return
		}
		users = append(users, u)
	}

	c.JSON(http.StatusOK, users)
}

// UpdateUserRole - admin can update user role
func UpdateUserRole(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Role string `json:"role"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	query := `UPDATE users SET role = $1, updated_at = $2 WHERE id = $3`
	_, err := config.DB.Exec(query, req.Role, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update role: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User role updated successfully"})
}

// DeleteUsers - admin bulk delete users (hard delete)
func DeleteUsers(c *gin.Context) {
	var req struct {
		IDs []int `json:"ids"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if len(req.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No IDs provided"})
		return
	}

	// Delete related data first
	_, _ = config.DB.Exec(`DELETE FROM brands WHERE user_id = ANY($1)`, pq.Array(req.IDs))
	_, _ = config.DB.Exec(`DELETE FROM influencers WHERE user_id = ANY($1)`, pq.Array(req.IDs))

	// Delete user records
	_, err := config.DB.Exec(`DELETE FROM users WHERE id = ANY($1)`, pq.Array(req.IDs))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete users: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Users deleted successfully"})
}

//////////////////////
// Search Operations //
//////////////////////

// SearchUsers - enhanced search users by username, name, or email with ranking
func SearchUsers(c *gin.Context) {
	searchQuery := c.Query("q")
	log.Printf("[SearchUsers] === SEARCH REQUEST START ===")
	log.Printf("[SearchUsers] Raw query parameter: '%s'", searchQuery)

	if searchQuery == "" {
		log.Printf("[SearchUsers] Empty search query provided")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query is required"})
		return
	}

	// Clean and prepare search query
	searchQuery = strings.TrimSpace(searchQuery)
	if searchQuery == "" {
		log.Printf("[SearchUsers] Search query is empty after trimming")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query cannot be empty"})
		return
	}

	// Convert to lowercase for case-insensitive search
	searchLower := strings.ToLower(searchQuery)
	searchParam := "%" + searchLower + "%"

	// Handle multi-word searches
	words := strings.Fields(searchLower)
	isMultiWord := len(words) > 1

	log.Printf("[SearchUsers] Cleaned query: '%s'", searchQuery)
	log.Printf("[SearchUsers] Lowercase query: '%s'", searchLower)
	log.Printf("[SearchUsers] Search parameter: '%s'", searchParam)
	log.Printf("[SearchUsers] Words: %v", words)
	log.Printf("[SearchUsers] Is multi-word: %v", isMultiWord)

	// Build query based on whether it's multi-word or single word
	var query string
	var params []interface{}

	if isMultiWord {
		// Multi-word search with enhanced name matching
		query = `
			SELECT 
				id, username, full_name, email, image_url, bio, role,
				(
					-- Exact email match gets highest priority (score 1000)
					CASE WHEN LOWER(email) = $1 THEN 1000
					-- Email starts with query (score 900)
					WHEN LOWER(email) LIKE $2 THEN 900
					-- Email contains query (score 800)
					WHEN LOWER(email) LIKE $3 THEN 800
					-- Exact username match (score 700)
					WHEN LOWER(username) = $1 THEN 700
					-- Username starts with query (score 600)
					WHEN LOWER(username) LIKE $2 THEN 600
					-- Username contains query (score 500)
					WHEN LOWER(username) LIKE $3 THEN 500
					-- Full name exact match (score 450)
					WHEN LOWER(full_name) = $1 THEN 450
					-- Full name starts with query (score 400)
					WHEN LOWER(full_name) LIKE $2 THEN 400
					-- All words found in full name (for "John Doe" searches)
					WHEN ` + buildAllWordsFoundCondition(len(words)) + ` THEN 350
					-- Full name contains query (score 300)
					WHEN LOWER(full_name) LIKE $3 THEN 300
					-- Default score for other matches
					ELSE 100
					END
				) AS relevance_score
			FROM users
			WHERE 
				(
					LOWER(email) LIKE $3 OR 
					LOWER(username) LIKE $3 OR 
					LOWER(full_name) LIKE $3 OR
					(` + buildAllWordsFoundCondition(len(words)) + `)
				)
				AND account_status != 'deleted'
			ORDER BY relevance_score DESC, username ASC
			LIMIT 20
		`

		// Prepare parameters for multi-word search
		params = []interface{}{
			searchLower,       // $1 - exact match
			searchLower + "%", // $2 - starts with
			searchParam,       // $3 - contains
		}

		// Add individual word parameters
		for _, word := range words {
			params = append(params, "%"+word+"%")
		}

	} else {
		// Single word search
		query = `
			SELECT 
				id, username, full_name, email, image_url, bio, role,
				(
					-- Exact email match gets highest priority (score 1000)
					CASE WHEN LOWER(email) = $1 THEN 1000
					-- Email starts with query (score 900)
					WHEN LOWER(email) LIKE $2 THEN 900
					-- Email contains query (score 800)
					WHEN LOWER(email) LIKE $3 THEN 800
					-- Exact username match (score 700)
					WHEN LOWER(username) = $1 THEN 700
					-- Username starts with query (score 600)
					WHEN LOWER(username) LIKE $2 THEN 600
					-- Username contains query (score 500)
					WHEN LOWER(username) LIKE $3 THEN 500
					-- Full name starts with query (score 400)
					WHEN LOWER(full_name) LIKE $2 THEN 400
					-- Full name contains query (score 300)
					WHEN LOWER(full_name) LIKE $3 THEN 300
					-- Default score for other matches
					ELSE 100
					END
				) AS relevance_score
        FROM users
			WHERE 
				(
					LOWER(email) LIKE $3 OR 
					LOWER(username) LIKE $3 OR 
					LOWER(full_name) LIKE $3
				)
				AND account_status != 'deleted'
			ORDER BY relevance_score DESC, username ASC
        LIMIT 20
    `

		// Prepare parameters for single word search
		params = []interface{}{
			searchLower,       // $1 - exact match
			searchLower + "%", // $2 - starts with
			searchParam,       // $3 - contains
		}
	}

	log.Printf("[SearchUsers] Executing search for query: '%s'", searchQuery)
	log.Printf("[SearchUsers] Using params: %v", params)
	log.Printf("[SearchUsers] Multi-word search: %v", isMultiWord)

	rows, err := config.DB.Query(query, params...)
	if err != nil {
		log.Printf("[SearchUsers] Query error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search users"})
		return
	}
	defer rows.Close()

	log.Printf("[SearchUsers] Query executed successfully")

	var users []map[string]interface{}
	for rows.Next() {
		var (
			id       int
			username string
			fullName string
			email    string
			imageURL sql.NullString
			bio      sql.NullString
			role     string
			score    int
		)

		if err := rows.Scan(&id, &username, &fullName, &email, &imageURL, &bio, &role, &score); err != nil {
			log.Printf("[SearchUsers] Scan error: %v", err)
			log.Printf("[SearchUsers] Failed to scan row, continuing to next row")
			continue
		}

		log.Printf("[SearchUsers] Found user: ID=%d, Username=%s, FullName=%s, Email=%s, Role=%s, Score=%d",
			id, username, fullName, email, role, score)

		// Safely handle NULL values
		imageURLValue := ""
		if imageURL.Valid {
			imageURLValue = imageURL.String
		}

		bioValue := ""
		if bio.Valid {
			bioValue = bio.String
		}

		userResult := map[string]interface{}{
			"id":        id,
			"username":  username,
			"full_name": fullName,
			"email":     email,
			"image_url": imageURLValue,
			"bio":       bioValue,
			"role":      role,
		}

		users = append(users, userResult)
	}

	if len(users) == 0 {
		users = []map[string]interface{}{} // Return empty array instead of null
		log.Printf("[SearchUsers] No users found for query: '%s'", searchQuery)
	} else {
		log.Printf("[SearchUsers] Found %d users for query: '%s'", len(users), searchQuery)
	}

	response := gin.H{
		"users": users,
		"query": searchQuery,
		"count": len(users),
	}

	log.Printf("[SearchUsers] Returning response: %+v", response)
	c.JSON(http.StatusOK, response)
}

// Helper function to build multi-word condition
func buildMultiWordCondition(words []string, startParam int) string {
	if len(words) <= 1 {
		return "FALSE"
	}

	conditions := make([]string, len(words))
	for i := range words {
		conditions[i] = fmt.Sprintf("LOWER(full_name) LIKE $%d", startParam+i)
	}
	return strings.Join(conditions, " AND ")
}

// Helper function to build condition for finding all words in full name
func buildAllWordsFoundCondition(wordCount int) string {
	if wordCount <= 1 {
		return "FALSE"
	}

	conditions := make([]string, wordCount)
	for i := 0; i < wordCount; i++ {
		conditions[i] = fmt.Sprintf("LOWER(full_name) LIKE $%d", 4+i)
	}
	return strings.Join(conditions, " AND ")
}

// AdvancedSearchUsers - enhanced search with fuzzy matching and better performance
func AdvancedSearchUsers(c *gin.Context) {
	searchQuery := c.Query("q")
	role := c.Query("role") // Optional role filter
	limit := c.Query("limit")

	if searchQuery == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query is required"})
		return
	}

	// Parse limit with default value
	searchLimit := 20
	if limit != "" {
		if parsedLimit, err := strconv.Atoi(limit); err == nil && parsedLimit > 0 && parsedLimit <= 50 {
			searchLimit = parsedLimit
		}
	}

	// Clean and prepare search query
	searchQuery = strings.TrimSpace(searchQuery)
	searchLower := strings.ToLower(searchQuery)

	// Handle email-like queries
	isEmailQuery := strings.Contains(searchQuery, "@")

	// Split into words for name matching
	words := strings.Fields(searchLower)

	// Build base query
	baseQuery := `
		SELECT DISTINCT
			u.id, u.username, u.full_name, u.email, COALESCE(u.image_url, '') as image_url, COALESCE(u.bio, '') as bio, u.role,
			-- Enhanced relevance scoring
			(
				-- Perfect email match (highest priority)
				CASE WHEN LOWER(u.email) = $1 THEN 2000
				-- Email starts with query
				WHEN LOWER(u.email) LIKE $2 THEN 1800
				-- Email contains query 
				WHEN LOWER(u.email) LIKE $3 THEN 1500
				-- Perfect username match
				WHEN LOWER(u.username) = $1 THEN 1200
				-- Username starts with query
				WHEN LOWER(u.username) LIKE $2 THEN 1000
				-- Username contains query
				WHEN LOWER(u.username) LIKE $3 THEN 800
				-- Full name exact match
				WHEN LOWER(u.full_name) = $1 THEN 900
				-- Full name starts with query
				WHEN LOWER(u.full_name) LIKE $2 THEN 700
				-- Full name contains all words (for "John Doe" matching)
				WHEN ` + buildAllWordsCondition(words) + ` THEN 600
				-- Full name contains query
				WHEN LOWER(u.full_name) LIKE $3 THEN 500
				-- Partial word matches in full name
				WHEN ` + buildPartialWordsCondition(words) + ` THEN 300
				ELSE 100
				END
			) AS relevance_score
		FROM users u
		WHERE (
			LOWER(u.email) LIKE $3 OR 
			LOWER(u.username) LIKE $3 OR 
			LOWER(u.full_name) LIKE $3
			` + buildAdditionalConditions(words, isEmailQuery) + `
		)
		` + buildRoleFilter(role) + `
		AND u.account_status != 'deleted'
		ORDER BY relevance_score DESC, 
				 CASE WHEN LOWER(u.username) LIKE $2 THEN 0 ELSE 1 END,
				 u.username ASC
		LIMIT $` + strconv.Itoa(getNextParamIndex(words, role, isEmailQuery))

	// Prepare parameters
	params := buildSearchParams(searchLower, words, role, searchLimit, isEmailQuery)

	rows, err := config.DB.Query(baseQuery, params...)
	if err != nil {
		log.Printf("Advanced search error: %v", err)
		log.Printf("Query: %s", baseQuery)
		log.Printf("Params: %v", params)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed"})
		return
	}
	defer rows.Close()

	var users []map[string]interface{}
	for rows.Next() {
		var (
			id       int
			username string
			fullName string
			email    string
			imageURL sql.NullString
			bio      sql.NullString
			role     string
			score    int
		)

		if err := rows.Scan(&id, &username, &fullName, &email, &imageURL, &bio, &role, &score); err != nil {
			log.Printf("Advanced search scan error: %v", err)
			continue
		}

		// Safely handle NULL values
		imageURLValue := ""
		if imageURL.Valid {
			imageURLValue = imageURL.String
		}

		bioValue := ""
		if bio.Valid {
			bioValue = bio.String
		}

		userResult := map[string]interface{}{
			"id":        id,
			"username":  username,
			"full_name": fullName,
			"email":     email,
			"image_url": imageURLValue,
			"bio":       bioValue,
			"role":      role,
		}

		users = append(users, userResult)
	}

	response := gin.H{
		"users":    users,
		"query":    searchQuery,
		"count":    len(users),
		"has_more": len(users) == searchLimit,
		"filters": gin.H{
			"role": role,
		},
	}

	c.JSON(http.StatusOK, response)
}

// Helper functions for advanced search
func buildAllWordsCondition(words []string) string {
	if len(words) <= 1 {
		return "FALSE"
	}

	conditions := make([]string, len(words))
	for i := range words {
		conditions[i] = fmt.Sprintf("LOWER(u.full_name) LIKE $%d", 4+i)
	}
	return strings.Join(conditions, " AND ")
}

func buildPartialWordsCondition(words []string) string {
	if len(words) <= 1 {
		return "FALSE"
	}

	conditions := make([]string, len(words))
	for i := range words {
		conditions[i] = fmt.Sprintf("LOWER(u.full_name) LIKE $%d", 4+len(words)+i)
	}
	return strings.Join(conditions, " OR ")
}

func buildAdditionalConditions(words []string, isEmailQuery bool) string {
	conditions := ""

	if len(words) > 1 {
		// Add condition for all words in full name
		conditions += " OR (" + buildAllWordsCondition(words) + ")"
	}

	if isEmailQuery {
		// Add specific email domain matching
		conditions += " OR LOWER(u.email) LIKE CONCAT('%', $1, '%')"
	}

	return conditions
}

func buildRoleFilter(role string) string {
	if role != "" {
		return " AND u.role = $" + strconv.Itoa(getNextParamIndex([]string{}, role, false)-1)
	}
	return ""
}

func getNextParamIndex(words []string, role string, isEmailQuery bool) int {
	index := 4 + len(words)*2 // Base params + word params
	if role != "" {
		index++
	}
	if isEmailQuery {
		index++
	}
	return index
}

func buildSearchParams(searchLower string, words []string, role string, limit int, isEmailQuery bool) []interface{} {
	params := []interface{}{
		searchLower,             // $1 - exact match
		searchLower + "%",       // $2 - starts with
		"%" + searchLower + "%", // $3 - contains
	}

	// Add word parameters for all words condition
	for _, word := range words {
		params = append(params, "%"+word+"%")
	}

	// Add word parameters for partial words condition
	for _, word := range words {
		params = append(params, "%"+word+"%")
	}

	// Add role filter if specified
	if role != "" {
		params = append(params, role)
	}

	// Add limit
	params = append(params, limit)

	return params
}

// OptimizeSearchIndexes - helper function to create database indexes for better search performance
// This should be run once during database setup
func OptimizeSearchIndexes(c *gin.Context) {
	// Note: These should be run manually in your database for optimal performance
	indexes := []string{
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username_lower ON users (LOWER(username));",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_fullname_lower ON users (LOWER(full_name));",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users (role);",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_account_status ON users (account_status);",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_search_composite ON users (LOWER(email), LOWER(username), LOWER(full_name));",
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Database indexes for optimal search performance",
		"indexes": indexes,
		"note":    "Run these SQL commands manually in your database for better search performance",
	})
}

// GetUserProfile - get public profile of any user
func GetUserProfile(c *gin.Context) {
	username := c.Param("username")

	var user models.User
	query := `
        SELECT id, username, full_name, image_url, bio, created_at
        FROM users
        WHERE username = $1
    `
	err := config.DB.QueryRow(query, username).Scan(
		&user.ID, &user.Username, &user.FullName, &user.ImageURL, &user.Bio,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get user: %v", err)})
		return
	}

	// Get post count
	var postCount int
	err = config.DB.QueryRow("SELECT COUNT(*) FROM posts WHERE user_id = $1", user.ID).Scan(&postCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get post count: %v", err)})
		return
	}

	// Get follower/following counts
	var followersCount, followingCount int
	err = config.DB.QueryRow("SELECT COUNT(*) FROM followers WHERE following_id = $1", user.ID).Scan(&followersCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get followers count: %v", err)})
		return
	}
	err = config.DB.QueryRow("SELECT COUNT(*) FROM followers WHERE follower_id = $1", user.ID).Scan(&followingCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get following count: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": user,
		"stats": gin.H{
			"posts":     postCount,
			"followers": followersCount,
			"following": followingCount,
		},
	})
}
