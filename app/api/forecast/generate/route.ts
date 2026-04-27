import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateForecast } from '@/lib/forecast/generate';
import { canUseForecast } from '@/lib/subscription/usage';

export const runtime = 'nodejs';
export const maxDuration = 45;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await canUseForecast(user.id))) {
      return NextResponse.json(
        {
          error: 'limit_reached',
          message: 'Full Moon unlocks your 7-day forecast.',
        },
        { status: 402 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    // Daily rate limit (4 refreshes per day, unless force=true)
    if (!force) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await (supabase as any)
        .from('forecasts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('generated_at', since);

      if ((count ?? 0) >= 4) {
        return NextResponse.json(
          {
            error:
              "You've refreshed your sky plenty today. Come back tomorrow.",
          },
          { status: 429 },
        );
      }
    }

    const result = await generateForecast(user.id, { force });

    if (!result.ok) {
      if (result.reason === 'insufficient_data') {
        return NextResponse.json(
          {
            error: 'need_more_logs',
            message:
              'Luna needs at least 7 check-ins to read your weather. Keep whispering.',
          },
          { status: 422 },
        );
      }
      return NextResponse.json(
        { error: result.error ?? 'Generation failed' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      cached: result.cached ?? false,
      forecast: result.record,
    });
  } catch (err) {
    console.error('[api/forecast/generate] error', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
