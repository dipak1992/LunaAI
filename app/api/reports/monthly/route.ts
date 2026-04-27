import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import SeasonReport from '@/lib/reports/SeasonReport';
import { buildMonthlyReport } from '@/lib/reports/build-report-data';
import { createClient } from '@/lib/supabase/server';
import { TIER_LIMITS, type SubscriptionTier } from '@/lib/subscription/tiers';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const runtime = 'nodejs';
export const maxDuration = 60;

async function canGenerateReports(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', userId)
    .maybeSingle();

  const tier = (data?.subscription_tier as SubscriptionTier | undefined) ?? 'free';
  const status = data?.subscription_status;
  const isActive = status === 'active' || status === 'trialing';

  return isActive && TIER_LIMITS[tier].doctor_reports;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await canGenerateReports(user.id))) {
    return NextResponse.json({ error: 'upgrade_required', feature: 'report' }, { status: 402 });
  }

  const data = await buildMonthlyReport(user.id);
  if (!data) {
    return NextResponse.json(
      {
        error: 'not_enough_data',
        message: 'A season needs a little more time. Keep whispering and your report will bloom.',
      },
      { status: 422 },
    );
  }

  try {
    const buffer = await renderToBuffer(React.createElement(SeasonReport, { data }) as any);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="luna-season-report-${data.period.end}.pdf"`,
        'Cache-Control': 'private, max-age=0, no-store',
      },
    });
  } catch (err) {
    console.error('[reports/monthly] render error', err);
    return NextResponse.json({ error: "Couldn't render your report. Try again." }, { status: 500 });
  }
}
