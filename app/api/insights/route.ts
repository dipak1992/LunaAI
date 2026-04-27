import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { InsightsPayload, DaySummary, TriggerFrequency } from '@/types/insights';

export const runtime = 'nodejs';

// GET /api/insights?days=90
export async function GET(req: Request) {
  const supabase = await createClient();

  // ── Auth ──────────────────────────────────────────────────────────────────
  const { data: { user }, error: authError } = await (supabase as any).auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const daysBack = Math.min(parseInt(url.searchParams.get('days') ?? '90', 10), 365);

  const toDate   = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - daysBack + 1);

  const from = fromDate.toISOString().slice(0, 10);
  const to   = toDate.toISOString().slice(0, 10);

  // ── Fetch daily summaries ─────────────────────────────────────────────────
  // We query symptom_logs directly (views may not be available yet)
  const { data: rawLogs, error: logsError } = await (supabase as any)
    .from('symptom_logs')
    .select(
      'log_date, weather_score, severity, energy_level, sleep_quality, triggers, emotional_tone, logged_at'
    )
    .eq('user_id', user.id)
    .gte('log_date', from)
    .lte('log_date', to)
    .order('log_date', { ascending: true });

  if (logsError) {
    return NextResponse.json({ error: logsError.message }, { status: 500 });
  }

  const logs: Array<{
    log_date: string;
    weather_score: number | null;
    severity: number | null;
    energy_level: number | null;
    sleep_quality: number | null;
    triggers: string[] | null;   // jsonb array — Supabase deserialises to JS array
    emotional_tone: string | null;
    logged_at: string;
  }> = rawLogs ?? [];

  // ── Aggregate into DaySummary[] ───────────────────────────────────────────
  const byDate = new Map<string, typeof logs>();
  for (const log of logs) {
    const arr = byDate.get(log.log_date) ?? [];
    arr.push(log);
    byDate.set(log.log_date, arr);
  }

  const days: DaySummary[] = [];
  for (const [date, entries] of byDate) {
    const n = entries.length;
    const avg = (vals: (number | null)[]) => {
      const valid = vals.filter((v): v is number => v !== null);
      return valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : null;
    };

    // dominant tone
    const toneCounts = new Map<string, number>();
    for (const e of entries) {
      if (e.emotional_tone) {
        toneCounts.set(e.emotional_tone, (toneCounts.get(e.emotional_tone) ?? 0) + 1);
      }
    }
    let dominantTone: string | null = null;
    let maxCount = 0;
    for (const [tone, count] of toneCounts) {
      if (count > maxCount) { maxCount = count; dominantTone = tone; }
    }

    // all triggers (unique)
    const allTriggers = [...new Set(entries.flatMap(e => e.triggers ?? []))];

    days.push({
      log_date:          date,
      check_in_count:    n,
      avg_weather_score: avg(entries.map(e => e.weather_score)),
      avg_severity:      avg(entries.map(e => e.severity)),
      avg_energy:        avg(entries.map(e => e.energy_level)),
      avg_sleep:         avg(entries.map(e => e.sleep_quality)),
      all_triggers:      allTriggers,
      dominant_tone:     dominantTone,
      first_log_at:      entries[0].logged_at,
    });
  }

  // ── Trigger frequency ─────────────────────────────────────────────────────
  const triggerMap = new Map<string, { count: number; last: string }>();
  for (const log of logs) {
    for (const t of log.triggers ?? []) {
      const existing = triggerMap.get(t);
      if (!existing || log.log_date > existing.last) {
        triggerMap.set(t, {
          count: (existing?.count ?? 0) + 1,
          last:  log.log_date,
        });
      } else {
        triggerMap.set(t, { count: existing.count + 1, last: existing.last });
      }
    }
  }

  const triggers: TriggerFrequency[] = [...triggerMap.entries()]
    .map(([name, { count, last }]) => ({
      trigger_name: name,
      occurrences:  count,
      last_seen:    last,
    }))
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 15);

  // ── Streak calculation ────────────────────────────────────────────────────
  const logDates = new Set(logs.map(l => l.log_date));
  let streak = 0;
  const cursor = new Date();
  // allow today or yesterday as the start of a streak
  while (true) {
    const d = cursor.toISOString().slice(0, 10);
    if (logDates.has(d)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  const payload: InsightsPayload = {
    days,
    triggers,
    streak,
    total_check_ins: logs.length,
    date_range: { from, to },
  };

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'private, max-age=300' },
  });
}
