package controllers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"
	"vite-project/backend/config"
	"vite-project/backend/models"
	"vite-project/backend/ws"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // Tighten in production
}

// =====================
// Create Conversation - ENHANCED FOR ROBUSTNESS AND LOGGING
// =====================

func CreateConversation(c *gin.Context) {
	log.Println("[CreateConversation] called")

	// Request body structure - match frontend payload (camelCase on frontend, snake_case here)
	var body struct {
		UserID         int    `json:"userId"`               // Creator's user ID
		Type           string `json:"type"`                 // "direct" or "group"
		CampaignID     int    `json:"campaignId,omitempty"` // Note: frontend uses 'campaignId'
		Title          string `json:"title,omitempty"`
		ParticipantIDs []int  `json:"participantIds"` // Note: frontend uses 'participantIds'
	}

	// Attempt to bind JSON request body
	if err := c.ShouldBindJSON(&body); err != nil {
		log.Printf("[CreateConversation] ❌ Bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request body: %v", err)})
		return
	}
	log.Printf("[CreateConversation] ✅ Payload received: %+v", body)

	// Validate essential inputs
	if body.Type != "direct" && body.Type != "group" {
		log.Println("[CreateConversation] ❌ Validation error: Invalid conversation type")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation type"})
		return
	}

	if len(body.ParticipantIDs) == 0 {
		log.Println("[CreateConversation] ❌ Validation error: At least one participant is required")
		c.JSON(http.StatusBadRequest, gin.H{"error": "At least one participant is required"})
		return
	}

	ctx := c.Request.Context()

	// Use transaction for atomicity
	tx, err := config.DB.BeginTx(ctx, nil)
	if err != nil {
		log.Printf("[CreateConversation] ❌ BeginTx error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB transaction error"})
		return
	}
	rolledBack := false
	defer func() {
		if !rolledBack {
			_ = tx.Rollback()
			log.Println("[CreateConversation] Transaction rolled back.")
		}
	}()

	// Handle nullable CampaignID and Title for DB insertion
	var dbCampaignID sql.NullInt32
	var dbTitle sql.NullString

	// ----- IMPORTANT VARIABLE FIXES: populate dbCampaignID and dbTitle based on body -----
	// Treat zero campaign id as NULL (frontend omitting campaign => 0)
	if body.CampaignID != 0 {
		dbCampaignID.Int32 = int32(body.CampaignID)
		dbCampaignID.Valid = true
	} else {
		dbCampaignID.Valid = false
	}

	// Treat empty title as NULL (frontend omitting title => empty string)
	if body.Title != "" {
		dbTitle.String = body.Title
		dbTitle.Valid = true
	} else {
		dbTitle.Valid = false
	}
	// ------------------------------------------------------------------------------------

	// Insert conversation with creator's user_id
	insertConv := `
		INSERT INTO conversations (user_id, type, campaign_id, title)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	var conv models.Conversation
	conv.UserID = body.UserID // Set creator ID
	conv.Type = body.Type
	conv.CampaignID = body.CampaignID // Keep the value for response
	conv.Title = body.Title           // Keep the value for response

	log.Printf("[CreateConversation] Attempting to insert conversation into DB: Type=%s, CampaignID=%v, Title=%s, UserID=%d",
		conv.Type, dbCampaignID, dbTitle.String, conv.UserID)

	err = tx.QueryRowContext(ctx, insertConv, conv.UserID, conv.Type, dbCampaignID, dbTitle).
		Scan(&conv.ID, &conv.CreatedAt)
	if err != nil {
		log.Printf("[CreateConversation] ❌ DB insert conversation error: %v", err)
		_ = tx.Rollback()
		rolledBack = true
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create conversation: %v", err)})
		return
	}
	log.Printf("[CreateConversation] ✅ Conversation inserted. ID: %d, CreatedAt: %s", conv.ID, conv.CreatedAt.String())

	// Insert members. Ensure the creator (UserID) is always added.
	insertMember := `
		INSERT INTO conversation_members (conversation_id, user_id, joined_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT DO NOTHING
	`
	addedCount := 0
	allParticipants := uniqueInts(append(body.ParticipantIDs, body.UserID)) // Ensure creator is included and unique

	for _, pid := range allParticipants {
		res, err := tx.ExecContext(ctx, insertMember, conv.ID, pid)
		if err != nil {
			log.Printf("[CreateConversation] ❌ Failed to add member %d to conversation %d: %v", pid, conv.ID, err)
			_ = tx.Rollback()
			rolledBack = true
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to add participant %d: %v", pid, err)})
			return
		}
		if ra, _ := res.RowsAffected(); ra > 0 {
			addedCount++
			log.Printf("[CreateConversation] ✅ Added member %d to conversation %d (rows affected: %d)", pid, conv.ID, ra)
		} else {
			log.Printf("[CreateConversation] Member %d already present or no-op for conversation %d (rows affected: %d)", pid, conv.ID, ra)
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		log.Printf("[CreateConversation] ❌ Commit error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit conversation creation"})
		return
	}
	rolledBack = true // Prevent deferred rollback

	log.Printf("[CreateConversation] ✅ Conversation id=%d type=%s created successfully with %d participants (added: %d)",
		conv.ID, conv.Type, len(allParticipants), addedCount)

	c.JSON(http.StatusCreated, gin.H{
		"conversation":  conv,
		"members_added": addedCount,
	})
}

// Helper to check if an int is in a slice of ints (used by CreateConversation for unique participants)
func containsInt(arr []int, v int) bool {
	for _, x := range arr {
		if x == v {
			return true
		}
	}
	return false
}

// uniqueInts returns a new slice with unique elements from the input slice.
func uniqueInts(input []int) []int {
	seen := make(map[int]bool)
	result := []int{}
	for _, val := range input {
		if _, ok := seen[val]; !ok {
			seen[val] = true
			result = append(result, val)
		}
	}
	return result
}

// =====================
// Add Member to Conversation (Direct Call)
// =====================
// This function allows adding a single member to an existing conversation.
// The campaign approval flow will use `AddCollaboratorToCampaignChat` instead.
func AddConversationMember(c *gin.Context) {
	log.Println("[AddConversationMember] called")

	convId, _ := strconv.Atoi(c.Param("id"))
	var body struct {
		UserID int `json:"user_id"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		log.Printf("[AddConversationMember] Bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[AddConversationMember] Add user=%d to conversation=%d", body.UserID, convId)

	_, err := config.DB.Exec(`
		INSERT INTO conversation_members (conversation_id, user_id, joined_at)
		VALUES ($1,$2,NOW())
		ON CONFLICT DO NOTHING
	`, convId, body.UserID)
	if err != nil {
		log.Printf("[AddConversationMember] DB error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add member"})
		return
	}

	log.Printf("[AddConversationMember] Success → conv=%d added user=%d", convId, body.UserID)
	c.JSON(http.StatusOK, gin.H{"message": "member added"})
}

// =====================
// Get Conversations for User - FIXED! (as per previous conversation)
// =====================
func GetConversationsForUser(c *gin.Context) {
	uid := c.Param("user_id")
	log.Printf("[GetConversationsForUser] START — user_id param = %s", uid)

	query := `
		SELECT
			c.id,
			c.type,
			c.campaign_id,
			c.title,
			c.created_at
		FROM conversations c
		JOIN conversation_members cm ON cm.conversation_id = c.id
		WHERE cm.user_id = $1
		ORDER BY c.created_at DESC
	`
	log.Printf("[GetConversationsForUser] Executing query:\n%s\nWith parameter: %s", query, uid)

	rows, err := config.DB.Query(query, uid)
	if err != nil {
		log.Printf("[GetConversationsForUser] ❌ Query error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch conversations"})
		return
	}
	defer rows.Close()

	var out []models.Conversation
	for rows.Next() {
		var conv models.Conversation
		var campaignID sql.NullInt32
		var title sql.NullString

		if scanErr := rows.Scan(&conv.ID, &conv.Type, &campaignID, &title, &conv.CreatedAt); scanErr != nil {
			log.Printf("[GetConversationsForUser] ⚠️ Row scan error: %v", scanErr)
			continue
		}

		out = append(out, conv)
	}

	if err := rows.Err(); err != nil {
		log.Printf("[GetConversationsForUser] ⚠️ Rows iteration error: %v", err)
	}

	log.Printf("[GetConversationsForUser] ✅ Found %d conversations for user=%s", len(out), uid)
	log.Printf("[GetConversationsForUser] Conversations slice: %+v", out)

	c.JSON(http.StatusOK, out)
}

// =====================
// Get Messages for Conversation (as per previous conversation)
// =====================
func GetMessagesByConversation(c *gin.Context) {
	convId := c.Param("id")
	log.Printf("[GetMessagesByConversation] called for conv=%s", convId)

	rows, err := config.DB.Query(`
		SELECT id, conversation_id, sender_id, content, file_url, message_type, created_at, read_by
		FROM messages
		WHERE conversation_id = $1
		ORDER BY created_at DESC
		LIMIT 100
	`, convId)
	if err != nil {
		log.Printf("[GetMessagesByConversation] Query error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}
	defer rows.Close()

	var msgs []models.Message
	for rows.Next() {
		var m models.Message
		var readBy sql.NullString
		if scanErr := rows.Scan(&m.ID, &m.ConversationID, &m.SenderID, &m.Content, &m.FileURL, &m.MessageType, &m.CreatedAt, &readBy); scanErr != nil {
			log.Printf("[GetMessagesByConversation] Row scan error: %v", scanErr)
			continue
		}
		if readBy.Valid {
			m.ReadBy = &readBy.String
		} else {
			m.ReadBy = nil
		}
		msgs = append(msgs, m)
	}
	log.Printf("[GetMessagesByConversation] Found %d messages for conv=%s", len(msgs), convId)
	c.JSON(http.StatusOK, msgs)
}

// =====================
// Save Message Helper (as per previous conversation)
// =====================
func saveMessageToDB(msg *models.Message) error {
	log.Printf("[saveMessageToDB] Saving message for conv=%d sender=%v", msg.ConversationID, msg.SenderID)
	query := `
		INSERT INTO messages (conversation_id, sender_id, content, file_url, message_type, created_at)
		VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, created_at
	`
	err := config.DB.QueryRow(query, msg.ConversationID, msg.SenderID, msg.Content, msg.FileURL, msg.MessageType, time.Now()).Scan(&msg.ID, &msg.CreatedAt)
	if err != nil {
		log.Printf("[saveMessageToDB] DB error: %v", err)
	}
	return err
}

// =====================
// Create Message (HTTP Fallback) - (as per previous conversation)
// =====================
func CreateMessage(c *gin.Context) {
	convID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	var req struct {
		Content     string `json:"text"`
		FileURL     string `json:"file_url"`
		MessageType string `json:"message_type"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	uid := c.GetInt("user_id")
	if uid == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	message := models.Message{
		ConversationID: convID,
		SenderID:       &uid,
		MessageType:    req.MessageType,
	}
	if req.Content != "" {
		message.Content = &req.Content
	}
	if req.FileURL != "" {
		message.FileURL = &req.FileURL
	}

	err = config.DB.QueryRow(`
		INSERT INTO messages (conversation_id, sender_id, content, file_url, message_type, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, created_at
	`, message.ConversationID, message.SenderID, message.Content, message.FileURL, message.MessageType).
		Scan(&message.ID, &message.CreatedAt)
	if err != nil {
		log.Printf("[CreateMessage] Failed to save message to DB: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save message: %v", err)})
		return
	}
	log.Printf("[CreateMessage] Message saved to DB: ID=%d, ConvID=%d", message.ID, message.ConversationID)

	wsPayload := gin.H{
		"event": "message",
		"data": gin.H{
			"id":              message.ID,
			"conversation_id": message.ConversationID,
			"sender_id":       message.SenderID,
			"content":         message.Content,
			"file_url":        message.FileURL,
			"message_type":    message.MessageType,
			"created_at":      message.CreatedAt,
		},
	}

	rows, err := config.DB.Query(`
		SELECT user_id FROM conversation_members
		WHERE conversation_id = $1
	`, convID)
	if err != nil {
		log.Printf("[CreateMessage] Error getting conversation members for broadcast: %v", err)
		c.JSON(http.StatusOK, message)
		return
	}
	defer rows.Close()

	var memberID int
	for rows.Next() {
		if err := rows.Scan(&memberID); err != nil {
			log.Printf("[CreateMessage] Error scanning member ID for broadcast: %v", err)
			continue
		}
		if client, ok := ws.DefaultHub.GetClient(memberID); ok {
			if err := client.SendJSON(wsPayload); err != nil {
				log.Printf("[CreateMessage] Error sending to user %d via WebSocket: %v", memberID, err)
			}
		}
	}
	log.Printf("[CreateMessage] Message %d broadcasted to members of conversation %d", message.ID, convID)

	c.JSON(http.StatusOK, message)
}

// =====================
// WebSocket Handler - FIXED MESSAGE PARSING
// =====================
func HandleWS(c *gin.Context) {
	log.Println("[WS] HandleWS called")

	UserIDStr := c.Query("user_id")
	if UserIDStr == "" {
		log.Println("[WS] Missing user_id query param")
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id required"})
		return
	}
	uid, err := strconv.Atoi(UserIDStr)
	if err != nil {
		log.Printf("[WS] invalid user_id: %s", UserIDStr)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[WS] upgrade error: %v", err)
		return
	}
	client := &ws.Client{UserID: uid, Conn: conn}
	ws.DefaultHub.AddClient(uid, client)
	defer func() {
		ws.DefaultHub.RemoveClient(uid)
		conn.Close()
	}()

	log.Printf("[WS] Client connected user=%d", uid)

	for {
		var wsMsg models.WSMessage
		if err := conn.ReadJSON(&wsMsg); err != nil {
			log.Printf("[WS] read error user=%d: %v", uid, err)
			break
		}
		// Log the received payload for debugging
		log.Printf("[WS] Received event=%s from user=%d conv=%d payload=%+v", wsMsg.Event, uid, wsMsg.ConversationID, wsMsg.Payload)

		switch wsMsg.Event {
		case "message":
			// Assert payload to map[string]interface{} to access nested fields
			payloadMap, ok := wsMsg.Payload.(map[string]interface{})
			if !ok {
				log.Printf("[WS] Error: Message payload is not a map for user=%d, conv=%d", uid, wsMsg.ConversationID)
				_ = client.SendJSON(gin.H{"event": "error", "message": "Invalid message payload format"})
				continue
			}

			// Extract content, file_url, and message_type from the nested payload
			content := ""
			if s, ok := payloadMap["content"].(string); ok {
				content = s
			}
			fileUrl := ""
			if f, ok := payloadMap["file_url"].(string); ok {
				fileUrl = f
			}
			messageType := "text" // Default to text
			if mt, ok := payloadMap["message_type"].(string); ok {
				messageType = mt
			}

			msg := &models.Message{
				ConversationID: wsMsg.ConversationID,
				SenderID:       &uid,
				Content:        &content,    // Assign extracted content
				FileURL:        &fileUrl,    // Assign extracted fileUrl
				MessageType:    messageType, // Assign extracted messageType (CRITICAL FIX)
			}

			// Log the message struct before saving for verification
			log.Printf("[WS] Prepared message for DB: %+v", msg)

			if err := saveMessageToDB(msg); err != nil {
				log.Printf("[WS] Failed to save message to DB user=%d, conv=%d: %v", uid, wsMsg.ConversationID, err)
				_ = client.SendJSON(gin.H{"event": "error", "message": "Failed to save message"})
				continue
			}

			// Broadcast logic (unchanged)
			rows, err := config.DB.Query(`SELECT user_id FROM conversation_members WHERE conversation_id = $1`, wsMsg.ConversationID)
			if err != nil {
				log.Printf("[WS] members query error: %v", err)
				continue
			}
			var memberID int
			for rows.Next() {
				_ = rows.Scan(&memberID)
				if memberClient, ok := ws.DefaultHub.GetClient(memberID); ok {
					out := gin.H{
						"event": "message",
						"data": gin.H{
							"id":              msg.ID,
							"conversation_id": msg.ConversationID,
							"sender_id":       msg.SenderID,
							"content":         msg.Content,
							"file_url":        msg.FileURL,
							"message_type":    msg.MessageType,
							"created_at":      msg.CreatedAt,
						},
					}
					_ = memberClient.SendJSON(out)
				}
			}
			rows.Close()

		case "signal_offer", "signal_answer", "signal_candidate":
			pl, ok := wsMsg.Payload.(map[string]interface{})
			if !ok {
				log.Printf("[WS] invalid signaling payload")
				continue
			}
			targetFloat, ok := pl["target_user_id"].(float64)
			if !ok {
				log.Printf("[WS] signaling missing target_user_id")
				continue
			}
			target := int(targetFloat)
			if targetClient, ok := ws.DefaultHub.GetClient(target); ok {
				_ = targetClient.SendJSON(gin.H{
					"event": wsMsg.Event,
					"data":  pl,
				})
			}
		default:
			log.Printf("[WS] Unknown event: %s", wsMsg.Event)
			_ = client.SendJSON(gin.H{"event": "error", "message": fmt.Sprintf("Unknown event type: %s", wsMsg.Event)})
		}
	}
}

// ===========================================
// Helper Function: Add Collaborator to Campaign Chat (as per previous conversation)
// This function finds or creates a conversation for a campaign and adds the user.
// It SHOULD BE CALLED FROM YOUR CAMPAIGN CONTROLLER when a collaborator approves.
// ===========================================
func AddCollaboratorToCampaignChat(combineCampaignID, approvedCollaboratorID int) error {
	log.Printf("[AddCollaboratorToCampaignChat] Called for combine_campaign_id %d and approved_collaborator_id %d", combineCampaignID, approvedCollaboratorID)

	// 1. Get the actual campaign_id and admin_id (creator of the combine campaign)
	var campaignID, adminID int
	err := config.DB.QueryRow("SELECT campaign_id, admin_id FROM combine_campaign WHERE id = $1", combineCampaignID).Scan(&campaignID, &adminID)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("combine campaign with ID %d not found", combineCampaignID)
		}
		return fmt.Errorf("failed to retrieve campaign_id and admin_id for combine campaign %d: %w", combineCampaignID, err)
	}
	log.Printf("[AddCollaboratorToCampaignChat] Found campaignID: %d, AdminID: %d for combine_campaign %d", campaignID, adminID, combineCampaignID)

	// 2. Try to find an existing conversation for this campaign
	var conversationID int
	// Attempt to find a conversation specifically linked to this campaignID
	err = config.DB.QueryRow("SELECT id FROM conversations WHERE campaign_id = $1", campaignID).Scan(&conversationID)

	// Use a transaction for conversation creation and initial member addition to ensure atomicity
	tx, err := config.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			panic(r)
		} else if err != nil {
			tx.Rollback()
		} else {
			err = tx.Commit()
		}
	}()

	// If no conversation exists for this campaign, create a new one (this shouldn't happen if frontend creates it upfront)
	if err == sql.ErrNoRows {
		log.Printf("[AddCollaboratorToCampaignChat] WARNING: No existing conversation found for campaign %d during approval. Creating a new one (should have been created by brand).", campaignID)

		insertConvQuery := `
			INSERT INTO conversations (type, campaign_id, title, user_id)
			VALUES ($1, $2, $3, $4)
			RETURNING id
		`
		err = tx.QueryRow(insertConvQuery, "group", campaignID, fmt.Sprintf("Campaign #%d Chat", campaignID), adminID).Scan(&conversationID)
		if err != nil {
			return fmt.Errorf("failed to create new conversation for campaign %d: %w", campaignID, err)
		}
		log.Printf("[AddCollaboratorToCampaignChat] New conversation %d created (fallback) for campaign %d.", conversationID, campaignID)

		// Add the admin to the conversation
		_, err = tx.Exec("INSERT INTO conversation_members (conversation_id, user_id, joined_at) VALUES ($1, $2, NOW()) ON CONFLICT (conversation_id, user_id) DO NOTHING", conversationID, adminID)
		if err != nil {
			log.Printf("[AddCollaboratorToCampaignChat] Failed to add admin %d to (fallback) new conversation %d: %v", adminID, conversationID, err)
			return fmt.Errorf("failed to add admin to new conversation (fallback): %w", err)
		}
		log.Printf("[AddCollaboratorToCampaignChat] Added admin %d to (fallback) new conversation %d.", adminID, conversationID)

		// Add existing approved collaborators (excluding the current one) to this fallback chat
		approvedCollabsQuery := `
			SELECT collaborator_id
			FROM combine_campaign_collaborators
			WHERE combine_campaign_id = $1 AND approved = 'approved' AND collaborator_id != $2
		`
		rows, err := tx.Query(approvedCollabsQuery, combineCampaignID, approvedCollaboratorID)
		if err != nil {
			log.Printf("[AddCollaboratorToCampaignChat] Failed to query existing approved collaborators for (fallback) chat: %v", err)
			return fmt.Errorf("failed to query existing approved collaborators for (fallback) chat: %w", err)
		}
		defer rows.Close()

		for rows.Next() {
			var existingCollabID int
			if err := rows.Scan(&existingCollabID); err != nil {
				log.Printf("[AddCollaboratorToCampaignChat] Failed to scan existing collaborator ID for (fallback) chat: %v", err)
				continue
			}
			_, err = tx.Exec("INSERT INTO conversation_members (conversation_id, user_id, joined_at) VALUES ($1, $2, NOW()) ON CONFLICT (conversation_id, user_id) DO NOTHING", conversationID, existingCollabID)
			if err != nil {
				log.Printf("[AddCollaboratorToCampaignChat] Failed to add existing approved collaborator %d to (fallback) new conversation %d: %v", existingCollabID, conversationID, err)
			} else {
				log.Printf("[AddCollaboratorToCampaignChat] Added existing approved collaborator %d to (fallback) new conversation %d.", existingCollabID, conversationID)
			}
		}
		if err := rows.Err(); err != nil {
			log.Printf("[AddCollaboratorToCampaignChat] Error iterating through existing approved collaborators for (fallback) chat: %v", err)
		}

	} else if err != nil {
		return fmt.Errorf("database error when finding conversation for campaign %d: %w", campaignID, err)
	}

	// 4. Add the *current* approved collaborator to the conversation
	_, err = tx.Exec("INSERT INTO conversation_members (conversation_id, user_id, joined_at) VALUES ($1, $2, NOW()) ON CONFLICT (conversation_id, user_id) DO NOTHING", conversationID, approvedCollaboratorID)
	if err != nil {
		return fmt.Errorf("failed to add collaborator %d to conversation %d: %w", approvedCollaboratorID, conversationID, err)
	}
	log.Printf("[AddCollaboratorToCampaignChat] Added current approved collaborator %d to conversation %d.", approvedCollaboratorID, conversationID)

	return nil
}
