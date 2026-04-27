import { createClient } from '@/lib/supabase/server';
import { TIER_LIMITS, type SubscriptionTier } from './tiers';

export type UsageKind = 'checkin' | 'chat_message';

export interface UsageCheck {
  allowed: boolean;
  tier: SubscriptionTier;
  used: number;
  limit: number | null;
  period: 'week' | 'day';
  reason?: 'limit_reached';
}

export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', userId)
    .maybeSingle();

  const tier = (data?.subscription_tier as SubscriptionTier | undefined) ?? 'free';
  const status = data?.subscription_status;

  if (tier !== 'free' && status !== 'active' && status !== 'trialing') {
    return 'free';
  }

  return tier;
}

function weekStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

function dayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function countUsage(userId: string, kind: UsageKind, since: Date): Promise<number> {
  const supabase = await createClient();
  const { count } = await (supabase as any)
    .from('usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('kind', kind)
    .gte('created_at', since.toISOString());

  return count ?? 0;
}

export async function checkCheckinUsage(userId: string): Promise<UsageCheck> {
  const tier = await getUserSubscriptionTier(userId);
  const limit = TIER_LIMITS[tier].checkins_per_week;

  if (limit === null) {
    return { allowed: true, tier, used: 0, limit: null, period: 'week' };
  }

  const used = await countUsage(userId, 'checkin', weekStart());
  const allowed = used < limit;

  return {
    allowed,
    tier,
    used,
    limit,
    period: 'week',
    reason: allowed ? undefined : 'limit_reached',
  };
}

export async function checkChatUsage(userId: string): Promise<UsageCheck> {
  const tier = await getUserSubscriptionTier(userId);
  const limit = TIER_LIMITS[tier].chat_messages_per_day;

  if (limit === null) {
    return { allowed: true, tier, used: 0, limit: null, period: 'day' };
  }

  const used = await countUsage(userId, 'chat_message', dayStart());
  const allowed = used < limit;

  return {
    allowed,
    tier,
    used,
    limit,
    period: 'day',
    reason: allowed ? undefined : 'limit_reached',
  };
}

export async function recordUsage(userId: string, kind: UsageKind): Promise<void> {
  const supabase = await createClient();
  const { error } = await (supabase as any).from('usage_events').insert({ user_id: userId, kind });

  if (error) {
    console.error('[usage] record error', error);
  }
}

export async function getUsageSummary(userId: string) {
  const [checkin, chat] = await Promise.all([
    checkCheckinUsage(userId),
    checkChatUsage(userId),
  ]);

  return { checkin, chat };
}

export async function canUseForecast(userId: string): Promise<boolean> {
  const tier = await getUserSubscriptionTier(userId);
  return TIER_LIMITS[tier].forecast_enabled;
}
