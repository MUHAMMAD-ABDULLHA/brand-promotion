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

	Create Post Controller

-----------------------
*/
func CreatePost(c *gin.Context) {
	log.Println("=== [CreatePost] Called ===")

	var post models.Post
	if err := c.ShouldBindJSON(&post); err != nil {
		log.Printf("[ERROR] Binding JSON failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("[DEBUG] Incoming Post Data: %+v", post)

	post.CreatedAt = time.Now()
	post.UpdatedAt = time.Now()

	query := `
		INSERT INTO posts (user_id, caption, image_url, likes, comments_count, impressions, engagement_rate, is_sponsored, created_at, updated_at, image_id)
		VALUES ($1,$2,$3,0,0,0,0,false,$4,$5,$6) RETURNING id
	`
	log.Println("[INFO] Executing Insert Query for Post...")

	err := config.DB.QueryRow(query,
		post.UserID,
		post.Caption,
		post.ImageURL,
		post.CreatedAt,
		post.UpdatedAt,
		post.ImageID,
	).Scan(&post.ID)

	if err != nil {
		log.Printf("[ERROR] DB Insert Failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
		return
	}

	log.Printf("[SUCCESS] Post created successfully with ID: %d", post.ID)
	c.JSON(http.StatusCreated, post)
}

/*
-----------------------

	Get All Posts Controller

-----------------------
*/
func GetAllPosts(c *gin.Context) {
	log.Println("=== [GetAllPosts] Called ===")

	rows, err := config.DB.Query(`
    SELECT 
        p.id, p.caption, COALESCE(p.image_url, '') as image_url, 
        p.likes, p.comments_count, p.impressions, p.engagement_rate, p.is_sponsored, p.created_at, p.updated_at,
        u.id, u.full_name, u.username, COALESCE(u.image_url, '') as image_url
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
	`)

	if err != nil {
		log.Printf("[ERROR] Querying posts failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var post models.Post
		var user models.User
		err := rows.Scan(
			&post.ID, &post.Caption, &post.ImageURL, &post.Likes, &post.CommentsCount, &post.Impressions,
			&post.EngagementRate, &post.IsSponsored, &post.CreatedAt, &post.UpdatedAt,
			&user.ID, &user.FullName, &user.Username, &user.ImageURL,
		)
		if err != nil {
			log.Printf("[ERROR] Row scan failed: %v", err)
			continue
		}
		post.User = user
		posts = append(posts, post)
	}

	log.Printf("[INFO] Total posts fetched: %d", len(posts))
	c.JSON(http.StatusOK, posts)
}

/*
-------------------------------

	Get Users Posts Controller

-------------------------------
*/
func GetUsersPosts(c *gin.Context) {
	userID := c.Param("id")
	log.Printf("=== [GetUsersPosts] Called for UserID: %s ===", userID)
	query := `select * from posts where user_id = $1`
	rows, err := config.DB.Query(query, userID)
	if err != nil {
		log.Printf("[ERROR] Querying user posts failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user posts"})
		return
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var post models.Post
		err := rows.Scan(&post.ID, &post.UserID, &post.Caption, &post.ImageURL, &post.Likes, &post.CommentsCount, &post.Impressions,
			&post.EngagementRate, &post.IsSponsored, &post.CreatedAt, &post.UpdatedAt, &post.ImageID,
		)
		if err != nil {
			log.Printf("[ERROR] Row scan failed: %v", err)
			continue
		}
		posts = append(posts, post)
	}

	log.Printf("[INFO] Total user posts fetched: %d", len(posts))
	c.JSON(http.StatusOK, posts)
}

/*
-----------------------

	Like Post Controller

-----------------------
*/
func LikePost(c *gin.Context) {
	log.Println("=== [LikePost] Called ===")

	postID := c.Param("id")
	userID := c.Query("user_id") // TODO: use JWT later
	log.Printf("[DEBUG] Like Request => PostID: %s | UserID: %s", postID, userID)

	// Check if already liked
	var existing int
	err := config.DB.QueryRow(`SELECT COUNT(*) FROM likes WHERE user_id=$1 AND post_id=$2`, userID, postID).Scan(&existing)
	if err != nil {
		log.Printf("[ERROR] Checking existing like failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking like"})
		return
	}
	if existing > 0 {
		log.Println("[INFO] Post already liked by this user")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already liked"})
		return
	}

	// Insert like
	_, err = config.DB.Exec(`INSERT INTO likes (user_id, post_id) VALUES ($1,$2)`, userID, postID)
	if err != nil {
		log.Printf("[ERROR] Inserting like failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like post"})
		return
	}

	// Update post likes count
	_, err = config.DB.Exec(`UPDATE posts SET likes = likes + 1 WHERE id = $1`, postID)
	if err != nil {
		log.Printf("[ERROR] Updating like count failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update like count"})
		return
	}

	log.Println("[SUCCESS] Post liked successfully")
	c.JSON(http.StatusOK, gin.H{"message": "Post liked successfully"})
}

/*
-----------------------

	Add Comment Controller

-----------------------
*/
func AddComment(c *gin.Context) {
	log.Println("=== [AddComment] Called ===")

	// 1. Bind the incoming JSON
	var input models.Comment
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("[ERROR] Binding JSON failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.CreatedAt = time.Now()

	// 2. INSERT the raw comment and get the generated ID
	// We only need to return the ID here so we can query the full details next
	insertQuery := `
        INSERT INTO comments (post_id, user_id, text, created_at)
        VALUES ($1, $2, $3, $4) 
        RETURNING id
    `
	var newCommentID int
	err := config.DB.QueryRow(insertQuery,
		input.PostID,
		input.UserID,
		input.Text,
		input.CreatedAt,
	).Scan(&newCommentID)

	if err != nil {
		log.Printf("[ERROR] Insert comment failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add comment"})
		return
	}

	// 3. Increment comment count on the post
	_, _ = config.DB.Exec(`UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1`, input.PostID)

	// 4. FETCH the full details (JOIN with Users) for the comment we just created
	// This ensures the response matches exactly what your "Fetch All" endpoint returns
	fetchQuery := `
        SELECT 
            c.id, c.post_id, c.user_id, c.text, c.created_at,
            u.id, u.username, u.full_name, u.image_url
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1
    `

	var fullComment models.Comment
	// We need a temporary struct or variable to hold the user data
	// before assigning it to fullComment.User if your model is nested.
	var commentUser models.User

	err = config.DB.QueryRow(fetchQuery, newCommentID).Scan(
		&fullComment.ID,
		&fullComment.PostID,
		&fullComment.UserID,
		&fullComment.Text,
		&fullComment.CreatedAt,
		&commentUser.ID,
		&commentUser.Username,
		&commentUser.FullName,
		&commentUser.ImageURL,
	)

	if err != nil {
		log.Printf("[ERROR] Fetching full comment details failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Comment created but failed to fetch details"})
		return
	}

	// Nest the user details so React (c.user.username) works correctly
	fullComment.User = commentUser

	log.Printf("[SUCCESS] Comment added and enriched: ID %d", fullComment.ID)

	// 5. Return the Enriched Object
	c.JSON(http.StatusCreated, fullComment)
}

/*
-----------------------

	Get Comments By Post Controller

-----------------------
*/
func GetCommentsByPost(c *gin.Context) {
	log.Println("=== [GetCommentsByPost] Called ===")

	postID := c.Param("id")
	log.Printf("[DEBUG] Fetching comments for PostID: %s", postID)

	rows, err := config.DB.Query(`
		SELECT c.id, c.text, c.created_at, u.id, u.username, u.image_url
		FROM comments c
		JOIN users u ON c.user_id = u.id
		WHERE c.post_id = $1
		ORDER BY c.created_at DESC
	`, postID)
	if err != nil {
		log.Printf("[ERROR] Querying comments failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}
	defer rows.Close()

	var comments []models.Comment
	for rows.Next() {
		var comment models.Comment
		var user models.User
		err := rows.Scan(&comment.ID, &comment.Text, &comment.CreatedAt, &user.ID, &user.Username, &user.ImageURL)
		if err != nil {
			log.Printf("[ERROR] Row scan failed (comment): %v", err)
			continue
		}
		comment.User = user
		comments = append(comments, comment)
	}

	log.Printf("[INFO] Total comments fetched: %d", len(comments))
	c.JSON(http.StatusOK, comments)
}

/*
-----------------------

	Delete Post Controller

-----------------------
*/

func DeletePost(c *gin.Context) {
	log.Println("=== [DeletePost] Called ===")

	postID := c.Param("id")
	log.Printf("[DEBUG] Deleting post with ID: %s", postID)

	// 1. Fetch image_id and cloudinary_id before deletion
	var imageID *int
	var cloudinaryID *string
	err := config.DB.QueryRow(`
		SELECT image_id, (SELECT cloudinary_id FROM images WHERE id = posts.image_id)
		FROM posts WHERE id = $1
	`, postID).Scan(&imageID, &cloudinaryID)

	if err != nil && err != sql.ErrNoRows {
		log.Printf("[ERROR] Failed fetching post image info: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch post info"})
		return
	}

	// 2. Delete related comments
	_, err = config.DB.Exec(`DELETE FROM comments WHERE post_id = $1`, postID)
	if err != nil {
		log.Printf("[ERROR] Deleting related comments failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete related comments"})
		return
	}

	// 3. Delete related likes
	_, err = config.DB.Exec(`DELETE FROM likes WHERE post_id = $1`, postID)
	if err != nil {
		log.Printf("[ERROR] Deleting related likes failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete related likes"})
		return
	}

	// 4. Delete the post itself
	res, err := config.DB.Exec(`DELETE FROM posts WHERE id = $1`, postID)
	if err != nil {
		log.Printf("[ERROR] Deleting post failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post"})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		log.Println("[WARN] No post found to delete")
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// 5. Delete image record + Cloudinary asset if exists
	if imageID != nil {
		_, delErr := config.DB.Exec(`DELETE FROM images WHERE id = $1`, *imageID)
		if delErr != nil {
			log.Printf("[WARN] Failed to delete image record: %v", delErr)
		}
	}
	if cloudinaryID != nil {
		if err := cloudinary.DeleteImage(*cloudinaryID); err != nil {
			log.Printf("[WARN] Failed to delete Cloudinary image: %v", err)
		}
	}

	log.Printf("[SUCCESS] Post ID %s and its image deleted successfully", postID)
	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}

/*
-----------------------

	Delete Comment Controller

-----------------------
*/
func DeleteComment(c *gin.Context) {
	log.Println("=== [DeleteComment] Called ===")

	commentID := c.Param("commentId")
	postID := c.Param("id")
	log.Printf("[DEBUG] Deleting comment ID: %s from Post ID: %s", commentID, postID)

	res, err := config.DB.Exec(`DELETE FROM comments WHERE id = $1 AND post_id = $2`, commentID, postID)
	if err != nil {
		log.Printf("[ERROR] Deleting comment failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comment"})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		log.Println("[WARN] No comment found to delete")
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}

	// Decrement comment count
	_, _ = config.DB.Exec(`UPDATE posts SET comments_count = comments_count - 1 WHERE id = $1`, postID)

	log.Printf("[SUCCESS] Comment ID %s deleted successfully", commentID)
	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}

/*
-----------------------

	Save Post Controller

-----------------------
*/

// SavePost: POST /posts/:post_id/save?user_id=123
func SavePost(c *gin.Context) {
	log.Println("=== [SavePost] Called ===")
	postID := c.Param("id")
	userID := c.Query("user_id")

	if postID == "" || userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing post_id or user_id"})
		return
	}

	// Check if already saved
	var exists int
	err := config.DB.QueryRow(`
        SELECT COUNT(*) FROM saved WHERE user_id=$1 AND post_id=$2
    `, userID, postID).Scan(&exists)
	if err != nil {
		log.Printf("[ERROR] Checking existing save failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking saved status"})
		return
	}
	if exists > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already saved"})
		return
	}

	// Insert into saved table, return saved id and created time
	var savedID int
	var savedAt time.Time
	err = config.DB.QueryRow(`
        INSERT INTO saved (user_id, post_id, created_at)
        VALUES ($1, $2, NOW()) RETURNING id, created_at
    `, userID, postID).Scan(&savedID, &savedAt)
	if err != nil {
		log.Printf("[ERROR] Inserting saved post failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save post"})
		return
	}

	// Fetch the post details and user info to return the same shape as GetSavedPosts
	var postIDInt, postUserID int
	var caption, imageURL, username, userFullName string
	var postCreatedAt, postUpdatedAt time.Time
	var likes, commentsCount, impressions int
	var engagementRate float64
	var isSponsored bool

	err = config.DB.QueryRow(`
        SELECT p.id, p.user_id, p.caption, p.image_url, p.likes, p.comments_count, p.impressions, p.engagement_rate, p.is_sponsored, p.created_at, p.updated_at,
               u.id, u.username, u.full_name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = $1
    `, postID).Scan(
		&postIDInt,
		&postUserID,
		&caption,
		&imageURL,
		&likes,
		&commentsCount,
		&impressions,
		&engagementRate,
		&isSponsored,
		&postCreatedAt,
		&postUpdatedAt,
		&userID, // u.id (overwrites userID var, but we don't need the original string now)
		&username,
		&userFullName,
	)
	if err != nil {
		log.Printf("[ERROR] Fetching post after save failed: %v", err)
		// still return saved meta, but log error
		c.JSON(http.StatusCreated, gin.H{
			"id":       savedID,
			"saved_at": savedAt,
		})
		return
	}

	// build JSON response: { id: savedID, saved_at: savedAt, post: { ... , user: {...} } }
	postMap := map[string]interface{}{
		"id":             postIDInt,
		"user_id":        postUserID,
		"caption":        caption,
		"image_url":      imageURL,
		"likes":          likes,
		"commentsCount":  commentsCount,
		"impressions":    impressions,
		"engagementRate": engagementRate,
		"isSponsored":    isSponsored,
		"createdAt":      postCreatedAt,
		"updatedAt":      postUpdatedAt,
		"user": map[string]interface{}{
			"id":        userID,
			"username":  username,
			"full_name": userFullName,
		},
	}

	resp := map[string]interface{}{
		"id":       savedID,
		"saved_at": savedAt,
		"post":     postMap,
	}

	log.Printf("[SUCCESS] Post %s saved for user %s (SavedID=%d)", postID, userID, savedID)
	c.JSON(http.StatusCreated, resp)
}

// UnsavePost: DELETE /posts/:post_id/save?user_id=123
func UnsavePost(c *gin.Context) {
	log.Println("=== [UnsavePost] Called ===")
	postID := c.Param("id")
	userID := c.Query("user_id")

	if postID == "" || userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing post_id or user_id"})
		return
	}

	res, err := config.DB.Exec(`
        DELETE FROM saved WHERE user_id=$1 AND post_id=$2
    `, userID, postID)
	if err != nil {
		log.Printf("[ERROR] Unsave post failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unsave post"})
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Saved post not found"})
		return
	}

	log.Printf("[SUCCESS] Post %s unsaved for user %s", postID, userID)
	c.JSON(http.StatusOK, gin.H{"message": "Post unsaved successfully", "post_id": postID})
}

// GetSavedPosts: GET /posts/saved/:user_id
func GetSavedPosts(c *gin.Context) {
	log.Println("=== [GetSavedPosts] Called ===")
	userID := c.Param("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing user_id"})
		return
	}
	log.Printf("[DEBUG] Fetching saved posts for UserID: %s", userID)

	// Build response array of saved objects with nested post & user
	var savedPosts []map[string]interface{}

	rows, err := config.DB.Query(`
        SELECT 
            s.id AS saved_id,
            s.created_at AS saved_at,
            p.id, p.user_id, p.caption, p.image_url, p.likes, p.comments_count, p.impressions, p.engagement_rate, p.is_sponsored, p.created_at AS post_created_at, p.updated_at AS post_updated_at,
            u.id AS author_id, u.username, u.full_name
        FROM saved s
        JOIN posts p ON s.post_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE s.user_id = $1
        ORDER BY s.created_at DESC
    `, userID)
	if err != nil {
		log.Printf("[ERROR] Fetching saved posts failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch saved posts"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var savedID int
		var savedAt time.Time
		var pID, pUserID int
		var caption, imageURL, username, userFullName string
		var postCreatedAt, postUpdatedAt time.Time
		var likes, commentsCount, impressions int
		var engagementRate float64
		var isSponsored bool
		var authorID int

		if err := rows.Scan(
			&savedID,
			&savedAt,
			&pID,
			&pUserID,
			&caption,
			&imageURL,
			&likes,
			&commentsCount,
			&impressions,
			&engagementRate,
			&isSponsored,
			&postCreatedAt,
			&postUpdatedAt,
			&authorID,
			&username,
			&userFullName,
		); err != nil {
			log.Printf("[ERROR] Row scan failed: %v", err)
			continue
		}

		postMap := map[string]interface{}{
			"id":             pID,
			"user_id":        pUserID,
			"caption":        caption,
			"image_url":      imageURL,
			"likes":          likes,
			"commentsCount":  commentsCount,
			"impressions":    impressions,
			"engagementRate": engagementRate,
			"isSponsored":    isSponsored,
			"createdAt":      postCreatedAt,
			"updatedAt":      postUpdatedAt,
			"user": map[string]interface{}{
				"id":        authorID,
				"username":  username,
				"full_name": userFullName,
			},
		}

		savedPosts = append(savedPosts, map[string]interface{}{
			"id":       savedID,
			"saved_at": savedAt,
			"post":     postMap,
		})
	}

	log.Printf("[SUCCESS] Found %d saved posts for user %s", len(savedPosts), userID)
	c.JSON(http.StatusOK, savedPosts)
}

func PublishPost(c *gin.Context) {
	var req struct {
		PostID      int `json:"post_id"`
		PublisherID int `json:"publisher_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.PostID == 0 || req.PublisherID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "post_id and publisher_id are required"})
		return
	}

	// Check if already published
	var exists bool
	err := config.DB.QueryRow(`
        SELECT EXISTS (
            SELECT 1 FROM published_posts WHERE post_id=$1 AND publisher_id=$2
        )
    `, req.PostID, req.PublisherID).Scan(&exists)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed checking existing published post"})
		return
	}

	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "post already published by this user"})
		return
	}

	// Insert
	var pubID int
	var publishedAt time.Time
	err = config.DB.QueryRow(`
        INSERT INTO published_posts (post_id, publisher_id, published_at)
        VALUES ($1, $2, NOW())
        RETURNING id, published_at
    `, req.PostID, req.PublisherID).Scan(&pubID, &publishedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to publish post"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":      "Post published successfully",
		"published_id": pubID,
		"post_id":      req.PostID,
		"publisher_id": req.PublisherID,
		"published_at": publishedAt,
	})
}

func UnpublishPost(c *gin.Context) {
	var req struct {
		PostID      int `json:"post_id"`
		PublisherID int `json:"publisher_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := config.DB.Exec(`
        DELETE FROM published_posts
        WHERE post_id=$1 AND publisher_id=$2
    `, req.PostID, req.PublisherID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to unpublish post"})
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "post was not published by this user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post unpublished successfully"})
}

func GetAllPublishedPosts(c *gin.Context) {
	rows, err := config.DB.Query(`
        SELECT 
            pp.id, pp.post_id, pp.publisher_id, pp.published_at,

            p.id, p.user_id, p.caption, p.image_url, 
            p.likes, p.comments_count, p.impressions, 
            p.engagement_rate, p.is_sponsored, 
            p.created_at, p.updated_at, p.image_id

        FROM published_posts pp
        JOIN posts p ON pp.post_id = p.id
        ORDER BY pp.published_at DESC
    `)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed fetching published posts"})
		return
	}
	defer rows.Close()

	var items []models.PublishedPostResponse

	for rows.Next() {
		var resp models.PublishedPostResponse
		var post models.Post

		err := rows.Scan(
			&resp.ID, &resp.PostID, &resp.PublisherID, &resp.PublishedAt,

			&post.ID, &post.UserID, &post.Caption, &post.ImageURL,
			&post.Likes, &post.CommentsCount, &post.Impressions,
			&post.EngagementRate, &post.IsSponsored,
			&post.CreatedAt, &post.UpdatedAt, &post.ImageID,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed scanning published post"})
			return
		}

		resp.Post = post
		items = append(items, resp)
	}

	c.JSON(http.StatusOK, gin.H{"published_posts": items})
}

func GetPublishedPostsByUser(c *gin.Context) {
	userID := c.Param("user_id")

	rows, err := config.DB.Query(`
        SELECT 
            pp.id, pp.post_id, pp.publisher_id, pp.published_at,

            p.id, p.user_id, p.caption, p.image_url, 
            p.likes, p.comments_count, p.impressions, 
            p.engagement_rate, p.is_sponsored, 
            p.created_at, p.updated_at, p.image_id

        FROM published_posts pp
        JOIN posts p ON pp.post_id = p.id
        WHERE pp.publisher_id = $1
        ORDER BY pp.published_at DESC
    `, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user published posts"})
		return
	}
	defer rows.Close()

	var items []models.PublishedPostResponse

	for rows.Next() {
		var resp models.PublishedPostResponse
		var post models.Post

		err := rows.Scan(
			&resp.ID, &resp.PostID, &resp.PublisherID, &resp.PublishedAt,

			&post.ID, &post.UserID, &post.Caption, &post.ImageURL,
			&post.Likes, &post.CommentsCount, &post.Impressions,
			&post.EngagementRate, &post.IsSponsored,
			&post.CreatedAt, &post.UpdatedAt, &post.ImageID,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed scanning"})
			return
		}

		resp.Post = post
		items = append(items, resp)
	}

	c.JSON(http.StatusOK, gin.H{"published_posts": items})
}

func GetPublishedPostByID(c *gin.Context) {
	publishedPostID := c.Param("id")

	row := config.DB.QueryRow(`
        SELECT 
            pp.id, pp.post_id, pp.publisher_id, pp.published_at,

            p.id, p.user_id, p.caption, p.image_url, 
            p.likes, p.comments_count, p.impressions, 
            p.engagement_rate, p.is_sponsored, 
            p.created_at, p.updated_at, p.image_id

        FROM published_posts pp
        JOIN posts p ON pp.post_id = p.id
        WHERE pp.id = $1
        LIMIT 1
    `, publishedPostID)

	var resp models.PublishedPostResponse
	var post models.Post

	err := row.Scan(
		&resp.ID, &resp.PostID, &resp.PublisherID, &resp.PublishedAt,

		&post.ID, &post.UserID, &post.Caption, &post.ImageURL,
		&post.Likes, &post.CommentsCount, &post.Impressions,
		&post.EngagementRate, &post.IsSponsored,
		&post.CreatedAt, &post.UpdatedAt, &post.ImageID,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "published post not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch published post"})
		return
	}

	resp.Post = post

	c.JSON(http.StatusOK, gin.H{"published_post": resp})
}
