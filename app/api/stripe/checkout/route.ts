import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/client';
import {
  PRICE_IDS,
  type BillingCycle,
  type PaidSubscriptionTier,
} from '@/lib/subscription/tiers';

export const runtime = 'nodejs';

function isPaidTier(value: unknown): value is PaidSubscriptionTier {
  return value === 'full_moon' || value === 'aurora';
}

function isBillingCycle(value: unknown): value is BillingCycle {
  return value === 'monthly' || value === 'yearly';
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as { tier?: unknown; cycle?: unknown };
    const tier = body?.tier;
    const cycle = isBillingCycle(body?.cycle) ? body.cycle : 'monthly';

    if (!isPaidTier(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const priceId = PRICE_IDS[tier][cycle];
    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 });
    }

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('stripe_customer_id, name')
      .eq('id', user.id)
      .maybeSingle();

    const stripe = getStripe();
    let customerId = profile?.stripe_customer_id as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: profile?.name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await (supabase as any)
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?upgraded=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        metadata: { supabase_user_id: user.id, tier },
      },
      metadata: { supabase_user_id: user.id, tier, cycle },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe/checkout] error', err);
    return NextResponse.json(
      { error: 'Checkout failed. Please try again.' },
      { status: 500 },
    );
  }
}
