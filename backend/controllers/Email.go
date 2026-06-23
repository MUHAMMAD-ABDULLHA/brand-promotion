package controllers

import (
	"fmt"
	"os"
	"strings"

	"gopkg.in/gomail.v2"
)

// sendEmail sends an email using credentials from environment variables
func sendEmail(to string, subject string, message string) error {
	// Load credentials
	username := os.Getenv("EMAIL_USERNAME")
	rawPassword := os.Getenv("EMAIL_PASSWORD")

	// Remove any accidental spaces in the app password
	password := strings.ReplaceAll(rawPassword, " ", "")

	fmt.Println("[DEBUG] EMAIL_USERNAME:", username)
	fmt.Println("[DEBUG] EMAIL_PASSWORD length:", len(password), "chars")

	// Fail early if env not set
	if username == "" || password == "" {
		return fmt.Errorf("[ERROR] EMAIL_USERNAME or EMAIL_PASSWORD not set in environment")
	}

	fmt.Println("[DEBUG] Preparing email to:", to, "| Subject:", subject)

	// Compose email
	m := gomail.NewMessage()
	m.SetHeader("From", username)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", message)

	// Configure Gmail SMTP (TLS on port 587)
	d := gomail.NewDialer("smtp.gmail.com", 587, username, password)

	// Send email
	err := d.DialAndSend(m)
	if err != nil {
		fmt.Println("[ERROR] Email sending failed:", err)
		return err
	}

	fmt.Println("[DEBUG] Email sent successfully to:", to)
	return nil
}
