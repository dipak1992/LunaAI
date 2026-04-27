import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import type { ForecastPayload, ForecastDay, ForecastRecord } from './types';
import { z } from 'zod';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CACHE_HOURS = 6;
const MIN_LOGS_REQUIRED = 7;

const DaySchema = z.object({
  date: z.string(),
  day_name: z.string().optional(),
  storm_level: z.number().min(1).max(10),
  likely_symptoms: z.array(z.string()).default([]),
  preparation_tips: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.5),
  summary: z.string().default(''),
});

const PayloadSchema = z.object({
  forecast: z.array(DaySchema).length(7),
  patterns_detected: z.array(z.string()).default([]),
  biggest_trigger: z.string().nullable().default(null),
});

function buildPrompt(
  logs: Array<{
    created_at: string;
    symptom?: string | null;
    severity?: number | null;
    note?: string | null;
    weather_score?: number | null;
    mood?: string | null;
  }>,
  startDates: string[],
): string {
  const formattedLogs = logs
    .map((l) => {
      const d = new Date(l.created_at).toISOString().split('T')[0];
      const parts = [
        `date: ${d}`,
        l.symptom && `symptom: ${l.symptom}`,
        l.severity != null && `severity: ${l.severity}/10`,
        l.weather_score != null && `storm: ${l.weather_score}/10`,
        l.mood && `mood: ${l.mood}`,
        l.note && `note: "${l.note}"`,
      ].filter(Boolean);
      return parts.join(' | ');
    })
    .join('\n');

  return `Analyze this user's 30-day symptom history. Identify:
1. Cyclical patterns (weekly/monthly)
2. Trigger correlations (sleep, stress, food mentions)
3. Symptom clusters

Predict the next 7 days with confidence scores. Be specific and personalized based on THEIR patterns.

The 7 forecast dates (in order) must be EXACTLY:
${startDates.map((d, i) => `  Day ${i + 1}: ${d}`).join('\n')}

For each day also include a "day_name" (e.g., "Monday") and a short poetic "summary" (≤12 words) using gentle weather/seasonal metaphors.

storm_level scale (1-10):
  1-2 = clear skies (feels easy)
  3-4 = partly cloudy
  5-6 = overcast
  7-8 = rain/storm likely
  9-10 = thunder (prepare carefully)

preparation_tips: 2-3 per day, SHORT, actionable, warm (e.g. "hydrate before noon", "cool bedroom tonight"). No medical advice.

Return ONLY valid JSON matching this schema:
{
  "forecast": [
    {
      "date": "YYYY-MM-DD",
      "day_name": "Monday",
      "storm_level": 1-10,
      "likely_symptoms": ["..."],
      "preparation_tips": ["..."],
      "confidence": 0.0-1.0,
      "summary": "..."
    }
  ],
  "patterns_detected": ["..."],
  "biggest_trigger": "..." or null
}

SYMPTOM HISTORY:
${formattedLogs || '(no logs found)'}`;
}

function next7Dates(): string[] {
  const out: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    out.push(d.toISOString().split('T')[0]);
  }
  return out;
}

function dayNameFromDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
  });
}

export interface GenerateOptions {
  force?: boolean;
}

export interface GenerateResult {
  ok: boolean;
  cached?: boolean;
  reason?: 'insufficient_data' | 'cache_hit' | 'error';
  record?: ForecastRecord;
  error?: string;
}

export async function generateForecast(
  userId: string,
  opts: GenerateOptions = {},
): Promise<GenerateResult> {
  const supabase = await createClient();

  // 1. Cache check
  if (!opts.force) {
    const { data: latest } = await (supabase as any)
      .from('forecasts')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest) {
      const ageHours =
        (Date.now() - new Date(latest.generated_at).getTime()) / 36e5;
      if (ageHours < CACHE_HOURS) {
        return {
          ok: true,
          cached: true,
          reason: 'cache_hit',
          record: {
            id: latest.id,
            generated_at: latest.generated_at,
            forecast: latest.forecast,
            patterns_detected: latest.patterns_detected ?? [],
            biggest_trigger: latest.biggest_trigger ?? null,
            source_log_count: latest.source_log_count ?? 0,
          },
        };
      }
    }
  }

  // 2. Fetch last 30 days of logs
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: logs, error: logsErr } = await (supabase as any)
    .from('symptom_logs')
    .select('created_at, mood, severity, notes, weather_score')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: true });

  if (logsErr) {
    return { ok: false, reason: 'error', error: logsErr.message };
  }

  if (!logs || logs.length < MIN_LOGS_REQUIRED) {
    return { ok: false, reason: 'insufficient_data' };
  }

  // 3. Call GPT-4o
  const dates = next7Dates();
  const prompt = buildPrompt(
    logs.map((l: any) => ({
      created_at: l.created_at,
      symptom: l.mood,
      severity: l.severity,
      note: l.notes,
      weather_score: l.weather_score,
      mood: l.mood,
    })),
    dates,
  );

  let parsed: ForecastPayload;
  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            "You are Luna's forecasting engine. You analyze menopause symptom patterns and return strict JSON forecasts. Be specific, warm, personalized. Never prescribe medication.",
        },
        { role: 'user', content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const json = JSON.parse(raw);
    const validated = PayloadSchema.parse(json);

    // Normalize days: ensure correct date order + day_name
    const normalizedDays: ForecastDay[] = dates.map((date, i) => {
      const src =
        validated.forecast[i] ??
        validated.forecast.find((d) => d.date === date);
      return {
        date,
        day_name: src?.day_name || dayNameFromDate(date),
        storm_level: Math.max(1, Math.min(10, Math.round(src?.storm_level ?? 3))),
        likely_symptoms: src?.likely_symptoms ?? [],
        preparation_tips: src?.preparation_tips ?? [],
        confidence: src?.confidence ?? 0.5,
        summary: src?.summary ?? '',
      };
    });

    parsed = {
      forecast: normalizedDays,
      patterns_detected: validated.patterns_detected,
      biggest_trigger: validated.biggest_trigger,
    };
  } catch (err) {
    console.error('[forecast] GPT parse error', err);
    return {
      ok: false,
      reason: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }

  // 4. Persist
  const { data: saved, error: saveErr } = await (supabase as any)
    .from('forecasts')
    .insert({
      user_id: userId,
      forecast: parsed.forecast,
      patterns_detected: parsed.patterns_detected,
      biggest_trigger: parsed.biggest_trigger,
      source_log_count: logs.length,
    })
    .select('*')
    .single();

  if (saveErr || !saved) {
    return {
      ok: false,
      reason: 'error',
      error: saveErr?.message ?? 'Save failed',
    };
  }

  return {
    ok: true,
    cached: false,
    record: {
      id: saved.id,
      generated_at: saved.generated_at,
      forecast: saved.forecast,
      patterns_detected: saved.patterns_detected ?? [],
      biggest_trigger: saved.biggest_trigger ?? null,
      source_log_count: saved.source_log_count ?? 0,
    },
  };
}

export async function getLatestForecast(
  userId: string,
): Promise<ForecastRecord | null> {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('forecasts')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    generated_at: data.generated_at,
    forecast: data.forecast,
    patterns_detected: data.patterns_detected ?? [],
    biggest_trigger: data.biggest_trigger ?? null,
    source_log_count: data.source_log_count ?? 0,
  };
}
