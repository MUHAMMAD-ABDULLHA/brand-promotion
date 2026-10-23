package controllers

import (
	"bytes"
	"crypto/rand"
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
	"vite-project/backend/data"
	"vite-project/backend/models"

	"github.com/gin-gonic/gin"
)

// =================================================================
// Qwen client (OpenAI-compatible endpoint via DashScope / Qwen Cloud)
// =================================================================

type QwenMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type QwenRequest struct {
	Model       string        `json:"model"`
	Messages    []QwenMessage `json:"messages"`
	Temperature float64       `json:"temperature"`
	MaxTokens   int           `json:"max_tokens"`
}

type QwenUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

type QwenResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Usage QwenUsage `json:"usage"`
}

// qwenCall is the single low-level transport used by every agent.
// It returns raw content + usage + latency so each agent can log its own performance row.
func qwenCall(model, prompt string, temperature float64, maxTokens int) (content string, usage QwenUsage, latencyMs int64, err error) {
	apiKey := os.Getenv("QWENAPIKEY")
	if apiKey == "" {
		return "", usage, 0, fmt.Errorf("QWENAPIKEY not configured")
	}

	baseURL := os.Getenv("QWEN_BASE_URL")
	if baseURL == "" {
		// DashScope's OpenAI-compatible mode, works with Qwen Cloud API keys
		baseURL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions"
	}

	reqBody := QwenRequest{
		Model:       model,
		Temperature: temperature,
		MaxTokens:   maxTokens,
		Messages:    []QwenMessage{{Role: "user", Content: prompt}},
	}
	jsonData, _ := json.Marshal(reqBody)

	req, err := http.NewRequest("POST", baseURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", usage, 0, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

	client := &http.Client{Timeout: 30 * time.Second}
	start := time.Now()
	resp, err := client.Do(req)
	latencyMs = time.Since(start).Milliseconds()
	if err != nil {
		return "", usage, latencyMs, fmt.Errorf("network error: %v", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		return "", usage, latencyMs, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var qr QwenResponse
	if err := json.Unmarshal(body, &qr); err != nil {
		return "", usage, latencyMs, fmt.Errorf("failed to parse Qwen response: %v", err)
	}
	if len(qr.Choices) == 0 {
		return "", qr.Usage, latencyMs, fmt.Errorf("no choices in Qwen response")
	}

	content = strings.TrimSpace(qr.Choices[0].Message.Content)
	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimPrefix(content, "```")
	content = strings.TrimSuffix(content, "```")
	content = strings.TrimSpace(content)

	return content, qr.Usage, latencyMs, nil
}

// =================================================================
// Performance logging
// =================================================================

func newRequestID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}

func logModelPerformance(l models.ModelPerformanceLog) {
	_, err := config.DB.Exec(`
		INSERT INTO model_performance_logs
			(request_id, user_id, agent_stage, task_type, model,
			 prompt_tokens, completion_tokens, total_tokens,
			 latency_ms, success, error_message, raw_prompt, raw_response, parsed_output)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
	`,
		l.RequestID, l.UserID, l.AgentStage, l.TaskType, l.Model,
		l.PromptTokens, l.CompletionTokens, l.TotalTokens,
		l.LatencyMs, l.Success, l.ErrorMessage, l.RawPrompt, l.RawResponse, l.ParsedOutput,
	)
	if err != nil {
		// never let logging failures break the recommendation flow
		log.Printf("WARN: failed to write model_performance_logs row: %v", err)
	}
}

func insertRecommendationOutcomes(requestID string, userID int, ranked []AIRecommendedPost) {
	for i, r := range ranked {
		_, err := config.DB.Exec(`
			INSERT INTO recommendation_outcomes
				(request_id, user_id, post_id, rank_position, ai_confidence, ai_reason)
			VALUES ($1,$2,$3,$4,$5,$6)
		`, requestID, userID, r.PostID, i+1, r.Confidence, r.Reason)
		if err != nil {
			log.Printf("WARN: failed to write recommendation_outcomes row for post %d: %v", r.PostID, err)
		}
	}
}

// =================================================================
// Agent 1: Profiler — turns raw user/follow/activity rows into a short,
// dense interest profile. Cheap+fast model, single job, no ranking.
// =================================================================

func buildProfilerPrompt(user models.User, follows []models.Follow, postActivity []models.PostAnalytics) string {
	var sb strings.Builder
	sb.WriteString("You are a user-profiling agent in a marketing platform's recommendation pipeline.\n")
	sb.WriteString("Your only job: read the raw data below and output a short interest profile.\n")
	sb.WriteString("Do not rank or mention any posts. Do not explain yourself.\n\n")

	sb.WriteString("=== USER PROFILE ===\n")
	sb.WriteString(fmt.Sprintf("ID: %d | Age: %d | Role: %s | Bio: %s\n\n", user.ID, user.Age, user.Role, user.Bio))

	sb.WriteString("=== FOLLOWED USERS (IDs) ===\n")
	if len(follows) == 0 {
		sb.WriteString("None\n\n")
	} else {
		var fids []string
		for _, f := range follows {
			fids = append(fids, fmt.Sprintf("%d", f.FollowingID))
		}
		sb.WriteString(fmt.Sprintf("[%s]\n\n", strings.Join(fids, ", ")))
	}

	sb.WriteString("=== RECENT POST INTERACTIONS ===\n")
	if len(postActivity) == 0 {
		sb.WriteString("None\n\n")
	} else {
		for _, pa := range postActivity {
			sb.WriteString(fmt.Sprintf("- Post %d: %s\n", pa.PostID, pa.EventType))
		}
		sb.WriteString("\n")
	}

	sb.WriteString("### OUTPUT FORMAT ###\n")
	sb.WriteString("Return a SINGLE valid JSON object, no markdown fences, no comments:\n")
	sb.WriteString(`{"interests": ["..."], "behavior_summary": "1-2 sentence summary of engagement patterns", "affinity_notes": "1 sentence on what kind of content this user responds to"}`)
	sb.WriteString("\n\nResponse:")
	return sb.String()
}

type ProfilerOutput struct {
	Interests       []string `json:"interests"`
	BehaviorSummary string   `json:"behavior_summary"`
	AffinityNotes   string   `json:"affinity_notes"`
}

func runProfilerAgent(requestID string, userId int, user models.User, follows []models.Follow, postActivity []models.PostAnalytics) (ProfilerOutput, error) {
	model := os.Getenv("QWEN_PROFILER_MODEL")
	if model == "" {
		model = "qwen-turbo" // cheap model is enough for this extraction-only step
	}

	prompt := buildProfilerPrompt(user, follows, postActivity)
	content, usage, latency, err := qwenCall(model, prompt, 0.3, 600)

	perf := models.ModelPerformanceLog{
		RequestID:        requestID,
		UserID:           userId,
		AgentStage:       "profiler",
		TaskType:         "post_recommendation",
		Model:            model,
		PromptTokens:     usage.PromptTokens,
		CompletionTokens: usage.CompletionTokens,
		TotalTokens:      usage.TotalTokens,
		LatencyMs:        latency,
		RawPrompt:        prompt,
		RawResponse:      content,
	}

	if err != nil {
		perf.Success = false
		perf.ErrorMessage = err.Error()
		logModelPerformance(perf)
		return ProfilerOutput{}, err
	}

	var out ProfilerOutput
	jsonStr := extractJSONObject(content)
	if jsonStr == "" || json.Unmarshal([]byte(jsonStr), &out) != nil {
		perf.Success = false
		perf.ErrorMessage = "failed to parse profiler JSON"
		logModelPerformance(perf)
		// degrade gracefully instead of failing the whole pipeline
		return ProfilerOutput{BehaviorSummary: "no profile available"}, nil
	}

	perf.Success = true
	parsedBytes, _ := json.Marshal(out)
	perf.ParsedOutput = string(parsedBytes)
	logModelPerformance(perf)

	return out, nil
}

// =================================================================
// Agent 2: Ranker — takes the profiler's output + candidate posts and
// produces the final ranked list with per-post reasoning/confidence.
// =================================================================

func buildRankerPrompt(user models.User, profile ProfilerOutput, availablePosts []models.Post) string {
	var sb strings.Builder
	sb.WriteString("You are a ranking agent in a marketing platform's recommendation pipeline.\n")
	sb.WriteString("You receive a pre-computed user interest profile and a list of candidate posts.\n")
	sb.WriteString("Your only job is to rank the candidates. You do not see raw user data directly.\n\n")

	sb.WriteString("=== USER INTEREST PROFILE (from profiler agent) ===\n")
	sb.WriteString(fmt.Sprintf("Interests: %s\n", strings.Join(profile.Interests, ", ")))
	sb.WriteString(fmt.Sprintf("Behavior summary: %s\n", profile.BehaviorSummary))
	sb.WriteString(fmt.Sprintf("Affinity notes: %s\n\n", profile.AffinityNotes))

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
	sb.WriteString("Rank candidates by fit with the profile above. For each post you include, give a short reason and a confidence score 0-1.\n")
	sb.WriteString("Only include posts that are genuinely relevant — do not pad the list.\n\n")

	sb.WriteString("### OUTPUT FORMAT ###\n")
	sb.WriteString("Return a SINGLE valid JSON object, no markdown fences, no comments, parsable by Go's encoding/json:\n")
	sb.WriteString(`{"ranked_posts": [{"post_id": 123, "reason": "...", "confidence": 0.91}]}`)
	sb.WriteString("\n\nResponse:")
	return sb.String()
}

type rankerOutputWrapper struct {
	RankedPosts []AIRecommendedPost `json:"ranked_posts"`
}

func runRankerAgent(requestID string, userId int, user models.User, profile ProfilerOutput, availablePosts []models.Post) ([]AIRecommendedPost, error) {
	model := os.Getenv("QWEN_RANKER_MODEL")
	if model == "" {
		model = "qwen-plus" // higher-quality model for the actual ranking judgment
	}

	prompt := buildRankerPrompt(user, profile, availablePosts)
	content, usage, latency, err := qwenCall(model, prompt, 0.5, 2000)

	perf := models.ModelPerformanceLog{
		RequestID:        requestID,
		UserID:           userId,
		AgentStage:       "ranker",
		TaskType:         "post_recommendation",
		Model:            model,
		PromptTokens:     usage.PromptTokens,
		CompletionTokens: usage.CompletionTokens,
		TotalTokens:      usage.TotalTokens,
		LatencyMs:        latency,
		RawPrompt:        prompt,
		RawResponse:      content,
	}

	if err != nil {
		perf.Success = false
		perf.ErrorMessage = err.Error()
		logModelPerformance(perf)
		return nil, err
	}

	jsonStr := extractJSONObject(content)
	var wrapper rankerOutputWrapper
	if jsonStr == "" || json.Unmarshal([]byte(jsonStr), &wrapper) != nil {
		perf.Success = false
		perf.ErrorMessage = "failed to parse ranker JSON"
		logModelPerformance(perf)
		return nil, fmt.Errorf("failed to parse ranker output")
	}

	perf.Success = true
	parsedBytes, _ := json.Marshal(wrapper)
	perf.ParsedOutput = string(parsedBytes)
	logModelPerformance(perf)

	return wrapper.RankedPosts, nil
}

func extractJSONObject(content string) string {
	start := strings.Index(content, "{")
	end := strings.LastIndex(content, "}")
	if start == -1 || end == -1 || end < start {
		return ""
	}
	return content[start : end+1]
}

// =================================================================
// Public endpoint — alternative entry-point (user-facing route)
// =================================================================

// RecommendPostsQwen runs the two-agent pipeline (profiler -> ranker),
// logs performance for both stages, writes one outcome row per recommended
// post for later precision analysis, and returns the ordered posts.
// If the ranker returns no results an abstention row is written so the
// model_precision_summary view stays accurate.
// Query params: ?limit=20&offset=0 to paginate candidate pool.
func RecommendPostsQwen(c *gin.Context) {
	userID := c.Param("user_id")
	userId, err := strconv.Atoi(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if limit < 1 || limit > 200 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	requestID := newRequestID()
	requestStartTime := time.Now()
	log.Printf("INFO: [%s] Starting RecommendPostsQwen for user_id: %d (limit=%d, offset=%d)", requestID, userId, limit, offset)

	user, err := getUserByID(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load user"})
		return
	}

	follows, _ := getUserFollows(userId)
	postActivity, _ := getUserPostAnalytics(userId)

	availablePosts, err := data.GetRecentPostsPaginated(limit, offset)
	if err != nil {
		log.Printf("ERROR: [%s] JSON post source unavailable: %v", requestID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "post data not available — run scraper first: cd backend && python scraper/scrape_instagram.py"})
		return
	}

	// --- Agent 1: profile the user ---
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

	// --- Agent 2: rank candidates against the profile ---
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
		// Model found no relevant matches — fall back to serving candidate posts
		// so the user always sees content while the model improves.
		fallback := availablePosts
		if len(fallback) > 20 {
			fallback = fallback[:20]
		}
		_, _ = config.DB.Exec(`
			INSERT INTO recommendation_outcomes
				(request_id, user_id, post_id, rank_position, ai_confidence, ai_reason)
			VALUES ($1, $2, NULL, 0, 0, 'no_relevant_match')
		`, requestID, userId)
		WriteRecommendationAnalysis(AnalysisContext{
			RequestID: requestID, RequestTime: requestStartTime, UserID: userId,
			User: user, Follows: follows, PostActivity: postActivity,
			CandidatePosts: availablePosts, ProfilerOutput: profile,
			ProfilerLatencyMs: profilerLatencyMs, RankedResults: ranked,
			RankerLatencyMs: rankerLatencyMs, FinalPosts: fallback,
		})
		c.JSON(http.StatusOK, gin.H{
			"posts":      fallback,
			"request_id": requestID,
			"source":     "json_fallback_no_match",
		})
		return
	}

	// Preserve agent-ranked order when fetching post details
	ids := make([]int, 0, len(ranked))
	for _, r := range ranked {
		ids = append(ids, r.PostID)
	}
	posts, err := data.GetPostsByIDs(ids)
	if err != nil {
		log.Printf("ERROR: [%s] JSON post lookup failed: %v", requestID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch recommended posts from JSON source"})
		return
	}

	// Write one outcome row per recommendation; click/like/etc updated later via feedback endpoint
	insertRecommendationOutcomes(requestID, userId, ranked)

	// Fire-and-forget analysis log
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
		"reasoning":  ranked,
		"request_id": requestID,
	})
	log.Printf("INFO: [%s] Finished RecommendPostsQwen, returned %d posts", requestID, len(posts))
}

// RecordRecommendationFeedback lets the frontend report back what the user actually
// did with a recommended post (click/like/comment/dismiss), closing the loop so
// model_precision_summary reflects real outcomes, not just model confidence.
// Expected body: {"request_id": "...", "post_id": 123, "action": "clicked"}
func RecordRecommendationFeedback(c *gin.Context) {
	var body struct {
		RequestID string `json:"request_id"`
		PostID    int    `json:"post_id"`
		Action    string `json:"action"` // "clicked" | "liked" | "commented" | "dismissed"
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}

	col := map[string]string{
		"clicked":   "clicked",
		"liked":     "liked",
		"commented": "commented",
		"dismissed": "dismissed",
	}[body.Action]
	if col == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid action"})
		return
	}

	query := fmt.Sprintf(`
		UPDATE recommendation_outcomes
		SET %s = TRUE, updated_at = NOW()
		WHERE request_id = $1 AND post_id = $2
	`, col)

	res, err := config.DB.Exec(query, body.RequestID, body.PostID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to record feedback"})
		return
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "no matching recommendation outcome"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// Keep sql import used even if needed
var _ = sql.ErrNoRows
