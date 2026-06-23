package controllers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
	"vite-project/backend/models"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
	"github.com/stripe/stripe-go/v81/webhook"
)

func CreateCheckoutSession(c *gin.Context) {
	var requestBody struct {
		UserID   int    `json:"user_id"`
		PlanName string `json:"plan_name"`
		Price    int64  `json:"price"`
	}

	// 🟡 Log: incoming request
	fmt.Println("🔹 [Stripe] Incoming CreateCheckoutSession request...")

	// Parse JSON
	if err := c.BindJSON(&requestBody); err != nil {
		fmt.Printf("❌ [Stripe] Invalid request body: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid request body"})
		return
	}

	fmt.Printf("✅ [Stripe] Received Checkout request | UserID: %d | Plan: %s | Price: %d cents\n",
		requestBody.UserID, requestBody.PlanName, requestBody.Price)

	// 🔍 --- CONSTRAINT & VALIDATION LOGIC START ---
	fmt.Printf("🔍 [Stripe] Validating plan status for UserID: %d...\n", requestBody.UserID)

	// 1. Fetch current plan
	currentPlan, err := models.GetPlanByUserID(requestBody.UserID)
	if err != nil {
		fmt.Printf("⚠️ [Stripe] Plan not found for UserID: %d. Attempting to create default 'standard' plan...\n", requestBody.UserID)

		// Create default plan if it doesn't exist
		if createErr := models.CreateDefaultPlan(requestBody.UserID); createErr != nil {
			fmt.Printf("❌ [Stripe] Failed to create default plan: %v\n", createErr)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to initialize user plan"})
			return
		}

		// Refetch the plan after creation to ensure we have the object
		currentPlan, err = models.GetPlanByUserID(requestBody.UserID)
		if err != nil {
			fmt.Printf("❌ [Stripe] Failed to retrieve plan after creation: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database error retrieving plan"})
			return
		}
		fmt.Println("✅ [Stripe] Default 'standard' plan created successfully.")
	}

	// 2. Constraint: Check if already subscribed to the requested plan
	if currentPlan.PlanType == requestBody.PlanName {
		fmt.Printf("🚫 [Stripe] User %d is already subscribed to %s. Blocking checkout.\n", requestBody.UserID, requestBody.PlanName)
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"error":   fmt.Sprintf("You are currently subscribed to the %s", requestBody.PlanName),
		})
		return
	}

	fmt.Printf("✅ [Stripe] Validation passed. User is on '%s', requesting '%s'. Proceeding...\n", currentPlan.PlanType, requestBody.PlanName)
	// --- CONSTRAINT & VALIDATION LOGIC END ---

	// Set secret key
	stripeKey := os.Getenv("SKSECRETKEY")
	if stripeKey == "" {
		fmt.Println("⚠️ [Stripe] Warning: SKSECRETKEY not set in environment variables!")
	}
	stripe.Key = stripeKey

	// Prepare session parameters
	params := &stripe.CheckoutSessionParams{
		Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String("usd"),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String(requestBody.PlanName),
					},
					UnitAmount: stripe.Int64(requestBody.Price),
				},
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String("http://localhost:5173/payment-success"),
		CancelURL:  stripe.String("http://localhost:5173/payment-cancel"),
		Metadata: map[string]string{
			"user_id":   strconv.Itoa(requestBody.UserID),
			"plan_name": requestBody.PlanName,
		},
	}

	fmt.Println("🟢 [Stripe] Creating Checkout session...")

	// Create Stripe Checkout session
	s, err := session.New(params)
	if err != nil {
		fmt.Printf("❌ [Stripe] Failed to create session: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create checkout session",
			"details": err.Error(),
		})
		return
	}

	fmt.Printf("✅ [Stripe] Checkout session created successfully | SessionID: %s | Plan: %s | UserID: %d\n",
		s.ID, requestBody.PlanName, requestBody.UserID)

	// Respond with session info (no redirect)
	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"session_id": s.ID,
		"url":        s.URL,
	})
}

func HandleStripeWebhook(c *gin.Context) {
	webhookSecret := os.Getenv("WEBHOOK_SECRET")

	log.Println("📥 [Webhook] Received Stripe webhook request")

	// 1️⃣ Read raw payload
	payload, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("❌ [Webhook] Error reading request body: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error reading request body"})
		return
	}
	log.Printf("🧾 [Webhook] Payload received: %d bytes", len(payload))

	// 2️⃣ Retrieve signature header
	signatureHeader := c.GetHeader("Stripe-Signature")
	if signatureHeader == "" {
		log.Println("⚠️ [Webhook] Missing Stripe-Signature header")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing Stripe-Signature header"})
		return
	}
	log.Println("🔐 [Webhook] Stripe-Signature header found, verifying...")

	// 3️⃣ Verify event authenticity
	event, err := webhook.ConstructEventWithOptions(
		payload,
		signatureHeader,
		webhookSecret,
		webhook.ConstructEventOptions{
			IgnoreAPIVersionMismatch: true,
		},
	)
	if err != nil {
		log.Printf("❌ [Webhook] Signature verification failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Signature verification failed"})
		return
	}

	log.Printf("✅ [Webhook] Verified event: %s", event.Type)

	// Variables to hold updated data for response
	var updatedPlan *models.Plan
	var updatedTransactions []models.Transaction

	// 4️⃣ Process event type
	if event.Type == "checkout.session.completed" {
		log.Println("💰 [Webhook] Handling checkout.session.completed event")

		var checkoutSession stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &checkoutSession); err != nil {
			log.Printf("❌ [Webhook] Error parsing webhook JSON: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Error parsing webhook"})
			return
		}

		log.Printf("🧠 [Webhook] Checkout Session ID: %s | Mode: %s", checkoutSession.ID, checkoutSession.Mode)

		// 5️⃣ Retrieve full session details
		fullSession, err := session.Get(checkoutSession.ID, nil)
		if err != nil {
			log.Printf("❌ [Webhook] Error retrieving session details: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving session"})
			return
		}
		log.Printf("📦 [Webhook] Session retrieved | Total: %.2f %s",
			float64(fullSession.AmountTotal)/100, string(fullSession.Currency))

		// 6️⃣ Extract user metadata
		userIDStr, ok := fullSession.Metadata["user_id"]
		if !ok || userIDStr == "" {
			log.Printf("🚨 [Webhook] Missing user_id metadata in session %s", fullSession.ID)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Missing User ID in metadata"})
			return
		}

		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			log.Printf("🚨 [Webhook] Invalid user_id format: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid User ID format"})
			return
		}

		planName, ok := fullSession.Metadata["plan_name"]
		if !ok || planName == "" {
			log.Printf("🚨 [Webhook] Missing plan_name metadata for session %s", fullSession.ID)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Missing plan name in metadata"})
			return
		}

		log.Printf("👤 [Webhook] UserID: %d | Plan: %s", userID, planName)

		// 7️⃣ Extract payment details
		paymentIntentID := ""
		if fullSession.PaymentIntent != nil {
			paymentIntentID = fullSession.PaymentIntent.ID
		}

		maskedCard := ""
		if fullSession.PaymentMethodTypes != nil && len(fullSession.PaymentMethodTypes) > 0 {
			maskedCard = fmt.Sprintf("%s (Stripe)", fullSession.PaymentMethodTypes[0])
		}

		log.Printf("💳 [Webhook] PaymentIntent: %s | Method: %s", paymentIntentID, maskedCard)

		// 8️⃣ Save transaction record
		transaction := &models.Transaction{
			UserID:            userID,
			PaymentToken:      paymentIntentID,
			MaskedCardDetails: maskedCard,
			Amount:            float64(fullSession.AmountTotal) / 100,
			Status:            "completed",
			CreatedAt:         time.Now(),
		}

		log.Println("🗂️ [Webhook] Saving transaction to database...")
		if err := models.CreateTransaction(transaction); err != nil {
			log.Printf("❌ [Webhook] Database error creating transaction: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving transaction"})
			return
		}

		log.Printf("✅ [Webhook] Transaction saved | UserID: %d | Amount: %.2f %s",
			userID, float64(fullSession.AmountTotal)/100, string(fullSession.Currency))

		// 9️⃣ Upgrade the plan
		log.Printf("🚀 [Webhook] Upgrading plan for user %d to '%s'...", userID, planName)
		if err := models.UpgradePlan(userID, planName); err != nil {
			log.Printf("❌ [Webhook] Error upgrading plan: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error upgrading plan"})
			return
		}
		log.Printf("🎉 [Webhook] Plan successfully upgraded for UserID: %d → %s", userID, planName)

		// 🔟 Fetch Updated Data to return (Matches GET API logic)
		log.Println("🔄 [Webhook] Fetching updated Plan and Transactions for response...")

		updatedPlan, err = models.GetPlanByUserID(userID)
		if err != nil {
			log.Printf("⚠️ [Webhook] Failed to fetch updated plan: %v", err)
		}

		updatedTransactions, err = models.GetTransactionsByUser(userID)
		if err != nil {
			log.Printf("⚠️ [Webhook] Failed to fetch updated transactions: %v", err)
		}
	}

	// 1️⃣1️⃣ Respond success to Stripe with Updated Data
	log.Println("📨 [Webhook] Acknowledging event to Stripe (200 OK) with Updated Data")
	c.JSON(http.StatusOK, gin.H{
		"received":     true,
		"plan":         updatedPlan,
		"transactions": updatedTransactions,
	})
}
