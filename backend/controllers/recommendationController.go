package controllers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	"vite-project/backend/config"
	"vite-project/backend/models"

	"github.com/gin-gonic/gin"
)

// -------------------------------
// Mistral request/response shapes
// -------------------------------

type MistralMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type MistralRequest struct {
	Model       string           `json:"model"`
	Messages    []MistralMessage `json:"messages"`
	Temperature float64          `json:"temperature"`
	MaxTokens   int              `json:"max_tokens"`
}

type MistralResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

// -------------------------------
// API response shapes
// -------------------------------

type AIRecommendedPost struct {
	PostID     int     `json:"post_id"`
	Reason     string  `json:"reason"`
	Confidence float64 `json:"confidence"`
}

type AIRecommendedAd struct {
	AdID       int     `json:"ad_id"`
	Reason     string  `json:"reason"`
	Confidence float64 `json:"confidence"`
}

type PostsResponse struct {
	Posts []models.Post `json:"posts"`
}

type TempAd struct {
	ID            int64          `json:"id"`
	CampaignID    string         `json:"campaign_id"`
	Headline      string         `json:"headline"`
	Audience      string         `json:"audience"`
	Location      string         `json:"location"`
	MediaType     string         `json:"media_type"`
	MediaURL      string         `json:"media_url"`
	BidStrategy   string         `json:"bid_strategy"`
	EnableAR      bool           `json:"enable_ar"`
	ARURL         sql.NullString `json:"ar_url"`
	Status        string         `json:"status"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	LikesCount    int64          `json:"likes_count"`
	CommentsCount int64          `json:"comments_count"`
}

type PublishedAdResponse struct {
	Published    models.Published_Ads `json:"published_ad"`
	Ad           TempAd               `json:"ad"`
	Gamification models.Gamification  `json:"gamification"`
}

// -------------------------------
// Endpoints
// -------------------------------

// RecommendPosts: calls Mistral with user + activity + available post IDs.
// Mistral must return JSON like: {"post_ids":[1,2,3]}
// Backend then fetches those posts and returns them in the requested order.
func RecommendPosts(c *gin.Context) {
	userID := c.Param("user_id")
	userId, err := strconv.Atoi(userID)

	//userId := c.GetInt("user_id")
	log.Printf("INFO: Starting RecommendPosts for user_id: %d", userId)

	// gather features
	user, err := getUserByID(userId)
	if err != nil {
		log.Printf("ERROR: RecommendPosts failed to load user %d: %v", userId, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load user"})
		return
	}
	log.Printf("INFO: RecommendPosts loaded user: %v", user.Username)

	// followings
	follows, _ := getUserFollows(userId)
	log.Printf("INFO: RecommendPosts loaded %d follows for user %d", len(follows), userId)

	// recent user post analytics
	postActivity, _ := getUserPostAnalytics(userId)
	log.Printf("INFO: RecommendPosts loaded %d post activity events for user %d", len(postActivity), userId)

	// available candidate posts (recent)
	availablePosts, err := getRecentPosts()
	if err != nil {
		log.Printf("ERROR: RecommendPosts failed to load recent posts: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load posts"})
		return
	}
	log.Printf("INFO: RecommendPosts loaded %d available posts", len(availablePosts))

	/*
		// build prompt using ONLY provided attributes
		prompt := buildPostRecommendationPrompt(user, follows, postActivity, availablePosts)
		// log.Printf("DEBUG: RecommendPosts generated prompt: %s", prompt) // Log prompt if needed for debugging

		// call Mistral to get ordered post IDs
		postIDs, err := callMistralForIDs(prompt, "post_ids")
		if err != nil {
			log.Printf("ERROR: RecommendPosts call to Mistral failed for user %d: %v", userId, err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "AI service unavailable",
				"details": err.Error(),
			})
			return
		}
		log.Printf("INFO: RecommendPosts received %d post IDs from Mistral: %v", len(postIDs), postIDs)

		if len(postIDs) == 0 {
			log.Printf("INFO: RecommendPosts returning empty list for user %d", userId)
			c.JSON(http.StatusOK, gin.H{"posts": []models.Post{}})
			return
		}

		// fetch posts by IDs in order
		posts, err := getPostsByIDs(postIDs)
		if err != nil {
			log.Printf("ERROR: RecommendPosts failed to fetch recommended posts for user %d: %v", userId, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch recommended posts"})
			return
		}
		log.Printf("INFO: RecommendPosts successfully fetched %d posts for user %d", len(posts), userId)

		c.JSON(http.StatusOK, gin.H{
			"posts": posts,
		})
	*/

	requestID := newRequestID()
	requestStartTime := time.Now()
	log.Printf("INFO: [%s] Starting RecommendPosts (Qwen) for user_id: %d", requestID, userId)

	// --- Agent 1: profile the user (timed for analysis logger) ---
	profilerStart := time.Now()
	profile, err := runProfilerAgent(requestID, userId, user, follows, postActivity)
	profilerLatencyMs := time.Since(profilerStart).Milliseconds()
	if err != nil {
		log.Printf("ERROR: [%s] profiler agent failed: %v", requestID, err)
		WriteRecommendationAnalysis(AnalysisContext{
			RequestID: requestID, RequestTime: requestStartTime, UserID: userId,
			User: user, Follows: follows, PostActivity: postActivity,
			CandidatePosts: availablePosts, ProfilerLatencyMs: profilerLatencyMs,
			PipelineError: "profiler agent failed: " + err.Error(),
		})
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI profiler unavailable", "details": err.Error()})
		return
	}

	// --- Agent 2: rank candidates against the profile (timed for analysis logger) ---
	rankerStart := time.Now()
	ranked, err := runRankerAgent(requestID, userId, user, profile, availablePosts)
	rankerLatencyMs := time.Since(rankerStart).Milliseconds()
	if err != nil {
		log.Printf("ERROR: [%s] ranker agent failed: %v", requestID, err)
		WriteRecommendationAnalysis(AnalysisContext{
			RequestID: requestID, RequestTime: requestStartTime, UserID: userId,
			User: user, Follows: follows, PostActivity: postActivity,
			CandidatePosts: availablePosts, ProfilerOutput: profile,
			ProfilerLatencyMs: profilerLatencyMs, RankerLatencyMs: rankerLatencyMs,
			PipelineError: "ranker agent failed: " + err.Error(),
		})
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI ranker unavailable", "details": err.Error()})
		return
	}

	if len(ranked) == 0 {
		WriteRecommendationAnalysis(AnalysisContext{
			RequestID: requestID, RequestTime: requestStartTime, UserID: userId,
			User: user, Follows: follows, PostActivity: postActivity,
			CandidatePosts: availablePosts, ProfilerOutput: profile,
			ProfilerLatencyMs: profilerLatencyMs, RankedResults: ranked,
			RankerLatencyMs: rankerLatencyMs,
		})
		c.JSON(http.StatusOK, gin.H{"posts": []models.Post{}, "request_id": requestID})
		return
	}

	// preserve agent-ranked order
	ids := make([]int, 0, len(ranked))
	for _, r := range ranked {
		ids = append(ids, r.PostID)
	}
	posts, err := getPostsByIDs(ids)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch recommended posts"})
		return
	}

	// write one row per recommendation now; clicked/liked/etc get updated later
	// by your existing analytics endpoints (see RecordRecommendationFeedback below)
	insertRecommendationOutcomes(requestID, userId, ranked)

	// ── fire-and-forget analysis log (completely standalone, safe to delete) ──
	WriteRecommendationAnalysis(AnalysisContext{
		RequestID:         requestID,
		RequestTime:       requestStartTime,
		UserID:            userId,
		User:              user,
		Follows:           follows,
		PostActivity:      postActivity,
		CandidatePosts:    availablePosts,
		ProfilerOutput:    profile,
		ProfilerLatencyMs: profilerLatencyMs,
		RankedResults:     ranked,
		RankerLatencyMs:   rankerLatencyMs,
		FinalPosts:        posts,
	})

	c.JSON(http.StatusOK, gin.H{
		"posts":      posts,
		"reasoning":  ranked, // post_id/reason/confidence, lets the frontend show "why this post"
		"request_id": requestID,
	})
	log.Printf("INFO: Finished RecommendPosts for user_id: %d", userId)
}

// RecommendAds: calls Mistral with user + social information + ad history + available ad IDs.
// Mistral must return JSON like: {"ad_ids":[7,8,9]}
// Backend then fetches those ads and returns them in the requested order.
func RecommendAds(c *gin.Context) {
	userID := c.Param("user_id")
	userId, err := strconv.Atoi(userID)
	log.Printf("INFO: Starting RecommendAds for user_id: %d", userId)

	// gather features
	user, err := getUserByID(userId)
	if err != nil {
		log.Printf("ERROR: RecommendAds failed to load user %d: %v", userId, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load user"})
		return
	}
	log.Printf("INFO: RecommendAds loaded user: %v", user.Username)

	// influencers followed / follows list
	follows, _ := getUserFollows(userId)
	log.Printf("INFO: RecommendAds loaded %d follows for user %d", len(follows), userId)

	// user ad analytics
	adActivity, _ := getUserAdAnalytics(userId)
	log.Printf("INFO: RecommendAds loaded %d ad activity events for user %d", len(adActivity), userId)

	// available candidate ads (published_ads join ads)
	availableAds, err := getPublishedAds()
	if err != nil {
		log.Printf("ERROR: RecommendAds failed to load published ads: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load ads"})
		return
	}
	log.Printf("INFO: RecommendAds loaded %d available ads", len(availableAds))

	// build prompt using ONLY provided attributes
	prompt := buildAdRecommendationPrompt(user, follows, adActivity, availableAds)
	// log.Printf("DEBUG: RecommendAds generated prompt: %s", prompt) // Log prompt if needed for debugging

	// call Mistral to get ordered ad IDs
	adIDs, err := callMistralForIDs(prompt, "ad_ids")
	if err != nil {
		log.Printf("ERROR: RecommendAds call to Mistral failed for user %d: %v", userId, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "AI service unavailable",
			"details": err.Error(),
		})
		return
	}
	log.Printf("INFO: RecommendAds received %d ad IDs from Mistral: %v", len(adIDs), adIDs)

	if len(adIDs) == 0 {
		log.Printf("INFO: RecommendAds returning empty list for user %d", userId)
		c.JSON(http.StatusOK, gin.H{"ads": []models.Ad{}})
		return
	}

	// fetch ads by IDs in order
	ads, err := getAdsByIDs(adIDs)
	if err != nil {
		log.Printf("ERROR: RecommendAds failed to fetch recommended ads for user %d: %v", userId, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch recommended ads"})
		return
	}
	log.Printf("INFO: RecommendAds successfully fetched %d ads for user %d", len(ads), userId)

	c.JSON(http.StatusOK, gin.H{
		"ads": ads,
	})
	log.Printf("INFO: Finished RecommendAds for user_id: %d", userId)
}

// -------------------------------
// AI Generation Endpoints
// -------------------------------

// creating the prompts

// func buildPostRecommendationPrompt(
// 	user models.User,
// 	follows []models.Follow,
// 	postActivity []models.PostAnalytics,
// 	availablePosts []models.Post,
// ) string {
// 	var sb strings.Builder

// 	sb.WriteString("You are an AI ranking engine for a social media platform.\n")
// 	sb.WriteString("Use ONLY the data provided below. Do not assume any other fields.\n\n")

// 	sb.WriteString("=== USER ===\n")
// 	sb.WriteString(fmt.Sprintf("id: %d\n", user.ID))
// 	sb.WriteString(fmt.Sprintf("age: %d\n", user.Age))
// 	sb.WriteString(fmt.Sprintf("bio: %s\n", user.Bio))
// 	sb.WriteString(fmt.Sprintf("role: %s\n\n", user.Role))

// 	sb.WriteString("=== FOLLOWINGS ===\n")
// 	if len(follows) == 0 {
// 		sb.WriteString("none\n\n")
// 	} else {
// 		for _, f := range follows {
// 			sb.WriteString(fmt.Sprintf("- following_id: %d\n", f.FollowingID))
// 		}
// 		sb.WriteString("\n")
// 	}

// 	sb.WriteString("=== RECENT USER POST ACTIVITY ===\n")
// 	if len(postActivity) == 0 {
// 		sb.WriteString("none\n\n")
// 	} else {
// 		for _, pa := range postActivity {
// 			sb.WriteString(fmt.Sprintf("post %d -> %s at %s\n",
// 				pa.PostID, pa.EventType, pa.Timestamp.Format(time.RFC3339)))
// 		}
// 		sb.WriteString("\n")
// 	}

// 	sb.WriteString("=== AVAILABLE POSTS (candidates) ===\n")
// 	if len(availablePosts) == 0 {
// 		sb.WriteString("none\n\n")
// 	} else {
// 		for _, p := range availablePosts {
// 			sb.WriteString(fmt.Sprintf("{id:%d, caption:%q, is_sponsored:%t, engagement_rate:%f}\n",
// 				p.ID, p.Caption, p.IsSponsored, p.EngagementRate))
// 		}
// 		sb.WriteString("\n")
// 	}

// 	sb.WriteString("TASK:\n")
// 	sb.WriteString("Return ONLY a JSON object with a ranked list of post IDs to show in the user's feed.\n")
// 	sb.WriteString(`Example: {"post_ids": [3, 99, 21]}` + "\n\n")

// 	sb.WriteString("RULES:\n")
// 	sb.WriteString("- Prioritize posts from users the user follows.\n")
// 	sb.WriteString("- Boost posts the user previously engaged with.\n")
// 	sb.WriteString("- Include up to 2 trending posts (high engagement_rate) from the available list.\n")
// 	sb.WriteString("- Do NOT create or invent posts; only rank IDs from the available posts list.\n")
// 	sb.WriteString("**STRICT RULE: The output must be PURE JSON, starting with '{' and ending with '}', with no preceding or trailing text, and ABSOLUTELY NO JSON COMMENTS (//) or extra explanatory fields.**\n\n") // <-- ADDED STRICTNESS

// 	// List candidate IDs explicitly
// 	sb.WriteString("CANDIDATE_POST_IDS: [")
// 	ids := []string{}
// 	for _, p := range availablePosts {
// 		ids = append(ids, fmt.Sprintf("%d", p.ID))
// 	}
// 	sb.WriteString(strings.Join(ids, ","))
// 	sb.WriteString("]\n")

// 	return sb.String()
// }

// func buildAdRecommendationPrompt(
// 	user models.User,
// 	follows []models.Follow,
// 	adActivity []models.AdAnalytics,
// 	availableAds []models.Ad,
// ) string {
// 	var sb strings.Builder

// 	sb.WriteString("You are an AI ranking engine for an advertising platform.\n")
// 	sb.WriteString("Use ONLY the data provided below. Do not assume any other fields.\n\n")

// 	sb.WriteString("=== USER ===\n")
// 	sb.WriteString(fmt.Sprintf("id: %d\n", user.ID))
// 	sb.WriteString(fmt.Sprintf("age: %d\n", user.Age))
// 	sb.WriteString(fmt.Sprintf("bio: %s\n", user.Bio))
// 	sb.WriteString(fmt.Sprintf("role: %s\n\n", user.Role))

// 	sb.WriteString("=== FOLLOWINGS (influencers/brands user follows) ===\n")
// 	if len(follows) == 0 {
// 		sb.WriteString("none\n\n")
// 	} else {
// 		for _, f := range follows {
// 			sb.WriteString(fmt.Sprintf("- following_id: %d\n", f.FollowingID))
// 		}
// 		sb.WriteString("\n")
// 	}

// 	sb.WriteString("=== RECENT USER AD ACTIVITY ===\n")
// 	if len(adActivity) == 0 {
// 		sb.WriteString("none\n\n")
// 	} else {
// 		for _, aa := range adActivity {
// 			sb.WriteString(fmt.Sprintf("ad %d -> %s at %s\n",
// 				aa.AdID, aa.EventType, aa.Timestamp.Format(time.RFC3339)))
// 		}
// 		sb.WriteString("\n")
// 	}

// 	sb.WriteString("=== AVAILABLE ADS (candidates) ===\n")
// 	if len(availableAds) == 0 {
// 		sb.WriteString("none\n\n")
// 	} else {
// 		for _, a := range availableAds {
// 			sb.WriteString(fmt.Sprintf("{id:%d, headline:%q, audience:%s, status:%s}\n",
// 				a.ID, a.Headline, a.Audience, a.Status))
// 		}
// 		sb.WriteString("\n")
// 	}

// 	sb.WriteString("TASK:\n")
// 	sb.WriteString("Return ONLY a JSON object with a ranked list of ad IDs to show to the user.\n")
// 	sb.WriteString(`Example: {"ad_ids": [5, 27, 11]}` + "\n\n")

// 	sb.WriteString("RULES:\n")
// 	sb.WriteString("- Prioritize ads from influencers/brands the user follows.\n")
// 	sb.WriteString("- Boost ads matching user's previous ad engagements.\n")
// 	sb.WriteString("- Avoid repeating the same ad too frequently.\n")
// 	sb.WriteString("- Do NOT create or invent ads; only rank IDs from the available ads list.\n")
// 	sb.WriteString("**STRICT RULE: The output must be PURE JSON, starting with '{' and ending with '}', with no preceding or trailing text, and ABSOLUTELY NO JSON COMMENTS (//) or extra explanatory fields.**\n\n") // <-- ADDED STRICTNESS

// 	// List candidate IDs explicitly
// 	sb.WriteString("CANDIDATE_AD_IDS: [")
// 	ids := []string{}
// 	for _, a := range availableAds {
// 		ids = append(ids, fmt.Sprintf("%d", a.ID))
// 	}
// 	sb.WriteString(strings.Join(ids, ","))
// 	sb.WriteString("]\n")

// 	return sb.String()
// }

func buildPostRecommendationPrompt(
	user models.User,
	follows []models.Follow,
	postActivity []models.PostAnalytics,
	availablePosts []models.Post,
) string {
	var sb strings.Builder

	sb.WriteString("You are a JSON-only API endpoint. You do not speak natural language. You only output valid JSON.\n")
	sb.WriteString("Input Data:\n\n")

	sb.WriteString("=== USER PROFILE ===\n")
	sb.WriteString(fmt.Sprintf("ID: %d | Age: %d | Role: %s | Bio: %s\n\n", user.ID, user.Age, user.Role, user.Bio))

	sb.WriteString("=== FOLLOWED USERS ===\n")
	if len(follows) == 0 {
		sb.WriteString("None\n\n")
	} else {
		var fids []string
		for _, f := range follows {
			fids = append(fids, fmt.Sprintf("%d", f.FollowingID))
		}
		sb.WriteString(fmt.Sprintf("[%s]\n\n", strings.Join(fids, ", ")))
	}

	sb.WriteString("=== USER POST HISTORY ===\n")
	if len(postActivity) == 0 {
		sb.WriteString("None\n\n")
	} else {
		for _, pa := range postActivity {
			sb.WriteString(fmt.Sprintf("- Interaction: Post %d (%s)\n", pa.PostID, pa.EventType))
		}
		sb.WriteString("\n")
	}

	sb.WriteString("=== CANDIDATE POSTS TO RANK ===\n")
	if len(availablePosts) == 0 {
		sb.WriteString("None\n\n")
	} else {
		for _, p := range availablePosts {
			sb.WriteString(fmt.Sprintf("ID: %d | Sponsored: %t | Engagement: %.2f | Content: %q\n",
				p.ID, p.IsSponsored, p.EngagementRate, p.Caption))
		}
		sb.WriteString("\n")
	}

	sb.WriteString("### INSTRUCTIONS ###\n")
	sb.WriteString("Rank the candidate posts for this user based on:\n")
	sb.WriteString("1. Relevance (Bio/Interests)\n")
	sb.WriteString("2. Connection (Followed users)\n")
	sb.WriteString("3. Engagement History\n\n")

	sb.WriteString("### STRICT OUTPUT FORMAT ###\n")
	sb.WriteString("You must output a SINGLE valid JSON object.\n")
	sb.WriteString("Do NOT return Markdown code blocks (```json).\n")
	sb.WriteString("Do NOT add comments (// or #) inside the JSON.\n")
	sb.WriteString("Do NOT explain your reasoning.\n")
	sb.WriteString("The output must be parsable by Go's encoding/json.\n\n")

	sb.WriteString("Expected Output Structure:\n")
	sb.WriteString(`{"post_ids": [123, 456, 789]}`)
	sb.WriteString("\n\nResponse:")

	return sb.String()
}

func buildAdRecommendationPrompt(
	user models.User,
	follows []models.Follow,
	adActivity []models.AdAnalytics,
	availableAds []models.Ad,
) string {
	var sb strings.Builder

	sb.WriteString("You are a JSON-only API endpoint. You do not speak natural language. You only output valid JSON.\n")
	sb.WriteString("Input Data:\n\n")

	sb.WriteString("=== USER PROFILE ===\n")
	sb.WriteString(fmt.Sprintf("ID: %d | Age: %d | Role: %s | Bio: %s\n\n", user.ID, user.Age, user.Role, user.Bio))

	sb.WriteString("=== FOLLOWED BRANDS/INFLUENCERS ===\n")
	if len(follows) == 0 {
		sb.WriteString("None\n\n")
	} else {
		var fids []string
		for _, f := range follows {
			fids = append(fids, fmt.Sprintf("%d", f.FollowingID))
		}
		sb.WriteString(fmt.Sprintf("[%s]\n\n", strings.Join(fids, ", ")))
	}

	sb.WriteString("=== USER AD HISTORY ===\n")
	if len(adActivity) == 0 {
		sb.WriteString("None\n\n")
	} else {
		for _, aa := range adActivity {
			sb.WriteString(fmt.Sprintf("- Interaction: Ad %d (%s)\n", aa.AdID, aa.EventType))
		}
		sb.WriteString("\n")
	}

	sb.WriteString("=== CANDIDATE ADS TO RANK ===\n")
	if len(availableAds) == 0 {
		sb.WriteString("None\n\n")
	} else {
		for _, a := range availableAds {
			sb.WriteString(fmt.Sprintf("ID: %d | Status: %s | Target: %s | Headline: %q\n",
				a.ID, a.Status, a.Audience, a.Headline))
		}
		sb.WriteString("\n")
	}

	sb.WriteString("### INSTRUCTIONS ###\n")
	sb.WriteString("Rank the ads based on user interests, history, and demographics.\n")
	sb.WriteString("Avoid repeating ads the user has just seen.\n\n")

	sb.WriteString("### STRICT OUTPUT FORMAT ###\n")
	sb.WriteString("You must output a SINGLE valid JSON object.\n")
	sb.WriteString("Do NOT return Markdown code blocks (```json).\n")
	sb.WriteString("Do NOT add comments (// or #) inside the JSON.\n")
	sb.WriteString("Do NOT explain your reasoning.\n")
	sb.WriteString("The output must be parsable by Go's encoding/json.\n\n")

	sb.WriteString("Expected Output Structure:\n")
	sb.WriteString(`{"ad_ids": [101, 202, 303]}`)
	sb.WriteString("\n\nResponse:")

	return sb.String()
}

// -------------------------------
// Mistral call helper
// -------------------------------

func callMistralForIDs(prompt string, key string) ([]int, error) {
	log.Printf("INFO: Calling Mistral API for key: %s", key)

	// --- Token Logging: Prompt ---
	promptTokens := estimateTokens(prompt)
	log.Printf("INFO: Prompt size: %d chars (~%d tokens)", len(prompt), promptTokens)

	apiKey := os.Getenv("MISTRALAPIKEY")
	if apiKey == "" {
		log.Println("FATAL: MISTRALAPIKEY not configured")
		return nil, fmt.Errorf("MISTRALAPIKEY not configured")
	}

	reqBody := MistralRequest{
		Model:       "open-mistral-7b",
		Temperature: 0.7,
		MaxTokens:   2500,
		Messages: []MistralMessage{
			{Role: "user", Content: prompt},
		},
	}

	jsonData, _ := json.Marshal(reqBody)

	req, err := http.NewRequest("POST", "https://api.mistral.ai/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("ERROR: Failed to create new HTTP request: %v", err)
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("ERROR: Mistral API network error: %v", err)
		return nil, fmt.Errorf("network error: %v", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	// --- Token Logging: Response ---
	respTokens := estimateTokens(string(body))
	log.Printf("INFO: Response size: %d chars (~%d tokens)", len(body), respTokens)
	log.Printf("INFO: Estimated total tokens (prompt + response): ~%d", promptTokens+respTokens)

	/*
		// (Optional) Cost Estimation
		costPerToken := 0.0000003  // example, depends on model pricing
		estimatedCost := float64(promptTokens+respTokens) * costPerToken
		log.Printf("INFO: Estimated cost: ~$0.000%f", estimatedCost)
	*/

	if resp.StatusCode != http.StatusOK {
		log.Printf("ERROR: Mistral API error (status %d): %s", resp.StatusCode, string(body))
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var mistralResp MistralResponse
	if err := json.Unmarshal(body, &mistralResp); err != nil {
		log.Printf("ERROR: Failed to parse Mistral API response: %v. Body: %s", err, string(body))
		return nil, fmt.Errorf("failed to parse API response: %v", err)
	}

	if len(mistralResp.Choices) == 0 {
		log.Println("WARN: No choices in response from AI")
		return nil, fmt.Errorf("no response from AI")
	}

	content := mistralResp.Choices[0].Message.Content
	content = strings.TrimSpace(content)
	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimPrefix(content, "```")
	content = strings.TrimSuffix(content, "```")
	content = strings.TrimSpace(content)

	start := strings.Index(content, "{")
	end := strings.LastIndex(content, "}")
	if start == -1 || end == -1 || end < start {
		log.Printf("ERROR: No JSON object found in response. Content: %s", content)
		return nil, fmt.Errorf("no JSON object in response")
	}

	jsonStr := content[start : end+1]

	var m map[string]json.RawMessage
	if err := json.Unmarshal([]byte(jsonStr), &m); err != nil {
		log.Printf("ERROR: Failed to unmarshal response JSON: %v. JSON String: %s", err, jsonStr)
		return nil, fmt.Errorf("failed to unmarshal response JSON: %v", err)
	}

	raw, ok := m[key]
	if !ok {
		log.Printf("ERROR: Key %s not found in model response JSON", key)
		return nil, fmt.Errorf("key %s not found in model response", key)
	}

	var ids []int
	if err := json.Unmarshal(raw, &ids); err != nil {
		log.Printf("ERROR: Failed to parse ids array for key %s: %v. Raw JSON: %s", key, err, string(raw))
		return nil, fmt.Errorf("failed to parse ids array: %v", err)
	}

	log.Printf("INFO: Successfully extracted %d IDs for key %s", len(ids), key)
	return ids, nil
}
func estimateTokens(text string) int {
	// Cheap approximation: 1 token ≈ 4 chars OR 1 token ≈ 0.75 words
	words := len(strings.Fields(text))
	chars := len(text)

	byWords := int(float64(words) / 0.75)
	byChars := chars / 4

	// Pick the lower one (safer/logically closer)
	if byWords < byChars {
		return byWords
	}
	return byChars
}

// -------------------------------
// DB helper functions (Postgres) — use only fields/columns you gave
// -------------------------------

func getUserByID(userId int) (models.User, error) {
	log.Printf("DEBUG: DB: Fetching user %d", userId)
	var u models.User

	// Variables for scanning potentially nullable fields
	var updatedAt sql.NullTime
	var imageURL sql.NullString
	var bio sql.NullString
	var accountStatus sql.NullString
	var privacyStatus sql.NullString
	var imageID sql.NullInt64 // FIX: Use sql.NullInt64 for nullable 'image_id'

	row := config.DB.QueryRow(`
        SELECT id, email, password, full_name, username, phone, age, role, updated_at, image_url, bio, account_status, privacy_status, image_id
        FROM users
        WHERE id = $1
    `, userId)

	err := row.Scan(
		&u.ID, &u.Email, &u.Password, &u.FullName, &u.Username, &u.Phone,
		&u.Age, &u.Role, &updatedAt, &imageURL, &bio, &accountStatus, &privacyStatus, &imageID, // Scan into nullable variables
	)
	if err != nil {
		log.Printf("ERROR: DB: getUserByID %d failed: %v", userId, err)
		return u, err
	}

	// --- Conditionally assign nullable values back to the User struct ---
	if updatedAt.Valid {
		u.UpdatedAt = updatedAt.Time
	}
	if imageURL.Valid {
		u.ImageURL = imageURL.String
	}
	if bio.Valid {
		u.Bio = bio.String
	}
	if accountStatus.Valid {
		u.AccountStatus = accountStatus.String
	}
	if privacyStatus.Valid {
		u.PrivacyStatus = privacyStatus.String
	}

	// The fix for the error: handle NULL image_id
	if imageID.Valid {
		// Assuming models.User.ImageID is int, cast sql.NullInt64.Int64 to int
		u.ImageID = int(imageID.Int64)
	} else {
		// If image_id is NULL, set the ImageID field to 0 (the default zero value for int)
		u.ImageID = 0
	}

	return u, nil
}

func getUserFollows(userId int) ([]models.Follow, error) {
	log.Printf("DEBUG: DB: Fetching follows for user %d", userId)
	rows, err := config.DB.Query(`
		SELECT id, follower_id, following_id, status
		FROM follows
		WHERE follower_id = $1
	`, userId)
	if err != nil {
		log.Printf("ERROR: DB: getUserFollows %d failed: %v", userId, err)
		return nil, err
	}
	defer rows.Close()

	var follows []models.Follow
	for rows.Next() {
		var f models.Follow
		if err := rows.Scan(&f.ID, &f.FollowerID, &f.FollowingID, &f.Status); err != nil {
			log.Printf("WARN: DB: getUserFollows scan error for user %d: %v", userId, err)
			continue
		}
		follows = append(follows, f)
	}
	return follows, nil
}

func getUserPostAnalytics(userId int) ([]models.PostAnalytics, error) {
	log.Printf("DEBUG: DB: Fetching post analytics for user %d", userId)
	rows, err := config.DB.Query(`
		SELECT id, post_id, user_id, event_type, timestamp
		FROM post_analytics
		WHERE user_id = $1
		ORDER BY timestamp DESC
		LIMIT 50
	`, userId)
	if err != nil {
		log.Printf("ERROR: DB: getUserPostAnalytics %d failed: %v", userId, err)
		return nil, err
	}
	defer rows.Close()

	var out []models.PostAnalytics
	for rows.Next() {
		var a models.PostAnalytics
		var userID sql.NullInt64
		if err := rows.Scan(&a.ID, &a.PostID, &userID, &a.EventType, &a.Timestamp); err != nil {
			log.Printf("WARN: DB: getUserPostAnalytics scan error for user %d: %v", userId, err)
			continue
		}
		if userID.Valid {
			v := int(userID.Int64)
			a.UserID = &v
		} else {
			a.UserID = nil
		}
		out = append(out, a)
	}
	return out, nil
}

func getUserAdAnalytics(userId int) ([]models.AdAnalytics, error) {
	log.Printf("DEBUG: DB: Fetching ad analytics for user %d", userId)
	rows, err := config.DB.Query(`
		SELECT id, ad_id, user_id, event_type, timestamp, publisher
		FROM ad_analytics
		WHERE user_id = $1
		ORDER BY timestamp DESC
		LIMIT 50
	`, userId)
	if err != nil {
		log.Printf("ERROR: DB: getUserAdAnalytics %d failed: %v", userId, err)
		return nil, err
	}
	defer rows.Close()

	var out []models.AdAnalytics
	for rows.Next() {
		var a models.AdAnalytics
		var userID sql.NullInt64
		if err := rows.Scan(&a.ID, &a.AdID, &userID, &a.EventType, &a.Timestamp, &a.Publisher); err != nil {
			log.Printf("WARN: DB: getUserAdAnalytics scan error for user %d: %v", userId, err)
			continue
		}
		if userID.Valid {
			v := int(userID.Int64)
			a.UserID = &v
		} else {
			a.UserID = nil
		}
		out = append(out, a)
	}
	return out, nil
}

// getRecentPosts: query you provided (returns recent candidate posts)
func getRecentPosts() ([]models.Post, error) {
	log.Println("DEBUG: DB: Fetching recent candidate posts")
	rows, err := config.DB.Query(`
    SELECT
        p.id, p.caption, COALESCE(p.image_url, '') as image_url,
        p.likes, p.comments_count, p.impressions, p.engagement_rate, p.is_sponsored, p.created_at, p.updated_at,
        u.id, u.full_name, u.username, COALESCE(u.image_url, '') as user_image_url
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT 200
    `)
	if err != nil {
		log.Printf("ERROR: DB: getRecentPosts failed: %v", err)
		return nil, err
	}
	defer rows.Close()

	var out []models.Post
	for rows.Next() {
		var p models.Post
		var userID int
		var userFullName, userUsername, userImageURL string
		if err := rows.Scan(&p.ID, &p.Caption, &p.ImageURL, &p.Likes, &p.CommentsCount, &p.Impressions, &p.EngagementRate, &p.IsSponsored, &p.CreatedAt, &p.UpdatedAt,
			&userID, &userFullName, &userUsername, &userImageURL); err != nil {
			log.Printf("WARN: DB: getRecentPosts scan error: %v", err)
			continue
		}
		p.UserID = userID
		p.User = models.User{
			ID:       userID,
			FullName: userFullName,
			Username: userUsername,
			ImageURL: userImageURL,
		}
		out = append(out, p)
	}
	log.Printf("DEBUG: DB: Fetched %d recent candidate posts", len(out))
	return out, nil
}

// getPublishedAds: query you provided (returns recent published_ads join ads)
func getPublishedAds() ([]models.Ad, error) {
	log.Println("DEBUG: DB: Fetching published candidate ads")
	rows, err := config.DB.Query(`
		SELECT
			pa.id AS published_id,
			pa.ad_id AS published_ad_id,
			pa.publisher,
			pa.published_at,
			a.id, a.campaign_id, a.headline, a.audience, a.location,
			a.media_type, a.media_url, a.bid_strategy, a.enable_ar, a.ar_url,
			a.status, a.created_at, a.updated_at,
			COALESCE(a.likes_count,0), COALESCE(a.comments_count,0)
		FROM published_ads pa
		JOIN ads a ON pa.ad_id = a.id
		ORDER BY pa.published_at DESC
		LIMIT 200
	`)
	if err != nil {
		log.Printf("ERROR: DB: getPublishedAds failed: %v", err)
		return nil, err
	}
	defer rows.Close()

	var out []models.Ad
	for rows.Next() {
		var a models.Ad
		var publishedID, publishedAdID, publisher sql.NullInt64
		var publishedAt sql.NullTime
		var likesCount, commentsCount sql.NullInt64
		if err := rows.Scan(&publishedID, &publishedAdID, &publisher, &publishedAt,
			&a.ID, &a.CampaignID, &a.Headline, &a.Audience, &a.Location,
			&a.MediaType, &a.MediaURL, &a.BidStrategy, &a.EnableAR, &a.ARURL,
			&a.Status, &a.CreatedAt, &a.UpdatedAt, &likesCount, &commentsCount); err != nil {
			log.Printf("WARN: DB: getPublishedAds scan error: %v", err)
			continue
		}
		// we only set fields you provided in struct
		out = append(out, a)
	}
	log.Printf("DEBUG: DB: Fetched %d published candidate ads", len(out))
	return out, nil
}

// getPostsByIDs: fetch posts by ID preserving order
func getPostsByIDs(ids []int) ([]models.Post, error) {
	log.Printf("DEBUG: DB: Fetching posts by IDs: %v", ids)
	if len(ids) == 0 {
		return []models.Post{}, nil
	}

	// build IN list and ORDER BY FIELD simulation using CASE
	args := []interface{}{}
	placeholders := []string{}
	for i, id := range ids {
		args = append(args, id)
		placeholders = append(placeholders, fmt.Sprintf("$%d", i+1))
	}

	query := fmt.Sprintf(`
    SELECT
        p.id, p.caption, COALESCE(p.image_url, '') as image_url,
        p.likes, p.comments_count, p.impressions, p.engagement_rate, p.is_sponsored, p.created_at, p.updated_at,
        u.id, u.full_name, u.username, COALESCE(u.image_url, '') as user_image_url
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id IN (%s)
    `, strings.Join(placeholders, ","))

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		log.Printf("ERROR: DB: getPostsByIDs failed: %v", err)
		return nil, err
	}
	defer rows.Close()

	// map results by id to reorder
	m := map[int]models.Post{}
	for rows.Next() {
		var p models.Post
		var userID int
		var userFullName, userUsername, userImageURL string
		if err := rows.Scan(&p.ID, &p.Caption, &p.ImageURL, &p.Likes, &p.CommentsCount, &p.Impressions, &p.EngagementRate, &p.IsSponsored, &p.CreatedAt, &p.UpdatedAt,
			&userID, &userFullName, &userUsername, &userImageURL); err != nil {
			log.Printf("WARN: DB: getPostsByIDs scan error: %v", err)
			continue
		}
		p.UserID = userID
		p.User = models.User{
			ID:       userID,
			FullName: userFullName,
			Username: userUsername,
			ImageURL: userImageURL,
		}
		m[p.ID] = p
	}

	ordered := []models.Post{}
	for _, id := range ids {
		if v, ok := m[id]; ok {
			ordered = append(ordered, v)
		} else {
			log.Printf("WARN: DB: getPostsByIDs missing post ID %d from results", id)
		}
	}

	log.Printf("DEBUG: DB: Fetched and ordered %d posts", len(ordered))
	return ordered, nil
}

func getAdsByIDs(ids []int) ([]PublishedAdResponse, error) {
	log.Printf("DEBUG: DB: Fetching published ads details by IDs: %v", ids)
	if len(ids) == 0 {
		return []PublishedAdResponse{}, nil
	}

	// 1. Prepare arguments for IN clause
	args := []interface{}{}
	placeholders := []string{}
	for i, id := range ids {
		args = append(args, id)
		placeholders = append(placeholders, fmt.Sprintf("$%d", i+1))
	}

	// 2. Define the Join Query
	query := fmt.Sprintf(`
        SELECT
            pa.id AS published_id,
            pa.ad_id AS published_ad_id,
            pa.publisher,
            pa.published_at,
            a.id AS ad_id, a.campaign_id, a.headline, a.audience, a.location,
            a.media_type, a.media_url, a.bid_strategy, a.enable_ar, a.ar_url,
            a.status, a.created_at, a.updated_at,
            a.likes_count, a.comments_count,
            g.id AS gamification_id, g.brand_id, g.ad_id AS gam_ad_id, g.points,
            g.description, g.media_url AS gam_media_url, g.created_at AS gam_created_at,
            g.expire_date
        FROM published_ads pa
        JOIN ads a ON pa.ad_id = a.id
        LEFT JOIN gamifications g ON a.id = g.ad_id
        WHERE pa.ad_id IN (%s)
    `, strings.Join(placeholders, ","))

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		log.Printf("ERROR: DB: getAdsByIDs failed: %v", err)
		return nil, err
	}
	defer rows.Close()

	// 4. Map results
	resultMap := map[int]PublishedAdResponse{}

	for rows.Next() {
		var (
			paID, paAdID, paPublisher                       sql.NullInt64
			paPublished                                     sql.NullTime
			aID                                             sql.NullInt64
			aCampaignID, aHeadline, aAudience, aLocation    sql.NullString
			aMediaType, aMediaURL, aBidStr, aARURL, aStatus sql.NullString
			aEnableAR                                       sql.NullBool
			aCreated, aUpdated                              sql.NullTime
			aLikesCount, aCommentsCount                     sql.NullInt64
			gID, gBrandID, gAdID, gPoints                   sql.NullInt64
			gDescription, gMediaURL                         sql.NullString
			gCreatedAt, gExpireDate                         sql.NullTime
		)

		if err := rows.Scan(
			&paID, &paAdID, &paPublisher, &paPublished,
			&aID, &aCampaignID, &aHeadline, &aAudience, &aLocation,
			&aMediaType, &aMediaURL, &aBidStr, &aEnableAR, &aARURL,
			&aStatus, &aCreated, &aUpdated,
			&aLikesCount, &aCommentsCount,
			&gID, &gBrandID, &gAdID, &gPoints, &gDescription, &gMediaURL,
			&gCreatedAt, &gExpireDate,
		); err != nil {
			log.Printf("WARN: DB: getAdsByIDs scan error: %v", err)
			continue
		}

		// --- NEW LOGIC: Check Expiry ---
		// If the expiry date is valid AND strictly before the current time,
		// we invalidate the gamification ID so it is not populated below.
		if gExpireDate.Valid && gExpireDate.Time.Before(time.Now()) {
			// Option A: If you want to exclude the *entire Ad* if gamification is expired, uncomment the next line:
			// continue

			// Option B (Implemented): Just hide the gamification data, but keep the Ad
			gID.Valid = false
		}

		// Populate Published_Ads struct
		pub := models.Published_Ads{}
		if paID.Valid {
			pub.ID = int(paID.Int64)
		}
		if paAdID.Valid {
			pub.AdID = int(paAdID.Int64)
		}
		if paPublisher.Valid {
			pub.Publisher = int(paPublisher.Int64)
		}
		if paPublished.Valid {
			pub.PublishedAt = paPublished.Time
		}

		// Populate Ad struct
		ad := TempAd{}
		if aID.Valid {
			ad.ID = aID.Int64
		}
		ad.CampaignID = aCampaignID.String
		ad.Headline = aHeadline.String
		ad.Audience = aAudience.String
		ad.Location = aLocation.String
		ad.MediaType = aMediaType.String
		ad.MediaURL = aMediaURL.String
		ad.BidStrategy = aBidStr.String
		ad.EnableAR = aEnableAR.Bool
		ad.ARURL = aARURL
		ad.Status = aStatus.String
		if aCreated.Valid {
			ad.CreatedAt = aCreated.Time
		}
		if aUpdated.Valid {
			ad.UpdatedAt = aUpdated.Time
		}
		ad.LikesCount = aLikesCount.Int64
		ad.CommentsCount = aCommentsCount.Int64

		// Populate Gamification struct
		// We check gID.Valid again (it might have been set to false by our expiry check above)
		gam := models.Gamification{}
		if gID.Valid {
			gam.ID = int(gID.Int64)
			if gBrandID.Valid {
				gam.BrandID = int(gBrandID.Int64)
			}
			if gAdID.Valid {
				gam.AdID = int(gAdID.Int64)
			}
			if gPoints.Valid {
				gam.Points = int(gPoints.Int64)
			}
			gam.Description = gDescription.String
			gam.MediaURL = gMediaURL.String
			if gCreatedAt.Valid {
				gam.CreatedAt = gCreatedAt.Time
			}
			if gExpireDate.Valid {
				gam.ExpireDate = gExpireDate.Time
			}
		}

		// Store in map using AdID as key
		resultMap[pub.AdID] = PublishedAdResponse{
			Published:    pub,
			Ad:           ad,
			Gamification: gam, // This will be empty if expired
		}
	}

	// 5. Reorder results based on input ID list
	ordered := []PublishedAdResponse{}
	for _, id := range ids {
		if v, ok := resultMap[id]; ok {
			ordered = append(ordered, v)
		} else {
			log.Printf("WARN: DB: getAdsByIDs missing data for Ad ID %d", id)
		}
	}

	log.Printf("DEBUG: DB: Fetched and ordered %d published ads (filtered expired gamifications)", len(ordered))
	return ordered, nil
}

// ---------------------------------
// ad recommendation
// ---------------------------------

// -------------------------------
// DTOs (Data Transfer Objects)
// -------------------------------

type GenerateHeadlineRequest struct {
	Description string `json:"description" binding:"required"`
	Tone        string `json:"tone"` // Optional: "Funny", "Serious", "Urgent"
}

type EnhanceHeadlineRequest struct {
	CurrentHeadline string `json:"current_headline" binding:"required"`
}

type GenerateAdRequest struct {
	Description string `json:"description" binding:"required"`
}

type AdDetailsResponse struct {
	Headline string   `json:"headline"`
	Audience []string `json:"audience"` // e.g., ["18-24", "25-34"]
	Location []string `json:"location"` // e.g., ["Lahore", "Karachi"]
}

// BrandAdHistory: Temp struct to hold Ad data + calculated social stats
type BrandAdHistory struct {
	ID            int
	Headline      string
	Audience      string
	Location      string
	Status        string
	LikesCount    int
	CommentsCount int
}

// -------------------------------
// Controller Functions
// -------------------------------

// GenerateHeadline: Creates a new headline from scratch
func GenerateHeadline(c *gin.Context) {
	var req GenerateHeadlineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	log.Printf("INFO: Generating headline for description length: %d", len(req.Description))

	prompt := buildHeadlineGenPrompt(req.Description, req.Tone)

	headline, err := callMistralForText(prompt, "headline")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service unavailable", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"headline": headline})
}

// EnhanceHeadline: Polishes an existing headline
func EnhanceHeadline(c *gin.Context) {
	var req EnhanceHeadlineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	log.Printf("INFO: Enhancing headline: %s", req.CurrentHeadline)

	prompt := buildHeadlineEnhancePrompt(req.CurrentHeadline)

	enhanced, err := callMistralForText(prompt, "headline")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service unavailable", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"original": req.CurrentHeadline,
		"enhanced": enhanced,
	})
}

func GenerateAdDetails(c *gin.Context) {
	userIDParam := c.Param("user_id")
	publisherID, err := strconv.Atoi(userIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req GenerateAdRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	log.Printf("INFO: Starting Ad Generation for Publisher %d", publisherID)

	// 1. Fetch Brand History
	pastAds, err := getBrandAdsHistory(publisherID)
	if err != nil {
		log.Printf("ERROR: Failed to fetch past ads: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error fetching ads"})
		return
	}

	// 2. Fetch Analytics
	pastAnalytics, err := getBrandAdAnalytics(publisherID)
	if err != nil {
		log.Printf("ERROR: Failed to fetch analytics: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error fetching analytics"})
		return
	}

	// 3. Build Contextual Prompt
	prompt := buildContextualAdPrompt(req.Description, pastAds, pastAnalytics)

	// 4. Call AI
	adDetails, err := callMistralForAdStruct(prompt)
	if err != nil {
		log.Printf("ERROR: GenerateAdDetails AI call failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service unavailable", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, adDetails)
}

// -------------------------------
// Prompt Builders
// -------------------------------

func buildHeadlineGenPrompt(description, tone string) string {
	if tone == "" {
		tone = "Persuasive and Catchy"
	}
	return fmt.Sprintf(`You are a Copywriter. 
TASK: Write a short, high-converting ad headline based on this description: "%s".
TONE: %s.
RULES: 
- Less than 60 characters.
- No clickbait.
- Output JSON ONLY: {"headline": "Your Headline Here"}`, description, tone)
}

func buildHeadlineEnhancePrompt(current string) string {
	return fmt.Sprintf(`You are a Copywriter.
TASK: Improve this headline: "%s".
GOAL: Make it punchier, fix grammar, and increase click-through rate.
RULES: 
- Keep it short.
- Output JSON ONLY: {"headline": "The Enhanced Headline Here"}`, current)
}

func buildContextualAdPrompt(description string, pastAds []BrandAdHistory, analytics []models.AdAnalytics) string {
	var sb strings.Builder

	// 1. Process Analytics
	adStats := make(map[int]map[string]int)
	for _, event := range analytics {
		if _, exists := adStats[event.AdID]; !exists {
			adStats[event.AdID] = make(map[string]int)
		}
		adStats[event.AdID][event.EventType]++
	}

	sb.WriteString("You are an expert Ad Specialist for the Pakistani market.\n")
	sb.WriteString("Use the Brand History below to generate a high-performing ad.\n\n")

	// 2. Context: Brand History
	sb.WriteString("=== BRAND HISTORY (Past Performance) ===\n")
	if len(pastAds) == 0 {
		sb.WriteString("No past ads found.\n")
	} else {
		for _, ad := range pastAds {
			stats := adStats[ad.ID]
			clicks := stats["click"]
			impressions := stats["impression"]

			if impressions > 0 || clicks > 0 || ad.LikesCount > 0 {
				sb.WriteString(fmt.Sprintf("- Headline: %q\n", ad.Headline))
				sb.WriteString(fmt.Sprintf("  Targeting: %s | %s\n", ad.Audience, ad.Location))
				sb.WriteString(fmt.Sprintf("  Stats: %d Imprs, %d Clicks, %d Likes, %d Comments\n\n",
					impressions, clicks, ad.LikesCount, ad.CommentsCount))
			}
		}
	}
	sb.WriteString("\n")

	// 3. The New Task
	sb.WriteString(fmt.Sprintf("=== NEW PRODUCT DESCRIPTION ===\n%q\n\n", description))

	sb.WriteString("TASK: Generate a JSON object with 3 fields:\n")
	sb.WriteString("1. 'headline': A catchy headline.\n")
	sb.WriteString("2. 'audience': An array of Age Groups.\n")
	sb.WriteString("3. 'location': An array of major Cities in Pakistan.\n\n")

	sb.WriteString("CONSTRAINTS:\n")
	sb.WriteString("- allowed 'audience': [\"18-24\", \"25-34\", \"35-44\", \"45-54\", \"55-64\", \"65+\"]\n")
	sb.WriteString("- 'location': real Pakistani cities only.\n")
	sb.WriteString("- IMPORTANT: Return ONLY valid JSON. Do not include markdown formatting (like ```json). Do not include explanations.\n")

	// Force the structure
	sb.WriteString("\nJSON TEMPLATE:\n")
	sb.WriteString(`{"headline": "Example Headline", "audience": ["18-24"], "location": ["Lahore"]}`)

	return sb.String()
}

// -------------------------------
// Mistral API Helpers
// -------------------------------

func callMistralForText(prompt string, key string) (string, error) {
	log.Printf("INFO: Calling Mistral API (Text Generation) for key: %s", key)

	apiKey := os.Getenv("MISTRALAPIKEY")
	if apiKey == "" {
		return "", fmt.Errorf("MISTRALAPIKEY not configured")
	}

	reqBody := MistralRequest{
		Model:       "open-mistral-7b",
		Temperature: 0.7,
		MaxTokens:   1000,
		Messages: []MistralMessage{
			{Role: "user", Content: prompt},
		},
	}

	jsonData, _ := json.Marshal(reqBody)
	req, err := http.NewRequest("POST", "https://api.mistral.ai/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("network error: %v", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var mistralResp MistralResponse
	if err := json.Unmarshal(body, &mistralResp); err != nil {
		return "", fmt.Errorf("failed to parse API response: %v", err)
	}

	if len(mistralResp.Choices) == 0 {
		return "", fmt.Errorf("no response from AI")
	}

	// Clean content
	content := mistralResp.Choices[0].Message.Content
	content = strings.TrimSpace(content)
	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimPrefix(content, "```")
	content = strings.TrimSuffix(content, "```")
	content = strings.TrimSpace(content)

	// Find JSON
	start := strings.Index(content, "{")
	end := strings.LastIndex(content, "}")
	if start == -1 || end == -1 || end < start {
		return "", fmt.Errorf("no JSON object in response")
	}
	jsonStr := content[start : end+1]

	var m map[string]interface{}
	if err := json.Unmarshal([]byte(jsonStr), &m); err != nil {
		return "", fmt.Errorf("failed to unmarshal response JSON: %v", err)
	}

	val, ok := m[key]
	if !ok {
		return "", fmt.Errorf("key %s not found in model response", key)
	}

	strVal, ok := val.(string)
	if !ok {
		return "", fmt.Errorf("value for key %s is not a string", key)
	}

	return strVal, nil
}

func callMistralForAdStruct(prompt string) (*AdDetailsResponse, error) {
	apiKey := os.Getenv("MISTRALAPIKEY")
	if apiKey == "" {
		return nil, fmt.Errorf("MISTRALAPIKEY not configured")
	}

	log.Printf("DEBUG: Sending prompt to Mistral (Length: %d)", len(prompt))

	reqBody := MistralRequest{
		Model:       "open-mistral-7b",
		Temperature: 0.7,
		MaxTokens:   2500,
		Messages: []MistralMessage{
			{Role: "user", Content: prompt},
		},
	}

	jsonData, _ := json.Marshal(reqBody)
	req, err := http.NewRequest("POST", "https://api.mistral.ai/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		log.Printf("ERROR: Mistral API returned status %d. Body: %s", resp.StatusCode, string(body))
		return nil, fmt.Errorf("API error: %s", string(body))
	}

	var mistralResp MistralResponse
	if err := json.Unmarshal(body, &mistralResp); err != nil {
		return nil, err
	}

	if len(mistralResp.Choices) == 0 {
		return nil, fmt.Errorf("no response from AI")
	}

	// --- Improved Cleaning Logic ---
	content := mistralResp.Choices[0].Message.Content

	// Log the RAW content for debugging
	log.Printf("DEBUG: Raw AI Response Content: %s", content)

	content = strings.TrimSpace(content)

	// Remove markdown blocks if present
	if strings.HasPrefix(content, "```json") {
		content = strings.TrimPrefix(content, "```json")
		content = strings.TrimSuffix(content, "```")
	} else if strings.HasPrefix(content, "```") {
		content = strings.TrimPrefix(content, "```")
		content = strings.TrimSuffix(content, "```")
	}
	content = strings.TrimSpace(content)

	// Robust JSON extraction: Find first '{' and last '}'
	start := strings.Index(content, "{")
	end := strings.LastIndex(content, "}")

	if start == -1 || end == -1 || start > end {
		log.Printf("ERROR: JSON delimiters not found. cleaned content: %s", content)
		return nil, fmt.Errorf("invalid JSON format in response")
	}

	jsonStr := content[start : end+1]
	log.Printf("DEBUG: Extracted JSON string: %s", jsonStr)

	var result AdDetailsResponse
	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		log.Printf("ERROR: Failed to unmarshal JSON: %v. Content: %s", err, jsonStr)
		return nil, fmt.Errorf("failed to parse JSON: %v", err)
	}

	return &result, nil
}

// -------------------------------
// DB Helpers
// -------------------------------

func getBrandAdsHistory(userID int) ([]BrandAdHistory, error) {
	query := `
		SELECT 
			a.id, 
			a.headline, 
			a.audience, 
			a.location, 
			a.status,
			COUNT(DISTINCT al.id) as likes_count,
			COUNT(DISTINCT ac.id) as comments_count
		FROM ads a
		JOIN published_ads pa ON a.id = pa.ad_id
		LEFT JOIN ad_likes al ON a.id = al.ad_id
		LEFT JOIN ad_comments ac ON a.id = ac.ad_id
		WHERE pa.publisher = $1
		GROUP BY a.id, a.headline, a.audience, a.location, a.status, pa.published_at
		ORDER BY pa.published_at DESC
		LIMIT 20
	`

	rows, err := config.DB.Query(query, userID)
	if err != nil {
		log.Printf("ERROR: DB: getBrandAdsHistory failed for user %d: %v", userID, err)
		return nil, err
	}
	defer rows.Close()

	var history []BrandAdHistory
	for rows.Next() {
		var h BrandAdHistory
		if err := rows.Scan(&h.ID, &h.Headline, &h.Audience, &h.Location, &h.Status, &h.LikesCount, &h.CommentsCount); err != nil {
			log.Printf("WARN: Scan error in getBrandAdsHistory: %v", err)
			continue
		}
		history = append(history, h)
	}
	return history, nil
}

func getBrandAdAnalytics(userID int) ([]models.AdAnalytics, error) {
	query := `
		SELECT id, ad_id, event_type, timestamp, publisher
		FROM ad_analytics
		WHERE publisher = $1
		ORDER BY timestamp DESC
		LIMIT 500
	`

	rows, err := config.DB.Query(query, userID)
	if err != nil {
		log.Printf("ERROR: DB: getBrandAdAnalytics failed for user %d: %v", userID, err)
		return nil, err
	}
	defer rows.Close()

	var analytics []models.AdAnalytics
	for rows.Next() {
		var aa models.AdAnalytics
		if err := rows.Scan(&aa.ID, &aa.AdID, &aa.EventType, &aa.Timestamp, &aa.Publisher); err != nil {
			log.Printf("WARN: Scan error in getBrandAdAnalytics: %v", err)
			continue
		}
		analytics = append(analytics, aa)
	}
	return analytics, nil
}

// CollaboratorProfile: The main response struct for the Frontend
type CollaboratorProfile struct {
	// Common User Fields
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	FullName string `json:"full_name"`
	ImageURL string `json:"image_url"`
	Role     string `json:"role"` // "Brand" or "Influencer"
	Bio      string `json:"bio"`

	// Specific Fields (Unified)
	Niche           string `json:"niche"`
	Location        string `json:"location"`
	SocialMediaLink string `json:"social_media_link"`

	// Influencer Specific (Zero values if Brand)
	Followers   int    `json:"followers,omitempty"`
	ContentType string `json:"content_type,omitempty"`
	Pricing     string `json:"pricing,omitempty"`

	// Analytics & AI Info
	PerformanceScore float64 `json:"performance_score"` // Calculated from past ads
	MatchReason      string  `json:"match_reason"`      // "AI Recommendation" or "Niche Match"
}

// CampaignContext: Helper to hold campaign details
type CampaignContext struct {
	ID       string
	Headline string
	Audience string
	Location string
}

// Mistral Structs
type MistralReq struct {
	Model       string  `json:"model"`
	Messages    []Msg   `json:"messages"`
	Temperature float64 `json:"temperature"`
	MaxTokens   int     `json:"max_tokens"`
}
type Msg struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}
type MistralRes struct {
	Choices []struct {
		Message Msg `json:"message"`
	} `json:"choices"`
}

// ---------------------------------------------------------
// 2. Main Controller Logic
// ---------------------------------------------------------

func RecommendCollaborators(c *gin.Context) {
	// 1. Get parameters
	campaignIDStr := c.Query("campaign_id") // Frontend must send this
	currentUserIDStr := c.Param("user_id")  // The Brand creating/viewing the campaign

	currentUserID, _ := strconv.Atoi(currentUserIDStr)

	// 2. Fetch Campaign Context
	campaign, err := getCampaignDetails(campaignIDStr)
	if err != nil {
		log.Printf("ERROR: Failed to fetch campaign %s: %v", campaignIDStr, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch campaign details"})
		return
	}

	// 3. Fetch User's Niche (Brand's Niche) for fallback
	targetNiche, _ := getUserNiche(currentUserID)

	// 4. Fetch ALL Candidates (Joined Data)
	candidates, err := getAllCollaboratorCandidates(currentUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch candidates"})
		return
	}

	// 5. ENHANCEMENT: Inject Analytics Data
	// We calculate a score for each candidate based on their history
	candidates = enrichWithAnalytics(candidates, campaignIDStr)

	// 6. AI STEP: Build Prompt and Call Mistral
	prompt := buildDetailedCollaboratorPrompt(campaign, targetNiche, candidates)
	recommendedIDs, err := callMistralForID(prompt, "collaborator_ids")

	finalResults := []CollaboratorProfile{}

	// 7. Logic Decision: AI vs Fallback
	if err == nil && len(recommendedIDs) > 0 {
		// --- AI SUCCESS PATH ---
		log.Println("INFO: Using AI recommendations")

		// Create a map for fast lookup
		candMap := make(map[int]CollaboratorProfile)
		for _, cand := range candidates {
			candMap[cand.UserID] = cand
		}

		// Append in the order AI suggested
		for _, id := range recommendedIDs {
			if profile, ok := candMap[id]; ok {
				profile.MatchReason = "AI Recommended"
				finalResults = append(finalResults, profile)
			}
		}
	} else {
		// --- FALLBACK PATH (Niche Match) ---
		log.Println("WARN: AI failed or returned 0 results. Switching to Niche Fallback.")
		targetClean := strings.ToLower(strings.TrimSpace(targetNiche))

		for _, cand := range candidates {
			candClean := strings.ToLower(strings.TrimSpace(cand.Niche))
			// Simple contains check
			if targetClean != "" && strings.Contains(candClean, targetClean) {
				cand.MatchReason = fmt.Sprintf("Niche Match: %s", cand.Niche)
				finalResults = append(finalResults, cand)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"campaign_id":   campaignIDStr,
		"target_niche":  targetNiche,
		"collaborators": finalResults,
	})
}

// ---------------------------------------------------------
// 3. Analytics & Enrichment Logic
// ---------------------------------------------------------

func enrichWithAnalytics(candidates []CollaboratorProfile, currentCampaignID string) []CollaboratorProfile {
	// map[userID]Score
	performanceMap := make(map[int]float64)

	// QUERY: Calculate success score based on TOTAL likes across all their published ads
	// We join ad_likes to count likes since Ad struct doesn't have a count column.
	rows, err := config.DB.Query(`
		SELECT 
			pa.publisher, 
			COUNT(DISTINCT pa.ad_id) as ads_count, 
			COUNT(al.id) as total_likes,
			COUNT(DISTINCT CASE WHEN a.campaign_id = $1 THEN a.id END) as in_this_campaign
		FROM published_ads pa
		JOIN ads a ON pa.ad_id = a.id
		LEFT JOIN ad_likes al ON a.id = al.ad_id
		GROUP BY pa.publisher
	`, currentCampaignID)

	if err != nil {
		log.Printf("WARN: Failed to fetch analytics: %v", err)
	} else {
		defer rows.Close()
		for rows.Next() {
			var publisherID, adsCount, totalLikes, inThisCamp int
			if err := rows.Scan(&publisherID, &adsCount, &totalLikes, &inThisCamp); err != nil {
				continue
			}

			// Simple Scoring Algorithm
			// Base score = Average Likes per Ad
			score := 0.0
			if adsCount > 0 {
				score = float64(totalLikes) / float64(adsCount)
			}

			// Boost if they are already active in THIS campaign
			if inThisCamp > 0 {
				score += 500.0 // Huge bonus for returning collaborators
			}

			performanceMap[publisherID] = score
		}
	}

	// Apply scores to candidates
	for i := range candidates {
		if score, ok := performanceMap[candidates[i].UserID]; ok {
			candidates[i].PerformanceScore = score
		} else {
			candidates[i].PerformanceScore = 0 // No history = 0 score
		}
	}

	return candidates
}

// ---------------------------------------------------------
// 4. Prompt Builder
// ---------------------------------------------------------

func buildDetailedCollaboratorPrompt(campaign CampaignContext, targetNiche string, candidates []CollaboratorProfile) string {
	var sb strings.Builder

	sb.WriteString("You are a Marketing Matchmaker AI.\n")
	sb.WriteString("Rank the following candidates for a collaboration campaign.\n\n")

	sb.WriteString("=== CAMPAIGN CONTEXT ===\n")
	sb.WriteString(fmt.Sprintf("Headline: %s\n", campaign.Headline))
	// Description removed as it doesn't exist in Ad struct
	sb.WriteString(fmt.Sprintf("Target Niche: %s\n", targetNiche))
	sb.WriteString(fmt.Sprintf("Target Audience: %s\n\n", campaign.Audience))

	sb.WriteString("=== CANDIDATES ===\n")
	sb.WriteString("(Score = Based on past ad performance. Higher is better.)\n")
	for _, c := range candidates {
		// Format data so AI sees the difference between Brand and Influencer
		info := fmt.Sprintf("ID:%d | Role:%s | Niche:%s | Loc:%s | PerfScore:%.0f",
			c.UserID, c.Role, c.Niche, c.Location, c.PerformanceScore)

		if c.Role == "Influencer" {
			info += fmt.Sprintf(" | Followers:%d | Type:%s | Price:%s", c.Followers, c.ContentType, c.Pricing)
		} else {
			info += " | (Brand Partner)"
		}
		sb.WriteString(info + "\n")
	}
	sb.WriteString("\n")

	sb.WriteString("TASK:\n")
	sb.WriteString("Return a JSON object with a list of 'collaborator_ids' that best fit the Campaign Context.\n")
	sb.WriteString("RULES:\n")
	sb.WriteString("1. Prioritize candidates with matching Niche and Location.\n")
	sb.WriteString("2. Strongly Prioritize candidates with high 'PerfScore' (Performance Score).\n")
	sb.WriteString("3. Example Output: {\"collaborator_ids\": [10, 4, 99]}\n")
	sb.WriteString("4. Output ONLY JSON. No text.\n")

	return sb.String()
}

// ---------------------------------------------------------
// 5. Database Helpers
// ---------------------------------------------------------

func getCampaignDetails(campaignID string) (CampaignContext, error) {
	var c CampaignContext
	c.ID = campaignID

	// Querying 'ads' table. Removed 'description' as it's not in the Ad struct.
	query := `SELECT headline, audience, location FROM ads WHERE campaign_id = $1 LIMIT 1`

	row := config.DB.QueryRow(query, campaignID)

	var aud, loc sql.NullString
	// Scan matches SELECT columns
	err := row.Scan(&c.Headline, &aud, &loc)

	c.Audience = aud.String
	c.Location = loc.String

	return c, err
}

func getUserNiche(userID int) (string, error) {
	var niche sql.NullString
	query := `
        SELECT COALESCE(
            (SELECT niche FROM brands WHERE user_id = $1),
            (SELECT niche FROM influencers WHERE user_id = $1)
        )
    `
	err := config.DB.QueryRow(query, userID).Scan(&niche)
	return niche.String, err
}

func getAllCollaboratorCandidates(excludeUserID int) ([]CollaboratorProfile, error) {
	query := `
        SELECT 
            u.id, u.username, u.full_name, COALESCE(u.image_url, ''), u.role, COALESCE(u.bio, ''),
            COALESCE(b.niche, i.niche, ''),
            COALESCE(b.location, i.location, ''),
            COALESCE(b.social_media_link, i.social_media_link, ''),
            COALESCE(i.followers, 0),
            COALESCE(i.content_type, ''),
            COALESCE(i.pricing, '')
        FROM users u
        LEFT JOIN brands b ON u.id = b.user_id
        LEFT JOIN influencers i ON u.id = i.user_id
        WHERE u.id != $1 
        AND u.role IN ('Brand', 'Influencer')
        LIMIT 100
    `
	rows, err := config.DB.Query(query, excludeUserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var profiles []CollaboratorProfile
	for rows.Next() {
		var p CollaboratorProfile
		if err := rows.Scan(
			&p.UserID, &p.Username, &p.FullName, &p.ImageURL, &p.Role, &p.Bio,
			&p.Niche, &p.Location, &p.SocialMediaLink,
			&p.Followers, &p.ContentType, &p.Pricing,
		); err != nil {
			continue
		}
		profiles = append(profiles, p)
	}
	return profiles, nil
}

// ---------------------------------------------------------
// 6. Mistral AI Helper
// ---------------------------------------------------------

func callMistralForID(prompt string, key string) ([]int, error) {
	apiKey := os.Getenv("MISTRALAPIKEY")
	if apiKey == "" {
		return nil, fmt.Errorf("MISTRALAPIKEY not set")
	}

	reqBody := MistralReq{
		Model:       "open-mistral-7b",
		Temperature: 0.5,
		MaxTokens:   1000,
		Messages: []Msg{
			{Role: "user", Content: prompt},
		},
	}

	jsonBytes, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "https://api.mistral.ai/v1/chat/completions", bytes.NewBuffer(jsonBytes))
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		log.Printf("Mistral Error: %s", string(body))
		return nil, fmt.Errorf("API Error")
	}

	var mRes MistralRes
	json.Unmarshal(body, &mRes)
	if len(mRes.Choices) == 0 {
		return nil, fmt.Errorf("no choices")
	}

	// Clean JSON string
	content := mRes.Choices[0].Message.Content
	content = strings.TrimSpace(content)
	// Remove Markdown Code Blocks
	if idx := strings.Index(content, "```json"); idx != -1 {
		content = content[idx+7:]
	} else if idx := strings.Index(content, "```"); idx != -1 {
		content = content[idx+3:]
	}
	if idx := strings.LastIndex(content, "```"); idx != -1 {
		content = content[:idx]
	}
	content = strings.TrimSpace(content)

	// Robust Extraction: Find first '{' and last '}'
	start := strings.Index(content, "{")
	end := strings.LastIndex(content, "}")
	if start == -1 || end == -1 {
		return nil, fmt.Errorf("invalid json")
	}
	content = content[start : end+1]

	// Parse generic map to find key
	var result map[string][]int
	if err := json.Unmarshal([]byte(content), &result); err != nil {
		return nil, err
	}

	if ids, ok := result[key]; ok {
		return ids, nil
	}
	return nil, fmt.Errorf("key not found")
}
