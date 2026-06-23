package controllers

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"vite-project/backend/config"

	"github.com/gin-gonic/gin"
)

// SearchCollaborators - Enhanced search for Brands and Influencers
func SearchCollaborators(c *gin.Context) {
	searchQuery := c.Query("q")

	if searchQuery == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query is required"})
		return
	}

	// 1. Prepare Search Terms
	searchQuery = strings.TrimSpace(searchQuery)
	searchLower := strings.ToLower(searchQuery)
	searchParam := "%" + searchLower + "%"

	log.Printf("[SearchCollaborators] Searching for: '%s'", searchLower)

	// 2. The Query
	// We use LOWER(u.role) to handle "Brand", "brand", "brandAdmin", "influencer" variations automatically.
	query := `
		SELECT 
			u.id, u.username, u.full_name, u.email, u.role,
			COALESCE(u.image_url, '') as image_url, 
			COALESCE(u.bio, '') as bio,

			-- Merge Niche (Brand or Influencer)
			COALESCE(b.niche, i.niche, '') as niche,
			
			-- Merge Location
			COALESCE(b.location, i.location, '') as location,
			
			-- Merge Social Link
			COALESCE(b.social_media_link, i.social_media_link, '') as social_media_link,
			
			-- Influencer specific
			COALESCE(i.followers, 0) as followers,
			COALESCE(i.content_type, '') as content_type,
			COALESCE(i.pricing, '') as pricing,

			-- Relevance Score for Sorting
			(
				CASE 
					WHEN LOWER(u.username) = $1 THEN 100
					WHEN LOWER(u.full_name) LIKE $2 THEN 80
					WHEN LOWER(COALESCE(b.niche, i.niche, '')) LIKE $3 THEN 70
					WHEN LOWER(u.username) LIKE $3 THEN 60
					ELSE 10
				END
			) as relevance_score

		FROM users u
		LEFT JOIN brands b ON u.id = b.user_id
		LEFT JOIN influencers i ON u.id = i.user_id
		WHERE 
			u.account_status != 'deleted'
			-- STRICT ROLE FILTER: Only allow Brand variations and Influencers
			AND LOWER(u.role) IN ('brand', 'brandadmin', 'influencer')
			AND (
				LOWER(u.username) LIKE $3 OR 
				LOWER(u.full_name) LIKE $3 OR 
				LOWER(u.email) LIKE $3 OR
				LOWER(COALESCE(b.niche, i.niche, '')) LIKE $3
			)
		ORDER BY relevance_score DESC
		LIMIT 50
	`

	// 3. Execute
	// Params: $1 (Exact), $2 (Starts With), $3 (Contains)
	rows, err := config.DB.Query(query, searchLower, searchLower+"%", searchParam)
	if err != nil {
		log.Printf("[SearchCollaborators] DB Error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error during search"})
		return
	}
	defer rows.Close()

	// 4. Map Results
	var results []CollaboratorProfile

	for rows.Next() {
		var p CollaboratorProfile
		var score int
		var email string // Temp placeholder

		err := rows.Scan(
			&p.UserID, &p.Username, &p.FullName, &email, &p.Role,
			&p.ImageURL, &p.Bio,
			&p.Niche, &p.Location, &p.SocialMediaLink,
			&p.Followers, &p.ContentType, &p.Pricing,
			&score,
		)

		if err != nil {
			log.Printf("[SearchCollaborators] Scan Error: %v", err)
			continue
		}

		p.MatchReason = fmt.Sprintf("Search Result (Score: %d)", score)
		results = append(results, p)
	}

	// 5. Response
	c.JSON(http.StatusOK, gin.H{
		"collaborators": results,
		"count":         len(results),
		"query":         searchQuery,
	})
}
