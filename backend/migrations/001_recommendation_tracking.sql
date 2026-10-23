-- Migration: AI model performance + recommendation outcome tracking
-- Run this against your PostgreSQL database before deploying the Qwen agents.

-- 1. Track every low-level LLM agent call for latency, token cost, and failure rate.
CREATE TABLE IF NOT EXISTS model_performance_logs (
    id                BIGSERIAL PRIMARY KEY,
    request_id        VARCHAR(255)  NOT NULL,
    user_id           INTEGER       NOT NULL,
    agent_stage       VARCHAR(50)   NOT NULL,  -- 'profiler' | 'ranker'
    task_type         VARCHAR(50)   NOT NULL,  -- 'post_recommendation' | 'ad_recommendation'
    model             VARCHAR(100)  NOT NULL,  -- e.g. 'qwen-plus'
    prompt_tokens     INTEGER       DEFAULT 0,
    completion_tokens INTEGER       DEFAULT 0,
    total_tokens      INTEGER       DEFAULT 0,
    latency_ms        BIGINT        DEFAULT 0,
    success           BOOLEAN       DEFAULT TRUE,
    error_message     TEXT,
    raw_prompt        TEXT,
    raw_response      TEXT,
    parsed_output     TEXT,
    created_at        TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perf_request_id  ON model_performance_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_perf_user_id     ON model_performance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_perf_stage       ON model_performance_logs(agent_stage);
CREATE INDEX IF NOT EXISTS idx_perf_created_at  ON model_performance_logs(created_at);

-- 2. One row per recommended post, written immediately after the ranker returns.
--    NULL post_id indicates a 'no_relevant_match' abstention row.
--    Clicked/liked/commented/dismissed flags are updated later via the feedback endpoint.
CREATE TABLE IF NOT EXISTS recommendation_outcomes (
    id            BIGSERIAL    PRIMARY KEY,
    request_id    VARCHAR(255) NOT NULL,
    user_id       INTEGER      NOT NULL,
    post_id       INTEGER,                      -- NULL when outcome is 'no_relevant_match'
    rank_position INTEGER      NOT NULL DEFAULT 0,
    ai_confidence NUMERIC(4,3) DEFAULT 0,
    ai_reason     TEXT,
    clicked       BOOLEAN      DEFAULT FALSE,
    liked         BOOLEAN      DEFAULT FALSE,
    commented     BOOLEAN      DEFAULT FALSE,
    dismissed     BOOLEAN      DEFAULT FALSE,
    created_at    TIMESTAMPTZ  DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outcome_request_id  ON recommendation_outcomes(request_id);
CREATE INDEX IF NOT EXISTS idx_outcome_user_post   ON recommendation_outcomes(user_id, post_id);

-- 3. Live analytical view to measure Qwen's recommendation precision over time.
--    Abstention rows (post_id IS NULL) are counted separately so you can track
--    both precision and abstention rate in your presentation metrics.
CREATE OR REPLACE VIEW model_precision_summary AS
SELECT
    DATE_TRUNC('day', ro.created_at)                                          AS day,
    COUNT(*)                                                                   AS total_recommendations,
    COUNT(CASE WHEN ro.post_id IS NULL THEN 1 END)                            AS abstentions,
    SUM(CASE WHEN ro.clicked OR ro.liked OR ro.commented THEN 1 ELSE 0 END)   AS positive_interactions,
    COUNT(CASE WHEN ro.dismissed THEN 1 END)                                  AS explicit_dismissals,
    ROUND(
        SUM(CASE WHEN ro.clicked OR ro.liked OR ro.commented THEN 1 ELSE 0 END)::NUMERIC
        / NULLIF(COUNT(CASE WHEN ro.post_id IS NOT NULL THEN 1 END), 0),
        3
    )                                                                          AS precision_rate,
    AVG(ro.ai_confidence)                                                      AS avg_confidence
FROM recommendation_outcomes ro
GROUP BY 1
ORDER BY 1 DESC;
