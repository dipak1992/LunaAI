import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLatestForecast } from '@/lib/forecast/generate';
import { canUseForecast } from '@/lib/subscription/usage';

export const runtime = 'nodejs';

export async function GET() {
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

  const forecast = await getLatestForecast(user.id);

  // Count total logs so the client knows if we need more data
  const { count } = await (supabase as any)
    .from('symptom_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return NextResponse.json({
    forecast,
    log_count: count ?? 0,
    min_required: 7,
  });
}
