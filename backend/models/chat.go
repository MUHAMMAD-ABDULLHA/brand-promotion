package models

import "time"

type Conversation struct {
	ID         int       `json:"id" db:"id"`
	UserID     int       `json:"user_id" db:"user_id"`
	Type       string    `json:"type" db:"type"` // direct | group
	CampaignID int       `json:"campaign_id,omitempty" db:"campaign_id"`
	Title      string    `json:"title,omitempty" db:"title"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

type ConversationMember struct {
	ConversationID int       `json:"conversation_id" db:"conversation_id"`
	UserID         int       `json:"user_id" db:"user_id"`
	JoinedAt       time.Time `json:"joined_at" db:"joined_at"`
}

type Message struct {
	ID             int       `json:"id" db:"id"`
	ConversationID int       `json:"conversation_id" db:"conversation_id"`
	SenderID       *int      `json:"sender_id,omitempty" db:"sender_id"`
	Content        *string   `json:"content,omitempty" db:"content"`
	FileURL        *string   `json:"file_url,omitempty" db:"file_url"`
	FileID         *int      `json:"file_id,omitempty" db:"file_id"`
	MessageType    string    `json:"message_type" db:"message_type"` // text, image, file, video, signal, call
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	ReadBy         *string   `json:"read_by,omitempty" db:"read_by"`
}

type WSMessage struct {
	Event          string      `json:"event"` // "message","signal_offer","signal_answer","signal_candidate","presence"
	ConversationID int         `json:"conversation_id,omitempty"`
	SenderID       *int        `json:"sender_id,omitempty"`
	Payload        interface{} `json:"payload,omitempty"` // content, signaling data, etc
	MessageType    string      `json:"message_type,omitempty"`
	FileURL        string      `json:"file_url,omitempty"`
}
