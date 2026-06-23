package controllers

import (
	"database/sql"
	"log"
	"net/http"
	"time"
	"vite-project/backend/cloudinary"
	"vite-project/backend/config"
	"vite-project/backend/models"

	"github.com/gin-gonic/gin"
)

/*
-----------------------

	Create Story

-----------------------
*/
func CreateStory(c *gin.Context) {
	log.Println("=== [CreateStory] Called ===")

	var story models.Story
	if err := c.ShouldBindJSON(&story); err != nil {
		log.Printf("[ERROR] Binding JSON failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	story.CreatedAt = time.Now()
	story.ExpiresAt = story.CreatedAt.Add(24 * time.Hour) // expires in 24h
	log.Printf("[INFO] Creating story for UserID=%d with ImageURL=%s", story.UserID, story.ImageURL)

	err := config.DB.QueryRow(`
        INSERT INTO stories (user_id, image_url, created_at, expires_at, image_id)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, story.UserID, story.ImageURL, story.CreatedAt, story.ExpiresAt, story.ImageID).Scan(&story.ID)

	if err != nil {
		log.Printf("[ERROR] Failed to insert story: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create story"})
		return
	}

	log.Printf("[SUCCESS] Story created with ID=%d", story.ID)
	c.JSON(http.StatusCreated, story)
}

/*
-----------------------

	Edit Story

-----------------------
*/
func EditStory(c *gin.Context) {
	log.Println("=== [EditStory] Called ===")

	storyID := c.Param("id")
	log.Printf("[INFO] Editing story ID=%s", storyID)

	var story models.Story
	if err := c.ShouldBindJSON(&story); err != nil {
		log.Printf("[ERROR] Binding JSON failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := config.DB.Exec(`
        UPDATE stories SET image_url=$1 WHERE id=$2
    `, story.ImageURL, storyID)

	if err != nil {
		log.Printf("[ERROR] Failed to update story ID=%s: %v", storyID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to edit story"})
		return
	}

	log.Printf("[SUCCESS] Story ID=%s updated to ImageURL=%s", storyID, story.ImageURL)
	c.JSON(http.StatusOK, gin.H{"message": "Story updated"})
}

/*
-----------------------

	Delete Story

-----------------------
*/
func DeleteStory(c *gin.Context) {
	log.Println("=== [DeleteStory] Called ===")

	storyID := c.Param("id")
	log.Printf("[INFO] Deleting story ID=%s", storyID)

	// 1. Fetch story's image_id + cloudinary_id before deletion
	var imageID *int
	var cloudinaryID *string
	err := config.DB.QueryRow(`
		SELECT image_id, (SELECT cloudinary_id FROM images WHERE id = stories.image_id)
		FROM stories
		WHERE id = $1
	`, storyID).Scan(&imageID, &cloudinaryID)

	if err != nil && err != sql.ErrNoRows {
		log.Printf("[ERROR] Failed fetching story image info: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch story info"})
		return
	}

	// 2. Delete story itself
	res, err := config.DB.Exec(`DELETE FROM stories WHERE id=$1`, storyID)
	if err != nil {
		log.Printf("[ERROR] Failed to delete story ID=%s: %v", storyID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete story"})
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		log.Printf("[WARN] Story ID=%s not found for deletion", storyID)
		c.JSON(http.StatusNotFound, gin.H{"error": "Story not found"})
		return
	}

	// 3. Delete related image record + Cloudinary asset
	if imageID != nil {
		_, delErr := config.DB.Exec(`DELETE FROM images WHERE id=$1`, *imageID)
		if delErr != nil {
			log.Printf("[WARN] Failed to delete image record (ID=%d): %v", *imageID, delErr)
		} else {
			log.Printf("[INFO] Deleted image record ID=%d", *imageID)
		}
	}
	if cloudinaryID != nil {
		if err := cloudinary.DeleteImage(*cloudinaryID); err != nil {
			log.Printf("[WARN] Failed to delete Cloudinary image %s: %v", *cloudinaryID, err)
		} else {
			log.Printf("[INFO] Deleted Cloudinary asset %s", *cloudinaryID)
		}
	}

	log.Printf("[SUCCESS] Story ID=%s deleted", storyID)
	c.JSON(http.StatusOK, gin.H{"message": "Story deleted successfully"})
}

// /*
// -----------------------

// 	Clean Expired Stories

// -----------------------
// */
// func CleanExpiredStories() {
// 	log.Println("=== [CleanExpiredStories] Called ===")

// 	result, err := config.DB.Exec(`DELETE FROM stories WHERE expires_at < NOW()`)
// 	if err != nil {
// 		log.Printf("[ERROR] Cleaning expired stories failed: %v", err)
// 	} else {
// 		rows, _ := result.RowsAffected()
// 		log.Printf("[SUCCESS] Expired stories cleaned, %d rows deleted", rows)
// 	}
// }

/*
-----------------------

	Get Story by ID

-----------------------
*/
func GetStory(c *gin.Context) {
	log.Println("=== [GetStory] Called ===")

	// Clean expired stories before fetching
	CleanExpiredStories()

	storyID := c.Param("id")
	log.Printf("[INFO] Fetching story ID=%s", storyID)

	var story models.Story
	err := config.DB.QueryRow(`
        SELECT id, user_id, image_url, created_at, expires_at
        FROM stories WHERE id=$1
    `, storyID).Scan(&story.ID, &story.UserID, &story.ImageURL, &story.CreatedAt, &story.ExpiresAt)

	if err != nil {
		log.Printf("[ERROR] Story ID=%s not found: %v", storyID, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Story not found"})
		return
	}

	log.Printf("[SUCCESS] Story found: %+v", story)
	c.JSON(http.StatusOK, story)
}

/*
-----------------------

	Get All Stories for a User

-----------------------
*/
func GetUserStories(c *gin.Context) {
	log.Println("=== [GetUserStories] Called ===")

	// Clean expired stories before fetching
	CleanExpiredStories()

	userID := c.Param("user_id")
	log.Printf("[INFO] Fetching stories for UserID=%s", userID)

	rows, err := config.DB.Query(`
        SELECT id, user_id, image_url, created_at, expires_at
        FROM stories WHERE user_id=$1 ORDER BY created_at DESC
    `, userID)
	if err != nil {
		log.Printf("[ERROR] Failed to fetch stories for UserID=%s: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stories"})
		return
	}
	defer rows.Close()

	var stories []models.Story
	for rows.Next() {
		var s models.Story
		if err := rows.Scan(&s.ID, &s.UserID, &s.ImageURL, &s.CreatedAt, &s.ExpiresAt); err != nil {
			log.Printf("[ERROR] Scanning story failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning story"})
			return
		}
		stories = append(stories, s)
	}

	log.Printf("[SUCCESS] Found %d stories for UserID=%s", len(stories), userID)
	c.JSON(http.StatusOK, stories)
}

/*
-----------------------

	Clean Expired Stories

-----------------------
*/
func CleanExpiredStories() {
	log.Println("=== [CleanExpiredStories] Called ===")

	result, err := config.DB.Exec(`DELETE FROM stories WHERE expires_at < NOW()`)
	if err != nil {
		log.Printf("[ERROR] Cleaning expired stories failed: %v", err)
	} else {
		rows, _ := result.RowsAffected()
		log.Printf("[SUCCESS] Expired stories cleaned, %d rows deleted", rows)
	}
}

/*
-----------------------

	Get Stories From Following Users

-----------------------
*/

func GetFollowingStories(c *gin.Context) {
	log.Println("=== [GetFollowingStories] Called ===")

	// Clean expired stories before fetching
	CleanExpiredStories()

	userID := c.Param("user_id")
	log.Printf("[INFO] Fetching stories from users followed by UserID=%s", userID)

	// ✅ Query with users join to fetch full_name
	query := `
        SELECT s.id, s.user_id, u.full_name, s.image_url, s.created_at, s.expires_at
        FROM stories s
        INNER JOIN follows f ON f.following_id = s.user_id
        INNER JOIN users u ON u.id = s.user_id
        WHERE f.follower_id = $1 AND f.status IN ('approved','accepted')
        ORDER BY s.created_at DESC
    `

	rows, err := config.DB.Query(query, userID)
	if err != nil {
		log.Printf("[ERROR] Failed to fetch following stories for UserID=%s: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stories"})
		return
	}
	defer rows.Close()

	var stories []models.Story
	for rows.Next() {
		var s models.Story
		var fullName string
		if err := rows.Scan(
			&s.ID,
			&s.UserID,
			&fullName,
			&s.ImageURL,
			&s.CreatedAt,
			&s.ExpiresAt,
		); err != nil {
			log.Printf("[ERROR] Scanning story failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning story"})
			return
		}

		// ✅ Populate only the FullName inside the nested User
		s.User = models.User{
			ID:       s.UserID,
			FullName: fullName,
		}

		stories = append(stories, s)
	}

	log.Printf("[SUCCESS] Found %d stories from following users of UserID=%s", len(stories), userID)
	c.JSON(http.StatusOK, stories)
}
