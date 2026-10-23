package models

import "time"

// ModelPerformanceLog records every call made to an AI agent (profiler or ranker)
// so you can track latency, token usage, and failure rate per stage/model.
type ModelPerformanceLog struct {
	ID               int64     `json:"id"`
	RequestID        string    `json:"request_id"` // uuid, shared across one recommendation pipeline run
	UserID           int       `json:"user_id"`
	AgentStage       string    `json:"agent_stage"` // "profiler" | "ranker"
	TaskType         string    `json:"task_type"`   // "post_recommendation" | "ad_recommendation"
	Model            string    `json:"model"`
	PromptTokens     int       `json:"prompt_tokens"`
	CompletionTokens int       `json:"completion_tokens"`
	TotalTokens      int       `json:"total_tokens"`
	LatencyMs        int64     `json:"latency_ms"`
	Success          bool      `json:"success"`
	ErrorMessage     string    `json:"error_message"`
	RawPrompt        string    `json:"raw_prompt"`
	RawResponse      string    `json:"raw_response"`
	ParsedOutput     string    `json:"parsed_output"` // JSON string of the structured output for this stage
	CreatedAt        time.Time `json:"created_at"`
}

// RecommendationOutcome is one row per recommended post, written right after the
// ranker returns, then updated as real user behavior (click/like/dismiss) comes in.
// This is the table you join against to compute actual precision, not just model confidence.
type RecommendationOutcome struct {
	ID           int64     `json:"id"`
	RequestID    string    `json:"request_id"`
	UserID       int       `json:"user_id"`
	PostID       int       `json:"post_id"`
	RankPosition int       `json:"rank_position"`
	AIConfidence float64   `json:"ai_confidence"`
	AIReason     string    `json:"ai_reason"`
	Clicked      bool      `json:"clicked"`
	Liked        bool      `json:"liked"`
	Commented    bool      `json:"commented"`
	Dismissed    bool      `json:"dismissed"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
