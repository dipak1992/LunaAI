import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/client';
import { createServiceClient } from '@/lib/supabase/service';
import { tierFromPriceId } from '@/lib/subscription/tiers';

export const runtime = 'nodejs';

function subscriptionPeriodEnd(subscription: Stripe.Subscription): string | null {
  const periodEnd = subscription.items.data[0]?.current_period_end;
  return typeof periodEnd === 'number' ? new Date(periodEnd * 1000).toISOString() : null;
}

async function findProfileIdByCustomer(customerId: string) {
  const supabase = createServiceClient();
  const { data } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  return data?.id as string | undefined;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[stripe/webhook] signature error', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const supabaseUserId = session.metadata?.supabase_user_id ?? null;

        if (!supabaseUserId || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        const priceId = subscription.items.data[0]?.price.id ?? null;
        const tier = tierFromPriceId(priceId);

        await (supabase as any)
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: subscription.status,
            subscription_id: subscription.id,
            subscription_price_id: priceId,
            subscription_current_period_end: subscriptionPeriodEnd(subscription),
            subscription_cancel_at_period_end: subscription.cancel_at_period_end,
            stripe_customer_id: session.customer as string,
          })
          .eq('id', supabaseUserId);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const profileId = await findProfileIdByCustomer(customerId);

        if (!profileId) break;

        const priceId = subscription.items.data[0]?.price.id ?? null;
        const tier = tierFromPriceId(priceId);
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';

        await (supabase as any)
          .from('profiles')
          .update({
            subscription_tier: isActive ? tier : 'free',
            subscription_status: subscription.status,
            subscription_id: subscription.id,
            subscription_price_id: priceId,
            subscription_current_period_end: subscriptionPeriodEnd(subscription),
            subscription_cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('id', profileId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const profileId = await findProfileIdByCustomer(customerId);

        if (!profileId) break;

        await (supabase as any)
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            subscription_cancel_at_period_end: false,
          })
          .eq('id', profileId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string | null;

        if (!customerId) break;

        const profileId = await findProfileIdByCustomer(customerId);
        if (!profileId) break;

        await (supabase as any)
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('id', profileId);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[stripe/webhook] handler error', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
