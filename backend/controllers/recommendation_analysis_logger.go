package controllers

// recommendation_analysis_logger.go
//
// PURPOSE: Write exhaustive per-call analysis logs to a local file for offline
//          inspection of the recommendation pipeline.
//
// SAFETY:  This file is completely standalone. It exports one function:
//              WriteRecommendationAnalysis(ctx AnalysisContext)
//          which is called at the END of RecommendPosts (and only there).
//          Deleting this file and its single call site will not affect any
//          other code in any way.
//
// OUTPUT:  logs/recommendation_analysis.log  (created if not present,
//          appended on every call — never overwritten)

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
	"vite-project/backend/models"
)

// AnalysisContext is the bag of data collected throughout one RecommendPosts call.
// It is assembled in recommendationController.go right before calling
// WriteRecommendationAnalysis and then thrown away.
type AnalysisContext struct {
	// ── request metadata ─────────────────────────────────────────────────────
	RequestID   string
	RequestTime time.Time
	UserID      int

	// ── user snapshot ─────────────────────────────────────────────────────────
	User models.User

	// ── social graph snapshot ────────────────────────────────────────────────
	Follows []models.Follow

	// ── recent activity ──────────────────────────────────────────────────────
	PostActivity []models.PostAnalytics

	// ── candidate pool ───────────────────────────────────────────────────────
	CandidatePosts []models.Post

	// ── agent outputs ─────────────────────────────────────────────────────────
	ProfilerOutput   ProfilerOutput      // from Agent 1
	ProfilerLatencyMs int64
	ProfilerTokens   QwenUsage

	RankedResults    []AIRecommendedPost // from Agent 2
	RankerLatencyMs  int64
	RankerTokens     QwenUsage

	// ── final output ──────────────────────────────────────────────────────────
	FinalPosts   []models.Post // posts actually returned to the frontend
	PipelineError string       // non-empty if something failed
}

// WriteRecommendationAnalysis appends a rich, human-readable log block to
// logs/recommendation_analysis.log.  It never returns an error to the caller
// — a logging failure must never break the recommendation response.
func WriteRecommendationAnalysis(ctx AnalysisContext) {
	go func() { // fire-and-forget so it doesn't slow down the HTTP response
		if err := writeAnalysis(ctx); err != nil {
			fmt.Printf("WARN [analysis_logger]: %v\n", err)
		}
	}()
}

// ─── internal ────────────────────────────────────────────────────────────────

func writeAnalysis(ctx AnalysisContext) error {
	// Ensure the logs directory exists (relative to the binary's working dir)
	logDir := "logs"
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return fmt.Errorf("mkdir logs: %w", err)
	}

	logPath := filepath.Join(logDir, "recommendation_analysis.log")
	f, err := os.OpenFile(logPath, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("open log file: %w", err)
	}
	defer f.Close()

	var b strings.Builder
	line := func(format string, args ...any) {
		b.WriteString(fmt.Sprintf(format+"\n", args...))
	}
	sep := func(ch string) { line(strings.Repeat(ch, 80)) }

	now := time.Now()
	elapsed := now.Sub(ctx.RequestTime)

	sep("=")
	line("RECOMMENDATION ANALYSIS LOG")
	line("Timestamp     : %s", now.Format(time.RFC3339))
	line("Request ID    : %s", ctx.RequestID)
	line("Pipeline Time : %v", elapsed.Round(time.Millisecond))
	if ctx.PipelineError != "" {
		line("Pipeline Error: %s", ctx.PipelineError)
	}
	sep("=")

	// ── 1. User snapshot ──────────────────────────────────────────────────────
	sep("-")
	line("[1] USER SNAPSHOT")
	sep("-")
	line("  ID       : %d", ctx.User.ID)
	line("  Username : %s", ctx.User.Username)
	line("  Email    : %s", ctx.User.Email)
	line("  Role     : %s", ctx.User.Role)
	line("  Age      : %d", ctx.User.Age)
	line("  Bio      : %s", ctx.User.Bio)

	// ── 2. Social graph ───────────────────────────────────────────────────────
	sep("-")
	line("[2] SOCIAL GRAPH  (follows: %d)", len(ctx.Follows))
	sep("-")
	if len(ctx.Follows) == 0 {
		line("  (no follows)")
	} else {
		for i, f := range ctx.Follows {
			line("  [%3d] follower=%d  following=%d", i+1, f.FollowerID, f.FollowingID)
		}
	}

	// ── 3. Recent activity ────────────────────────────────────────────────────
	sep("-")
	line("[3] RECENT POST ACTIVITY  (events: %d)", len(ctx.PostActivity))
	sep("-")
	if len(ctx.PostActivity) == 0 {
		line("  (no recent activity)")
	} else {
		for i, pa := range ctx.PostActivity {
			line("  [%3d] post_id=%-6d  event=%s", i+1, pa.PostID, pa.EventType)
		}
	}

	// ── 4. Candidate pool ─────────────────────────────────────────────────────
	sep("-")
	line("[4] CANDIDATE POSTS POOL  (count: %d)", len(ctx.CandidatePosts))
	sep("-")
	if len(ctx.CandidatePosts) == 0 {
		line("  (no candidate posts available)")
	} else {
		for i, p := range ctx.CandidatePosts {
			line("  [%3d] id=%-6d  user_id=%-6d  sponsored=%-5v  likes=%-5d  comments=%-5d  impressions=%-8d  engagement=%.4f",
				i+1, p.ID, p.UserID, p.IsSponsored, p.Likes, p.CommentsCount, p.Impressions, p.EngagementRate)
			caption := p.Caption
			if len(caption) > 120 {
				caption = caption[:120] + "..."
			}
			line("         caption : %q", caption)
			if p.ImageURL != "" {
				line("         image   : %s", p.ImageURL)
			}
			line("         created : %s", p.CreatedAt.Format("2006-01-02 15:04:05"))
		}
	}

	// ── 5. Agent 1 — Profiler ─────────────────────────────────────────────────
	sep("-")
	line("[5] AGENT 1: PROFILER")
	sep("-")
	line("  Model    : qwen-turbo (or QWEN_PROFILER_MODEL env)")
	line("  Latency  : %d ms", ctx.ProfilerLatencyMs)
	line("  Tokens   : prompt=%d  completion=%d  total=%d",
		ctx.ProfilerTokens.PromptTokens, ctx.ProfilerTokens.CompletionTokens, ctx.ProfilerTokens.TotalTokens)
	line("  Interests:")
	if len(ctx.ProfilerOutput.Interests) == 0 {
		line("    (none extracted)")
	} else {
		for _, interest := range ctx.ProfilerOutput.Interests {
			line("    - %s", interest)
		}
	}
	line("  Behavior Summary : %s", ctx.ProfilerOutput.BehaviorSummary)
	line("  Affinity Notes   : %s", ctx.ProfilerOutput.AffinityNotes)

	// ── 6. Agent 2 — Ranker ───────────────────────────────────────────────────
	sep("-")
	line("[6] AGENT 2: RANKER")
	sep("-")
	line("  Model    : qwen-plus (or QWEN_RANKER_MODEL env)")
	line("  Latency  : %d ms", ctx.RankerLatencyMs)
	line("  Tokens   : prompt=%d  completion=%d  total=%d",
		ctx.RankerTokens.PromptTokens, ctx.RankerTokens.CompletionTokens, ctx.RankerTokens.TotalTokens)
	line("  Ranked results (%d):", len(ctx.RankedResults))
	if len(ctx.RankedResults) == 0 {
		line("    (no results)")
	} else {
		for i, r := range ctx.RankedResults {
			line("  [%3d] post_id=%-6d  confidence=%.3f  reason=%q",
				i+1, r.PostID, r.Confidence, r.Reason)
		}
	}

	// ── 7. Final output ───────────────────────────────────────────────────────
	sep("-")
	line("[7] FINAL POSTS RETURNED TO FRONTEND  (count: %d)", len(ctx.FinalPosts))
	sep("-")
	if len(ctx.FinalPosts) == 0 {
		line("  (empty — no posts served)")
	} else {
		for i, p := range ctx.FinalPosts {
			// Find if this post had a ranking entry
			var confidence float64
			var reason string
			for _, r := range ctx.RankedResults {
				if r.PostID == p.ID {
					confidence = r.Confidence
					reason = r.Reason
					break
				}
			}
			line("  [%3d] id=%-6d  user_id=%-6d  sponsored=%-5v  likes=%-5d  engagement=%.4f  confidence=%.3f",
				i+1, p.ID, p.UserID, p.IsSponsored, p.Likes, p.EngagementRate, confidence)
			caption := p.Caption
			if len(caption) > 100 {
				caption = caption[:100] + "..."
			}
			line("         caption : %q", caption)
			if reason != "" {
				line("         ai_reason: %s", reason)
			}
		}
	}

	// ── 8. Token/cost summary ─────────────────────────────────────────────────
	sep("-")
	line("[8] PIPELINE COST SUMMARY")
	sep("-")
	totalPrompt := ctx.ProfilerTokens.PromptTokens + ctx.RankerTokens.PromptTokens
	totalCompletion := ctx.ProfilerTokens.CompletionTokens + ctx.RankerTokens.CompletionTokens
	totalAll := ctx.ProfilerTokens.TotalTokens + ctx.RankerTokens.TotalTokens
	totalLatency := ctx.ProfilerLatencyMs + ctx.RankerLatencyMs
	line("  Total prompt tokens     : %d", totalPrompt)
	line("  Total completion tokens : %d", totalCompletion)
	line("  Total tokens            : %d", totalAll)
	line("  Total AI latency        : %d ms  (profiler: %d ms + ranker: %d ms)",
		totalLatency, ctx.ProfilerLatencyMs, ctx.RankerLatencyMs)
	line("  Total wall time         : %v", elapsed.Round(time.Millisecond))

	// ── 9. Raw JSON dump (machine-readable) ───────────────────────────────────
	sep("-")
	line("[9] RAW JSON DUMP (for programmatic parsing)")
	sep("-")
	type jsonDump struct {
		RequestID      string              `json:"request_id"`
		Timestamp      string              `json:"timestamp"`
		UserID         int                 `json:"user_id"`
		UserRole       string              `json:"user_role"`
		FollowCount    int                 `json:"follow_count"`
		ActivityCount  int                 `json:"activity_count"`
		CandidateCount int                 `json:"candidate_count"`
		ProfilerOut    ProfilerOutput      `json:"profiler_output"`
		RankedResults  []AIRecommendedPost `json:"ranked_results"`
		FinalPostIDs   []int               `json:"final_post_ids"`
		TokensTotal    int                 `json:"tokens_total"`
		LatencyTotalMs int64               `json:"latency_total_ms"`
		PipelineError  string              `json:"pipeline_error,omitempty"`
	}
	finalIDs := make([]int, 0, len(ctx.FinalPosts))
	for _, p := range ctx.FinalPosts {
		finalIDs = append(finalIDs, p.ID)
	}
	dump := jsonDump{
		RequestID:      ctx.RequestID,
		Timestamp:      ctx.RequestTime.Format(time.RFC3339),
		UserID:         ctx.UserID,
		UserRole:       ctx.User.Role,
		FollowCount:    len(ctx.Follows),
		ActivityCount:  len(ctx.PostActivity),
		CandidateCount: len(ctx.CandidatePosts),
		ProfilerOut:    ctx.ProfilerOutput,
		RankedResults:  ctx.RankedResults,
		FinalPostIDs:   finalIDs,
		TokensTotal:    totalAll,
		LatencyTotalMs: totalLatency,
		PipelineError:  ctx.PipelineError,
	}
	jsonBytes, _ := json.MarshalIndent(dump, "  ", "  ")
	line("%s", string(jsonBytes))

	sep("=")
	b.WriteString("\n")

	_, err = f.WriteString(b.String())
	return err
}
