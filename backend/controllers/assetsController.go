package controllers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"vite-project/backend/cloudinary"
	"vite-project/backend/config"
	"vite-project/backend/models"

	"github.com/gin-gonic/gin"
)

func HandleAssetUpload(c *gin.Context) {
	log.Println("--- Starting HandleAssetUpload ---")

	// 1. Get user_id from URL parameter
	user_id_param := c.Param("user_id")
	log.Printf("Attempting to extract user_id from URL param: %s", user_id_param)

	userID, err := strconv.Atoi(user_id_param)
	if err != nil {
		log.Printf("Error converting user_id_param '%s' to int: %v", user_id_param, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid user ID: %s", err.Error())})
		return
	}
	log.Printf("Successfully parsed userID from URL: %d", userID)

	// 2. Parse multipart form data
	log.Println("Attempting to parse multipart form data for 'asset' file.")
	file, fileHeader, err := c.Request.FormFile("asset")
	if err != nil {
		log.Printf("Error retrieving file from form data (field 'asset'): %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Error retrieving file from form data: %s", err.Error())})
		return
	}
	defer file.Close()
	log.Printf("Successfully retrieved file: %s (Size: %d bytes)", fileHeader.Filename, fileHeader.Size)

	// 3. Upload the asset to Cloudinary
	log.Printf("Attempting to upload file '%s' to Cloudinary...", fileHeader.Filename)
	secureURL, cloudinaryID, is3DModel, err := cloudinary.UploadImage(file, fileHeader.Filename)
	if err != nil {
		log.Printf("Failed to upload asset to Cloudinary: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to upload asset to Cloudinary: %s", err.Error())})
		return
	}
	log.Printf("Cloudinary upload successful. URL: %s, CloudinaryID: %s, Is3DModel: %t", secureURL, cloudinaryID, is3DModel)

	// 4. Create a new Image record
	imageRecord := &models.Image{
		UserID:       userID,
		CloudinaryID: cloudinaryID,
		URL:          secureURL,
		Is3DModel:    is3DModel,
		UploadedAt:   time.Now(),
	}
	log.Printf("Created image record for database: %+v", imageRecord)

	// 5. Insert into DB and get ID
	log.Println("Attempting to insert image record into database...")
	insertedID, err := models.InsertImageRecord(config.DB, imageRecord)
	if err != nil {
		log.Printf("Failed to save image record to database: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save image record to database: %s", err.Error())})
		return
	}
	log.Printf("Image record successfully inserted into database with ID: %d", insertedID)

	// 6. Respond with success + image ID
	c.JSON(http.StatusOK, gin.H{
		"message":     "Asset uploaded and recorded successfully",
		"url":         secureURL,
		"is_3d_model": is3DModel,
		"image_id":    insertedID, // <-- return the new ID here
	})
	log.Println("--- HandleAssetUpload finished successfully ---")
}

func HandleFileUpload(c *gin.Context) {
	log.Println("--- Starting HandleFileUpload ---")

	// 1. Get user_id from URL parameter
	user_id_param := c.Param("user_id")
	log.Printf("Attempting to extract user_id from URL param: %s", user_id_param)

	userID, err := strconv.Atoi(user_id_param)
	if err != nil {
		log.Printf("Error converting user_id_param '%s' to int: %v", user_id_param, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid user ID: %s", err.Error())})
		return
	}
	log.Printf("Successfully parsed userID from URL: %d", userID)

	// 2. Parse multipart form data
	log.Println("Attempting to parse multipart form data for 'file'.")
	file, fileHeader, err := c.Request.FormFile("file")
	if err != nil {
		log.Printf("Error retrieving file from form data (field 'file'): %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Error retrieving file from form data: %s", err.Error())})
		return
	}
	defer file.Close()
	log.Printf("Successfully retrieved file: %s (Size: %d bytes)", fileHeader.Filename, fileHeader.Size)

	// 3. Upload the file to Cloudinary
	log.Printf("Attempting to upload file '%s' to Cloudinary...", fileHeader.Filename)
	secureURL, cloudinaryID, fileType, err := cloudinary.UploadFile(file, fileHeader.Filename)
	if err != nil {
		log.Printf("Failed to upload file to Cloudinary: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to upload file to Cloudinary: %s", err.Error())})
		return
	}
	log.Printf("Cloudinary upload successful. URL: %s, CloudinaryID: %s, FileType: %s", secureURL, cloudinaryID, fileType)

	// 4. Create a new File record
	fileRecord := &models.File{
		UserID:       userID,
		CloudinaryID: cloudinaryID,
		URL:          secureURL,
		FileType:     fileType,
		UploadedAt:   time.Now(),
	}
	log.Printf("Created file record for database: %+v", fileRecord)

	// 5. Insert into DB and get ID
	log.Println("Attempting to insert file record into database...")
	insertedID, err := models.InsertFileRecord(config.DB, fileRecord)
	if err != nil {
		log.Printf("Failed to save file record to database: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save file record to database: %s", err.Error())})
		return
	}
	log.Printf("File record successfully inserted into database with ID: %d", insertedID)

	// 6. Respond with success + file ID
	c.JSON(http.StatusOK, gin.H{
		"message":   "File uploaded and recorded successfully",
		"url":       secureURL,
		"file_id":   insertedID, // return the new file ID
		"file_type": fileType,
	})
	log.Println("--- HandleFileUpload finished successfully ---")
}
