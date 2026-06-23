package models

import (
	"fmt"
	"log"
	"time"
	"vite-project/backend/config"
)

// ===========================
// STRUCTS
// ===========================

type Gamification struct {
	ID          int       `json:"id"`
	BrandID     int       `json:"brand_id"`
	AdID        int       `json:"ad_id"`
	Points      int       `json:"points"`
	Description string    `json:"description"`
	MediaURL    string    `json:"media_url"`
	CreatedAt   time.Time `json:"created_at"`
	ExpireDate  time.Time `json:"expire_date"`
}
type tempGamification struct {
	ID          int       `json:"id"`
	BrandID     int       `json:"brand_id"`
	AdID        int       `json:"ad_id"`
	Points      int       `json:"points"`
	Description string    `json:"description"`
	MediaURL    string    `json:"media_url"`
	CreatedAt   time.Time `json:"created_at"`
	ExpireDate  time.Time `json:"expire_date"`
	AdHeadline  string    `json:"ad_headline"`
}

type GamificationAnalytics struct {
	ID        int       `json:"id"`
	GameID    int       `json:"game_id"`
	EventType string    `json:"event_type"`
	UserID    int       `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
}

type UserEngagement struct {
	UserID         int       `json:"user_id"`
	FullName       string    `json:"full_name"`
	Email          string    `json:"email"`
	Username       string    `json:"username"`
	Phone          string    `json:"phone"`
	ImageURL       string    `json:"image_url"`
	TotalEvents    int       `json:"total_events"`
	LastActivityAt time.Time `json:"last_activity_at"`
}

type UserGamificationProgress struct {
	ID           int       `json:"id"`
	UserID       int       `json:"user_id"`
	GameID       int       `json:"game_id"`
	PointsEarned int       `json:"points_earned"`
	LastUpdated  time.Time `json:"last_updated"`
}
type GamificationAnalyticsWithAd struct {
	GamificationAnalytics
	AdID int `json:"ad_id"`
}
type TopUser struct {
	UserID      int    `json:"user_id"`
	FullName    string `json:"full_name"`
	Username    string `json:"username"`
	ImageURL    string `json:"image_url"`
	TotalPoints int    `json:"total_points"`
}

// ===========================
// GAMIFICATION CRUD
// ===========================

// CreateGamification inserts a new gamification record
func CreateGamification(g *Gamification) error {
	query := `
		INSERT INTO gamifications (brand_id, ad_id, points, description, media_url, expire_date)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at;
	`
	return config.DB.QueryRow(query, g.BrandID, g.AdID, g.Points, g.Description, g.MediaURL, g.ExpireDate).
		Scan(&g.ID, &g.CreatedAt)
}

// GetGamificationByID retrieves a single gamification by ID
func GetGamificationByID(id int) (*Gamification, error) {
	query := `
		SELECT id, brand_id, ad_id, points, description, media_url, created_at, expire_date
		FROM gamifications WHERE id = $1
	`
	row := config.DB.QueryRow(query, id)

	var g Gamification
	err := row.Scan(&g.ID, &g.BrandID, &g.AdID, &g.Points, &g.Description, &g.MediaURL, &g.CreatedAt, &g.ExpireDate)
	if err != nil {
		return nil, err
	}
	return &g, nil
}

// GetGamificationsByBrand retrieves all gamifications for a brand
func GetGamificationsByBrand(brandID int) ([]tempGamification, error) {
	query := `
		SELECT g.id, g.brand_id, g.ad_id, g.points, g.description, g.media_url, g.created_at, g.expire_date,
		a.headline
		FROM gamifications g
		JOIN ads a ON g.ad_id = a.id 
		WHERE brand_id = $1 ORDER BY created_at DESC
	`
	rows, err := config.DB.Query(query, brandID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var gamifications []tempGamification
	for rows.Next() {
		var g tempGamification
		if err := rows.Scan(&g.ID, &g.BrandID, &g.AdID, &g.Points, &g.Description, &g.MediaURL, &g.CreatedAt, &g.ExpireDate, &g.AdHeadline); err != nil {
			return nil, err
		}
		gamifications = append(gamifications, g)
	}
	return gamifications, nil
}

// UpdateGamification updates a gamification record
func UpdateGamification(g *Gamification) error {
	query := `
		UPDATE gamifications
		SET ad_id = $1, points = $2, description = $3, media_url = $4, expire_date = $5
		WHERE id = $6 AND brand_id = $7
	`
	_, err := config.DB.Exec(query, g.AdID, g.Points, g.Description, g.MediaURL, g.ExpireDate, g.ID, g.BrandID)
	return err
}

// DeleteGamification deletes a gamification by ID
func DeleteGamification(id, brandID int) error {
	query := `DELETE FROM gamifications WHERE id = $1 AND brand_id = $2`
	_, err := config.DB.Exec(query, id, brandID)
	return err
}

// ===========================
// GAMIFICATION ANALYTICS
// ===========================

func CreateAnalytics(a *GamificationAnalytics) error {
	query := `
		INSERT INTO gamification_analytics (game_id, event_type, user_id)
		VALUES ($1, $2, $3)
		RETURNING id, created_at;
	`
	return config.DB.QueryRow(query, a.GameID, a.EventType, a.UserID).
		Scan(&a.ID, &a.CreatedAt)
}

func GetAnalyticsByBrand(brandID int) ([]GamificationAnalytics, error) {
	query := `
		SELECT 
			ga.id, 
			ga.game_id, 
			ga.event_type, 
			ga.user_id, 
			ga.created_at,
			g.ad_id,
			g.points,
			g.description,
			g.media_url,
			g.created_at AS gamification_created,
			g.expire_date,
			a.headline AS ad_headline
		FROM gamification_analytics ga
		JOIN gamifications g ON ga.game_id = g.id
		LEFT JOIN ads a ON g.ad_id = a.id
		WHERE g.brand_id = $1
		ORDER BY ga.created_at DESC;
	`

	rows, err := config.DB.Query(query, brandID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var analytics []GamificationAnalytics
	for rows.Next() {
		var a GamificationAnalytics
		var temp tempGamification
		var eventType string

		err := rows.Scan(
			&a.ID,
			&a.GameID,
			&eventType,
			&a.UserID,
			&a.CreatedAt,
			&temp.AdID,
			&temp.Points,
			&temp.Description,
			&temp.MediaURL,
			&temp.CreatedAt,
			&temp.ExpireDate,
			&temp.AdHeadline,
		)
		if err != nil {
			return nil, err
		}

		// Calculate event points
		var eventPoints int
		switch eventType {
		case "click":
			eventPoints = 5
		case "share":
			eventPoints = 10
		case "like", "engage", "comment_view":
			eventPoints = 15
		default:
			eventPoints = 0
		}

		// Logically append the computed data
		a.EventType = fmt.Sprintf("%s (+%d pts)", eventType, eventPoints)

		analytics = append(analytics, a)
	}
	return analytics, nil
}

// 	for rows.Next() {
// 		var a GamificationAnalytics
// 		if err := rows.Scan(&a.ID, &a.GameID, &a.EventType, &a.UserID, &a.CreatedAt); err != nil {
// 			return nil, err
// 		}
// 		analytics = append(analytics, a)
// 	}
// 	return analytics, nil
// }

func GetAnalyticsByUser(userID int) ([]GamificationAnalytics, error) {
	query := `
		SELECT 
			ga.id, 
			ga.game_id, 
			ga.event_type, 
			ga.user_id, 
			ga.created_at,
			g.brand_id,
			g.ad_id,
			g.points,
			g.description,
			g.media_url,
			g.created_at AS gamification_created,
			g.expire_date,
			a.headline AS ad_headline
		FROM gamification_analytics ga
		JOIN gamifications g ON ga.game_id = g.id
		LEFT JOIN ads a ON g.ad_id = a.id
		WHERE ga.user_id = $1
		ORDER BY ga.created_at DESC;
	`

	rows, err := config.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var analytics []GamificationAnalytics
	for rows.Next() {
		var a GamificationAnalytics
		var temp tempGamification
		var eventType string

		err := rows.Scan(
			&a.ID,
			&a.GameID,
			&eventType,
			&a.UserID,
			&a.CreatedAt,
			&temp.BrandID,
			&temp.AdID,
			&temp.Points,
			&temp.Description,
			&temp.MediaURL,
			&temp.CreatedAt,
			&temp.ExpireDate,
			&temp.AdHeadline,
		)
		if err != nil {
			return nil, err
		}

		// Assign points based on event type
		var eventPoints int
		switch eventType {
		case "click":
			eventPoints = 5
		case "share":
			eventPoints = 10
		case "like", "engage", "comment_view":
			eventPoints = 15
		default:
			eventPoints = 0
		}

		// Make the event type more descriptive
		a.EventType = fmt.Sprintf("%s (+%d pts)", eventType, eventPoints)

		analytics = append(analytics, a)
	}
	return analytics, nil
}

// ===========================
// USER ENGAGEMENT & PROGRESS
// ===========================

func GetUserEngagementByBrand(brandID int) ([]UserEngagement, error) {
	query := `
		SELECT 
			u.id AS user_id,
			u.full_name,
			u.email,
			u.username,
			u.phone,
			u.image_url,
			COUNT(ga.id) AS total_events,
			MAX(ga.created_at) AS last_activity_at
		FROM users u
		JOIN gamification_analytics ga ON u.id = ga.user_id
		JOIN gamifications g ON ga.game_id = g.id
		WHERE g.brand_id = $1
		GROUP BY u.id, u.full_name, u.email, u.username, u.phone, u.image_url
		ORDER BY last_activity_at DESC;
	`
	rows, err := config.DB.Query(query, brandID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []UserEngagement
	for rows.Next() {
		var ue UserEngagement
		if err := rows.Scan(
			&ue.UserID,
			&ue.FullName,
			&ue.Email,
			&ue.Username,
			&ue.Phone,
			&ue.ImageURL,
			&ue.TotalEvents,
			&ue.LastActivityAt,
		); err != nil {
			return nil, err
		}
		results = append(results, ue)
	}
	return results, nil
}

func CreateOrUpdateUserProgress(userID, gameID, points int) error {
	query := `
		INSERT INTO user_gamification_progress (user_id, game_id, points_earned)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, game_id)
		DO UPDATE SET points_earned = user_gamification_progress.points_earned + EXCLUDED.points_earned,
					  last_updated = CURRENT_TIMESTAMP;
	`
	_, err := config.DB.Exec(query, userID, gameID, points)
	return err
}

func GetUserProgress(userID int) ([]UserGamificationProgress, error) {
	query := `
		SELECT id, user_id, game_id, points_earned, last_updated
		FROM user_gamification_progress
		WHERE user_id = $1
		ORDER BY last_updated DESC;
	`
	rows, err := config.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var progresses []UserGamificationProgress
	for rows.Next() {
		var p UserGamificationProgress
		if err := rows.Scan(&p.ID, &p.UserID, &p.GameID, &p.PointsEarned, &p.LastUpdated); err != nil {
			return nil, err
		}
		progresses = append(progresses, p)
	}
	return progresses, nil
}

func GetLeaderboardByGame(gameID int) ([]UserEngagement, error) {
	query := `
		SELECT 
			u.id AS user_id,
			u.full_name,
			u.image_url,
			ugp.points_earned AS total_points,
			ugp.last_updated
		FROM user_gamification_progress ugp
		JOIN users u ON ugp.user_id = u.id
		WHERE ugp.game_id = $1
		ORDER BY ugp.points_earned DESC
		LIMIT 10;
	`
	rows, err := config.DB.Query(query, gameID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leaderboard []UserEngagement
	for rows.Next() {
		var ue UserEngagement
		if err := rows.Scan(&ue.UserID, &ue.FullName, &ue.ImageURL, &ue.TotalEvents, &ue.LastActivityAt); err != nil {
			return nil, err
		}
		leaderboard = append(leaderboard, ue)
	}
	return leaderboard, nil
}

func GetUserGamificationAnalytics(userID int) ([]GamificationAnalyticsWithAd, error) {
	query := `
		SELECT ga.id, ga.game_id, ga.event_type, ga.user_id, ga.created_at,
		g.ad_id
		FROM gamification_analytics ga
		JOIN gamifications g ON ga.game_id = g.id
		WHERE user_id = $1
		ORDER BY created_at DESC;
	`
	rows, err := config.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var analytics []GamificationAnalyticsWithAd
	for rows.Next() {
		var ga GamificationAnalyticsWithAd
		if err := rows.Scan(&ga.ID, &ga.GameID, &ga.EventType, &ga.UserID, &ga.CreatedAt, &ga.AdID); err != nil {
			return nil, err
		}
		analytics = append(analytics, ga)
	}
	return analytics, nil

}

// ===========================
// LEADERBOARD / TOP USERS
// ===========================

// GetTopThreeGlobalUsers retrieves the top 3 users with the highest sum of points across all games

func GetTopThreeGlobalUsers() ([]TopUser, error) {
	// We calculate points dynamically based on event_type using a CASE statement
	// logic: click=5, share=10, others=15
	query := `
		SELECT 
			u.id, 
			u.full_name, 
			u.username, 
			COALESCE(u.image_url, ''), 
			SUM(
				CASE 
					WHEN ga.event_type = 'click' THEN 5
					WHEN ga.event_type = 'share' THEN 10
					WHEN ga.event_type IN ('like', 'engage', 'comment_view') THEN 15
					ELSE 0 
				END
			) AS total_points
		FROM gamification_analytics ga
		JOIN users u ON ga.user_id = u.id
		GROUP BY u.id, u.full_name, u.username, u.image_url
		ORDER BY total_points DESC
		LIMIT 3;
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		log.Printf("Error querying top users: %v", err)
		return nil, err
	}
	defer rows.Close()

	var topUsers []TopUser
	for rows.Next() {
		var u TopUser
		// Scanning COALESCE(u.image_url, '') ensures we don't crash on NULL images
		if err := rows.Scan(&u.UserID, &u.FullName, &u.Username, &u.ImageURL, &u.TotalPoints); err != nil {
			log.Printf("Error scanning top user row: %v", err)
			return nil, err
		}
		topUsers = append(topUsers, u)
	}

	// Check for errors encountered during iteration
	if err = rows.Err(); err != nil {
		log.Printf("Error iterating top users rows: %v", err)
		return nil, err
	}

	return topUsers, nil
}
