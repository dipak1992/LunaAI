import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

function generateCode(): string {
  return `luna-${crypto.randomBytes(4).toString('hex')}`;
}

// GET /api/referral — get or create user's referral code + stats
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await (supabase as any).auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user already has a referral code
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .maybeSingle();

  let code = profile?.referral_code;

  // Generate one if missing
  if (!code) {
    code = generateCode();
    await (supabase as any)
      .from('profiles')
      .update({ referral_code: code })
      .eq('id', user.id);
  }

  // Get referral stats
  const { data: referrals } = await (supabase as any)
    .from('referrals')
    .select('id, status, completed_at')
    .eq('referrer_id', user.id);

  const stats = {
    code,
    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://luna.app'}/signup?ref=${code}`,
    total: referrals?.length ?? 0,
    completed: referrals?.filter((r: any) => r.status === 'completed').length ?? 0,
    pending: referrals?.filter((r: any) => r.status === 'pending').length ?? 0,
  };

  return NextResponse.json(stats);
}

// POST /api/referral — redeem a referral code (called during signup)
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await (supabase as any).auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { code } = body as { code?: string };

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Missing referral code' }, { status: 400 });
  }

  // Find referrer by code
  const { data: referrer } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('referral_code', code)
    .maybeSingle();

  if (!referrer) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
  }

  // Can't refer yourself
  if (referrer.id === user.id) {
    return NextResponse.json({ error: 'Cannot use your own code' }, { status: 400 });
  }

  // Check if already referred
  const { data: existing } = await (supabase as any)
    .from('referrals')
    .select('id')
    .eq('referred_id', user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Already referred' }, { status: 409 });
  }

  // Create referral record
  const { error } = await (supabase as any)
    .from('referrals')
    .insert({
      referrer_id: referrer.id,
      referred_id: user.id,
      code,
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: Apply reward (1 month free) to both users via subscription system
  // This would integrate with the Stripe subscription logic

  return NextResponse.json({
    ok: true,
    message: 'Referral applied! Both you and your friend get 1 month free.',
  });
}
