package cloudinary

import (
	"context"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

var cld *cloudinary.Cloudinary

func InitCloudinary() {
	log.Println("Reading CLOUDINARY_CLOUD_NAME:", os.Getenv("CLOUDINARYKEYNAME"))
	log.Println("Reading CLOUDINARY_API_KEY:", os.Getenv("CLOUDINARYAPIKEY"))
	log.Println("Reading CLOUDINARY_API_SECRET:", os.Getenv("CLOUDINARYAPISECRET"))

	var err error
	cld, err = cloudinary.NewFromParams(
		os.Getenv("CLOUDINARYKEYNAME"),
		os.Getenv("CLOUDINARYAPIKEY"),
		os.Getenv("CLOUDINARYAPISECRET"),
	)
	if err != nil {
		panic("Failed to initialize Cloudinary: " + err.Error())
	}
	log.Println("✅ Cloudinary initialized successfully")
}

// UploadImage now returns secureURL, publicID, is3DModel, and error
func UploadImage(file multipart.File, fileName string) (string, string, bool, error) {
	ctx := context.Background()

	is3DModel := false
	ext := filepath.Ext(fileName)
	if ext == ".glb" || ext == ".gltf" || ext == ".obj" || ext == ".fbx" || ext == ".usdz" {
		is3DModel = true
	}

	uploadResult, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		UseFilename:    api.Bool(true),
		UniqueFilename: api.Bool(true),
		ResourceType:   "auto",
	})
	if err != nil {
		log.Printf("Cloudinary API call error: %v", err) // Log specific API error
		return "", "", false, err
	}

	// ADD THIS LOG: Inspect the full uploadResult
	log.Printf("Cloudinary raw upload result: %+v", uploadResult)

	return uploadResult.SecureURL, uploadResult.PublicID, is3DModel, nil
}

func UploadFile(file multipart.File, fileName string) (string, string, string, error) {
	ctx := context.Background()

	ext := strings.ToLower(filepath.Ext(fileName))
	fileType := "file"
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif":
		fileType = "image"
	case ".mp4", ".mov":
		fileType = "video"
	case ".pdf", ".docx", ".zip":
		fileType = "document"
	}

	uploadResult, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		UseFilename:    api.Bool(true),
		UniqueFilename: api.Bool(true),
		ResourceType:   "auto",
	})
	if err != nil {
		return "", "", "", err
	}

	return uploadResult.SecureURL, uploadResult.PublicID, fileType, nil
}
