package models // Or 'database' if you prefer a separate package

import (
	"database/sql"
	"time"
)

// Image represents a media asset stored on Cloudinary.
type Image struct {
	ID           int       `json:"id"`
	UserID       int       `json:"user_id"`
	CloudinaryID string    `json:"cloudinary_id"`
	URL          string    `json:"url"`
	Is3DModel    bool      `json:"is_3d_model"`
	UploadedAt   time.Time `json:"uploaded_at"`
}

type File struct {
	ID           int       `json:"id" db:"id"`
	UserID       int       `json:"user_id" db:"user_id"`
	CloudinaryID string    `json:"cloudinary_id" db:"cloudinary_id"`
	URL          string    `json:"url" db:"url"`
	FileType     string    `json:"file_type" db:"file_type"` // image, video, document, etc.
	UploadedAt   time.Time `json:"uploaded_at" db:"uploaded_at"`
}

// InsertImageRecord inserts a new image record into the 'images' table.
// It returns the ID of the newly created record.
func InsertImageRecord(db *sql.DB, image *Image) (int, error) {
	query := `
		INSERT INTO images (user_id, cloudinary_id, url, is_3d_model, uploaded_at) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING id
	`
	var lastInsertId int
	err := db.QueryRow(
		query,
		image.UserID,
		image.CloudinaryID,
		image.URL,
		image.Is3DModel,
		image.UploadedAt,
	).Scan(&lastInsertId)

	if err != nil {
		return 0, err
	}

	return lastInsertId, nil
}
func InsertFileRecord(db *sql.DB, file *File) (int, error) {
	query := `
		INSERT INTO files (user_id, cloudinary_id, url, file_type, uploaded_at) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING id
	`
	var lastInsertId int
	err := db.QueryRow(
		query,
		file.UserID,
		file.CloudinaryID,
		file.URL,
		file.FileType,
		file.UploadedAt,
	).Scan(&lastInsertId)

	if err != nil {
		return 0, err
	}

	return lastInsertId, nil
}
