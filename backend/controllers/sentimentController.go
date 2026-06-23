package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
	"vite-project/backend/config"

	"github.com/gin-gonic/gin"
)

// ===============================
// Sentiment Analysis Types
// ===============================

type CommentSentiment struct {
	CommentID int     `json:"comment_id"`
	Text      string  `json:"text"`
	Sentiment string  `json:"sentiment"` // "positive", "negative", "neutral"
	Score     float64 `json:"score"`     // -1.0 to 1.0
}

type AdSentimentResult struct {
	AdID           int                `json:"ad_id"`
	Headline       string             `json:"headline"`
	TotalComments  int                `json:"total_comments"`
	Sentiment      SentimentBreakdown `json:"sentiment"`
	SampleComments []CommentSentiment `json:"sample_comments,omitempty"`
}

type SentimentBreakdown struct {
	Positive     int     `json:"positive"`
	Negative     int     `json:"negative"`
	Neutral      int     `json:"neutral"`
	OverallScore float64 `json:"overall_score"` // -1.0 to 1.0
}

type BrandSentimentResponse struct {
	Ads              []AdSentimentResult `json:"ads"`
	OverallSentiment SentimentBreakdown  `json:"overall_sentiment"`
}

// Mistral sentiment response structure
type SentimentAnalysisResult struct {
	Sentiments []struct {
		CommentID int     `json:"comment_id"`
		Sentiment string  `json:"sentiment"`
		Score     float64 `json:"score"`
	} `json:"sentiments"`
}

// ===============================
// Get Brand Sentiment Analysis
// ===============================

func GetBrandSentimentAnalysis(c *gin.Context) {
	log.Println("=== [GetBrandSentimentAnalysis] Called ===")

	brandUserID := c.Param("user_id")
	if brandUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	log.Printf("[INFO] Fetching sentiment analysis for brand_user_id: %s", brandUserID)

	// Step 1: Get all ads for this brand through campaigns
	adsQuery := `
		SELECT a.id, a.headline
		FROM ads a
		JOIN campaigns c ON CAST(a.campaign_id AS INTEGER) = c.id
		WHERE c.brand_user_id = $1
	`

	rows, err := config.DB.Query(adsQuery, brandUserID)
	if err != nil {
		log.Printf("[ERROR] Failed to fetch ads: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch ads"})
		return
	}
	defer rows.Close()

	var adResults []AdSentimentResult
	var totalPositive, totalNegative, totalNeutral int
	var totalScore float64
	var totalCommentCount int

	for rows.Next() {
		var adID int
		var headline string

		if err := rows.Scan(&adID, &headline); err != nil {
			log.Printf("[WARN] Row scan failed: %v", err)
			continue
		}

		// Step 2: Get comments for this ad
		comments, err := getCommentsForAd(adID)
		if err != nil {
			log.Printf("[WARN] Failed to get comments for ad %d: %v", adID, err)
			continue
		}

		if len(comments) == 0 {
			// No comments, skip sentiment analysis
			adResults = append(adResults, AdSentimentResult{
				AdID:          adID,
				Headline:      headline,
				TotalComments: 0,
				Sentiment: SentimentBreakdown{
					Positive:     0,
					Negative:     0,
					Neutral:      0,
					OverallScore: 0,
				},
			})
			continue
		}

		// Step 3: Analyze sentiment using Mistral AI
		sentimentResult, err := analyzeSentimentWithMistral(comments)
		if err != nil {
			log.Printf("[WARN] Sentiment analysis failed for ad %d: %v", adID, err)
			// Return comments without sentiment if AI fails
			adResults = append(adResults, AdSentimentResult{
				AdID:          adID,
				Headline:      headline,
				TotalComments: len(comments),
				Sentiment: SentimentBreakdown{
					Positive:     0,
					Negative:     0,
					Neutral:      len(comments),
					OverallScore: 0,
				},
			})
			continue
		}

		// Step 4: Calculate sentiment breakdown
		positive, negative, neutral := 0, 0, 0
		var adScore float64
		var sampleComments []CommentSentiment

		for i, s := range sentimentResult.Sentiments {
			switch s.Sentiment {
			case "positive":
				positive++
			case "negative":
				negative++
			default:
				neutral++
			}
			adScore += s.Score

			// Include first 5 as sample comments
			if i < 5 && i < len(comments) {
				sampleComments = append(sampleComments, CommentSentiment{
					CommentID: s.CommentID,
					Text:      comments[i].Text,
					Sentiment: s.Sentiment,
					Score:     s.Score,
				})
			}
		}

		overallScore := float64(0)
		if len(sentimentResult.Sentiments) > 0 {
			overallScore = adScore / float64(len(sentimentResult.Sentiments))
		}

		adResults = append(adResults, AdSentimentResult{
			AdID:          adID,
			Headline:      headline,
			TotalComments: len(comments),
			Sentiment: SentimentBreakdown{
				Positive:     positive,
				Negative:     negative,
				Neutral:      neutral,
				OverallScore: overallScore,
			},
			SampleComments: sampleComments,
		})

		// Accumulate totals
		totalPositive += positive
		totalNegative += negative
		totalNeutral += neutral
		totalScore += adScore
		totalCommentCount += len(comments)
	}

	// Calculate overall sentiment
	overallAvgScore := float64(0)
	if totalCommentCount > 0 {
		overallAvgScore = totalScore / float64(totalCommentCount)
	}

	response := BrandSentimentResponse{
		Ads: adResults,
		OverallSentiment: SentimentBreakdown{
			Positive:     totalPositive,
			Negative:     totalNegative,
			Neutral:      totalNeutral,
			OverallScore: overallAvgScore,
		},
	}

	log.Printf("[SUCCESS] Sentiment analysis completed for brand %s: %d ads analyzed", brandUserID, len(adResults))
	c.JSON(http.StatusOK, response)
}

// ===============================
// Helper: Get Comments for Ad
// ===============================

type SimpleComment struct {
	ID   int
	Text string
}

func getCommentsForAd(adID int) ([]SimpleComment, error) {
	query := `SELECT id, text FROM ad_comments WHERE ad_id = $1 ORDER BY created_at DESC LIMIT 50`

	rows, err := config.DB.Query(query, adID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []SimpleComment
	for rows.Next() {
		var c SimpleComment
		if err := rows.Scan(&c.ID, &c.Text); err != nil {
			continue
		}
		comments = append(comments, c)
	}

	return comments, nil
}

// ===============================
// Helper: Analyze Sentiment with Mistral AI
// ===============================

func analyzeSentimentWithMistral(comments []SimpleComment) (*SentimentAnalysisResult, error) {
	apiKey := os.Getenv("MISTRALAPIKEY")
	if apiKey == "" {
		return nil, fmt.Errorf("MISTRALAPIKEY not configured")
	}

	// Build prompt
	var sb strings.Builder
	sb.WriteString("You are a JSON-only sentiment analysis API. Analyze the sentiment of each comment.\n\n")
	sb.WriteString("Comments to analyze:\n")

	for i, c := range comments {
		sb.WriteString(fmt.Sprintf("%d. [ID:%d] \"%s\"\n", i+1, c.ID, c.Text))
	}

	sb.WriteString("\n### STRICT OUTPUT FORMAT ###\n")
	sb.WriteString("Return ONLY a valid JSON object. No markdown, no explanation.\n")
	sb.WriteString("Each comment should have: comment_id (int), sentiment (\"positive\", \"negative\", or \"neutral\"), score (-1.0 to 1.0)\n\n")
	sb.WriteString("Expected format:\n")
	sb.WriteString(`{"sentiments": [{"comment_id": 1, "sentiment": "positive", "score": 0.8}, ...]}`)
	sb.WriteString("\n\nResponse:")

	// Call Mistral API
	reqBody := MistralRequest{
		Model:       "open-mistral-7b",
		Temperature: 0.3, // Lower temperature for more consistent output
		MaxTokens:   2000,
		Messages: []MistralMessage{
			{Role: "user", Content: sb.String()},
		},
	}

	jsonData, _ := json.Marshal(reqBody)
	req, err := http.NewRequest("POST", "https://api.mistral.ai/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("network error: %v", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var mistralResp MistralResponse
	if err := json.Unmarshal(body, &mistralResp); err != nil {
		return nil, fmt.Errorf("failed to parse API response: %v", err)
	}

	if len(mistralResp.Choices) == 0 {
		return nil, fmt.Errorf("no response from AI")
	}

	content := mistralResp.Choices[0].Message.Content
	content = strings.TrimSpace(content)
	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimPrefix(content, "```")
	content = strings.TrimSuffix(content, "```")
	content = strings.TrimSpace(content)

	// Extract JSON
	start := strings.Index(content, "{")
	end := strings.LastIndex(content, "}")
	if start == -1 || end == -1 || end < start {
		return nil, fmt.Errorf("no JSON object found in response")
	}

	jsonStr := content[start : end+1]

	var result SentimentAnalysisResult
	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		return nil, fmt.Errorf("failed to parse sentiment JSON: %v", err)
	}

	return &result, nil
}
