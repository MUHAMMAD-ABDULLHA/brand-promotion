package models

type Brand struct {
	User            User   `json:"user"`
	BrandName       string `json:"brand_name"`
	BrandWebsite    string `json:"brand_website"`
	Location        string `json:"location"`
	SocialMediaLink string `json:"social_media_link"`
	Niche           string `json:"niche"`
}
