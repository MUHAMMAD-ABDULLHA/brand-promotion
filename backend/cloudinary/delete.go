package cloudinary

import (
	"context"
	"log"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

// DeleteImage deletes an asset from Cloudinary by its public ID
func DeleteImage(publicID string) error {
	log.Printf("Deleting Cloudinary asset with ID: %s", publicID)

	cld, err := cloudinary.NewFromParams(
		os.Getenv("CLOUDINARYKEYNAME"),
		os.Getenv("CLOUDINARYAPIKEY"),
		os.Getenv("CLOUDINARYAPISECRET"),
	)
	if err != nil {
		return err
	}

	ctx := context.Background()
	_, err = cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})
	if err != nil {
		log.Printf("Failed to delete Cloudinary image with ID %s: %v", publicID, err)
		return err
	}

	log.Printf("Successfully deleted Cloudinary asset: %s", publicID)
	return nil
}
