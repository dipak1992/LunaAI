import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOpenAIClient } from '@/lib/openai/client';

export const runtime = 'nodejs';

interface RecapLog {
  log_date: string;
  weather_score: number | null;
  mood: string | null;
  sleep_quality: number | null;
  energy_level: number | null;
  severity: number | null;
  triggers: string[] | null;
  ai_summary: string | null;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 6);
  const from = fromDate.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('symptom_logs')
    .select('log_date, weather_score, mood, sleep_quality, energy_level, severity, triggers, ai_summary')
    .eq('user_id', user.id)
    .gte('log_date', from)
    .order('log_date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const logs = (data as RecapLog[] | null) ?? [];
  if (logs.length === 0) {
    return NextResponse.json({
      recap: 'No weekly recap yet. A few check-ins this week will give Luna something grounded to summarize.',
      grounded: false,
    });
  }

  const compactLogs = logs.map((log) => ({
    date: log.log_date,
    weather: log.weather_score,
    mood: log.mood,
    sleep: log.sleep_quality,
    energy: log.energy_level,
    severity: log.severity,
    triggers: log.triggers ?? [],
    summary: log.ai_summary,
  }));

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 220,
      messages: [
        {
          role: 'system',
          content: 'You write concise, kind weekly menopause support recaps grounded only in provided logs. No medical diagnosis. Use 3 short bullets: noticed, support, next check-in focus.',
        },
        {
          role: 'user',
          content: JSON.stringify(compactLogs),
        },
      ],
    });

    return NextResponse.json({
      recap: completion.choices[0]?.message?.content?.trim() ?? fallbackRecap(logs),
      grounded: true,
    });
  } catch (err) {
    console.error('[weekly-recap] AI recap failed:', err);
    return NextResponse.json({
      recap: fallbackRecap(logs),
      grounded: true,
    });
  }
}

function fallbackRecap(logs: RecapLog[]): string {
  const latest = logs[logs.length - 1];
  const triggers = [...new Set(logs.flatMap((log) => log.triggers ?? []))].slice(0, 3);
  return [
    `Noticed: ${logs.length} check-in${logs.length === 1 ? '' : 's'} this week${latest?.mood ? `, with ${latest.mood} showing most recently` : ''}.`,
    `Support: ${triggers.length ? `keep an eye on ${triggers.join(', ')}` : 'keep logging sleep, energy, and symptom severity'}.`,
    'Next check-in focus: what helped, what changed, and what you want Luna to remember.',
  ].join('\n');
}
