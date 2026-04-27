-- ============================================================
-- Phase 8: Insights & History
-- Step 1: Ensure all Phase 5 columns exist (idempotent)
-- ============================================================
ALTER TABLE public.symptom_logs
  ADD COLUMN IF NOT EXISTS log_date       date     NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS transcript     text,
  ADD COLUMN IF NOT EXISTS ai_summary     text,
  ADD COLUMN IF NOT EXISTS luna_response  text,
  ADD COLUMN IF NOT EXISTS weather_score  smallint,
  ADD COLUMN IF NOT EXISTS emotional_tone text,
  ADD COLUMN IF NOT EXISTS triggers       jsonb    DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS remedies       jsonb    DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS energy_level   smallint,
  ADD COLUMN IF NOT EXISTS sleep_quality  smallint,
  ADD COLUMN IF NOT EXISTS severity       smallint,
  ADD COLUMN IF NOT EXISTS mood           text,
  ADD COLUMN IF NOT EXISTS notes          text;

-- ============================================================
-- Step 2: daily_summaries view
-- triggers is jsonb, so use jsonb_array_elements_text()
-- ============================================================
CREATE OR REPLACE VIEW public.daily_summaries AS
SELECT
  user_id,
  log_date,
  COUNT(*)::int                   AS check_in_count,
  ROUND(AVG(weather_score))::int  AS avg_weather_score,
  ROUND(AVG(severity))::int       AS avg_severity,
  ROUND(AVG(energy_level))::int   AS avg_energy,
  ROUND(AVG(sleep_quality))::int  AS avg_sleep,
  ARRAY(
    SELECT DISTINCT t.val
    FROM symptom_logs sl2,
         jsonb_array_elements_text(
           CASE jsonb_typeof(sl2.triggers)
             WHEN 'array' THEN sl2.triggers
             ELSE '[]'::jsonb
           END
         ) AS t(val)
    WHERE sl2.user_id = sl.user_id
      AND sl2.log_date = sl.log_date
  )                               AS all_triggers,
  (
    SELECT emotional_tone
    FROM symptom_logs sl3
    WHERE sl3.user_id = sl.user_id
      AND sl3.log_date = sl.log_date
      AND sl3.emotional_tone IS NOT NULL
    GROUP BY emotional_tone
    ORDER BY COUNT(*) DESC
    LIMIT 1
  )                               AS dominant_tone,
  MIN(logged_at)                  AS first_log_at
FROM symptom_logs sl
GROUP BY user_id, log_date;

-- ============================================================
-- Step 3: trigger_frequency view
-- ============================================================
CREATE OR REPLACE VIEW public.trigger_frequency AS
SELECT
  user_id,
  trigger_name,
  COUNT(*)::int AS occurrences,
  MAX(log_date) AS last_seen
FROM (
  SELECT
    user_id,
    log_date,
    t.val AS trigger_name
  FROM symptom_logs,
       jsonb_array_elements_text(
         CASE jsonb_typeof(triggers)
           WHEN 'array' THEN triggers
           ELSE '[]'::jsonb
         END
       ) AS t(val)
) sub
GROUP BY user_id, trigger_name;
