-- ============================================================
-- Anonymous Trial Support
-- Adds is_trial_entry flags for analytics tracking
-- ============================================================

-- Add is_trial flag to symptom_logs for analytics
ALTER TABLE symptom_logs
ADD COLUMN IF NOT EXISTS is_trial_entry boolean DEFAULT false;

-- Add is_trial flag to haikus
ALTER TABLE haikus
ADD COLUMN IF NOT EXISTS is_trial_entry boolean DEFAULT false;

-- RLS: ensure anonymous users can only read/write their own data
-- (already enforced by existing RLS if policies use auth.uid())
-- Verify existing policies work with anonymous users
-- (they should — auth.uid() returns the anon user's UUID)

-- Cron job placeholder: delete anonymous users older than 30 days with no conversion
-- TODO: Set up pg_cron or edge function for cleanup:
-- DELETE FROM auth.users WHERE is_anonymous = true AND created_at < NOW() - INTERVAL '30 days';
