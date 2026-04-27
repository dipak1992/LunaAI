import { createClient } from '@/lib/supabase/server';

/** Maximum voice check-ins allowed per user per day */
const DAILY_LIMIT = 10;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string; // ISO date string for midnight UTC
}

/**
 * Checks whether a user has exceeded their daily voice check-in limit.
 * Uses the symptom_logs table, counting rows where log_date = today.
 */
export async function checkVoiceCheckInRateLimit(userId: string): Promise<RateLimitResult> {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];

  const { count, error } = await (supabase as any)
    .from('symptom_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('log_date', today);

  if (error) {
    // On error, allow the request (fail open)
    console.error('[rate-limit] Error checking rate limit:', error);
    return { allowed: true, remaining: DAILY_LIMIT, resetAt: tomorrow };
  }

  const used = count ?? 0;
  const remaining = Math.max(0, DAILY_LIMIT - used);

  return {
    allowed: remaining > 0,
    remaining,
    resetAt: tomorrow,
  };
}
