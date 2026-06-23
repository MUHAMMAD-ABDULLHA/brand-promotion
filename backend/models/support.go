package models

import (
	"time"
	"vite-project/backend/config"
)

// Support represents a customer support request submitted by a user.
type Support struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	Email       string    `json:"email"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}
type SupportWithUser struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	Email       string    `json:"email"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	FullName    string    `json:"full_name"`
	ImageURL    string    `json:"image_url"`
}

// CreateSupport inserts a new support request into the database.
func CreateSupport(support *Support) error {
	query := `
		INSERT INTO support (user_id, email, description, created_at)
		VALUES ($1, $2, $3, NOW())
		RETURNING id, created_at
	`
	err := config.DB.QueryRow(query, support.UserID, support.Email, support.Description).
		Scan(&support.ID, &support.CreatedAt)
	return err
}

// GetSupportByID retrieves a single support request by ID.
func GetSupportByID(id int) (*SupportWithUser, error) {
	query := `
		SELECT 
			s.id, 
			s.user_id, 
			s.email, 
			s.description, 
			s.created_at,
			u.full_name,
			u.image_url
		FROM support s
		JOIN users u ON s.user_id = u.id
		WHERE s.id = $1
	`
	var s SupportWithUser
	err := config.DB.QueryRow(query, id).Scan(
		&s.ID,
		&s.UserID,
		&s.Email,
		&s.Description,
		&s.CreatedAt,
		&s.FullName,
		&s.ImageURL,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

/*
	============================================================
	  GetSupportByUser — now includes joined user data

============================================================
*/
func GetSupportByUser(userID int) ([]SupportWithUser, error) {
	query := `
		SELECT 
			s.id,
			s.user_id,
			s.email,
			s.description,
			s.created_at,
			u.full_name,
			u.image_url
		FROM support s
		JOIN users u ON s.user_id = u.id
		WHERE s.user_id = $1
		ORDER BY s.created_at DESC
	`
	rows, err := config.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var supports []SupportWithUser
	for rows.Next() {
		var s SupportWithUser
		if err := rows.Scan(
			&s.ID,
			&s.UserID,
			&s.Email,
			&s.Description,
			&s.CreatedAt,
			&s.FullName,
			&s.ImageURL,
		); err != nil {
			return nil, err
		}
		supports = append(supports, s)
	}
	return supports, nil
}

/*
	============================================================
	  GetAllSupport — Admin View with joined user data

============================================================
*/
func GetAllSupport() ([]SupportWithUser, error) {
	query := `
		SELECT 
			s.id,
			s.user_id,
			s.email,
			s.description,
			s.created_at,
			u.full_name,
			u.image_url
		FROM support s
		JOIN users u ON s.user_id = u.id
		ORDER BY s.created_at DESC
	`
	rows, err := config.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var supports []SupportWithUser
	for rows.Next() {
		var s SupportWithUser
		if err := rows.Scan(
			&s.ID,
			&s.UserID,
			&s.Email,
			&s.Description,
			&s.CreatedAt,
			&s.FullName,
			&s.ImageURL,
		); err != nil {
			return nil, err
		}
		supports = append(supports, s)
	}
	return supports, nil
}
