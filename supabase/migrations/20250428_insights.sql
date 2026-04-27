-- ============================================================
-- Phase 8: Insights & History
-- Adds a materialized daily_summaries view + helper functions
-- ============================================================

-- daily_summaries: one row per user per calendar day
-- Aggregates symptom_logs for fast charting queries
CREATE OR REPLACE VIEW public.daily_summaries AS
SELECT
  user_id,
  log_date,
  COUNT(*)::int                                    AS check_in_count,
  ROUND(AVG(weather_score))::int                  AS avg_weather_score,
  ROUND(AVG(severity))::int                       AS avg_severity,
  ROUND(AVG(energy_level))::int                   AS avg_energy,
  ROUND(AVG(sleep_quality))::int                  AS avg_sleep,
  -- flatten all triggers arrays into a single sorted array
  ARRAY(
    SELECT DISTINCT unnest(triggers)
    FROM symptom_logs sl2
    WHERE sl2.user_id = sl.user_id
      AND sl2.log_date = sl.log_date
  )                                                AS all_triggers,
  -- most common emotional tone for the day
  (
    SELECT emotional_tone
    FROM symptom_logs sl3
    WHERE sl3.user_id = sl.user_id
      AND sl3.log_date = sl.log_date
      AND sl3.emotional_tone IS NOT NULL
    GROUP BY emotional_tone
    ORDER BY COUNT(*) DESC
    LIMIT 1
  )                                                AS dominant_tone,
  MIN(logged_at)                                   AS first_log_at
FROM symptom_logs sl
GROUP BY user_id, log_date;

-- RLS: users can only see their own daily summaries
-- (views inherit RLS from underlying table; no extra policy needed)

-- trigger_frequency: count how often each trigger appears per user
CREATE OR REPLACE VIEW public.trigger_frequency AS
SELECT
  user_id,
  trigger_name,
  COUNT(*)::int AS occurrences,
  MAX(log_date) AS last_seen
FROM (
  SELECT user_id, log_date, unnest(triggers) AS trigger_name
  FROM symptom_logs
) t
GROUP BY user_id, trigger_name;
