export type SubscriptionTier = 'free' | 'full_moon' | 'aurora';
export type PaidSubscriptionTier = Exclude<SubscriptionTier, 'free'>;
export type BillingCycle = 'monthly' | 'yearly';

export interface TierLimits {
  checkins_per_week: number | null;
  chat_messages_per_day: number | null;
  forecast_enabled: boolean;
  long_term_memory: boolean;
  doctor_reports: boolean;
  priority_support: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    checkins_per_week: 3,
    chat_messages_per_day: 10,
    forecast_enabled: false,
    long_term_memory: false,
    doctor_reports: false,
    priority_support: false,
  },
  full_moon: {
    checkins_per_week: null,
    chat_messages_per_day: null,
    forecast_enabled: true,
    long_term_memory: true,
    doctor_reports: false,
    priority_support: false,
  },
  aurora: {
    checkins_per_week: null,
    chat_messages_per_day: null,
    forecast_enabled: true,
    long_term_memory: true,
    doctor_reports: true,
    priority_support: true,
  },
};

export const PRICE_IDS: Record<PaidSubscriptionTier, Record<BillingCycle, string>> = {
  full_moon: {
    monthly: process.env.STRIPE_PRICE_FULLMOON_MONTHLY ?? '',
    yearly: process.env.STRIPE_PRICE_FULLMOON_YEARLY ?? '',
  },
  aurora: {
    monthly: process.env.STRIPE_PRICE_AURORA_MONTHLY ?? '',
    yearly: process.env.STRIPE_PRICE_AURORA_YEARLY ?? '',
  },
};

export function tierFromPriceId(priceId: string | null): SubscriptionTier {
  if (!priceId) return 'free';

  if (
    priceId === PRICE_IDS.full_moon.monthly ||
    priceId === PRICE_IDS.full_moon.yearly
  ) {
    return 'full_moon';
  }

  if (priceId === PRICE_IDS.aurora.monthly || priceId === PRICE_IDS.aurora.yearly) {
    return 'aurora';
  }

  return 'free';
}
