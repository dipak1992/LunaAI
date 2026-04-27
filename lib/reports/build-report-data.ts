import { z } from 'zod';
import { getOpenAIClient } from '@/lib/openai/client';
import { createClient } from '@/lib/supabase/server';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ReportData {
  userName: string;
  period: { start: string; end: string; label: string };
  stats: {
    total_checkins: number;
    avg_storm: number;
    highest_storm_day: string | null;
    calmest_day: string | null;
  };
  trend: Array<{ date: string; storm: number }>;
  top_symptoms: Array<{ name: string; count: number }>;
  top_triggers: string[];
  what_worked: string[];
  doctor_questions: string[];
  haiku: string[] | null;
  narrative: string;
}

const NarrativeSchema = z.object({
  narrative: z.string().default(''),
  top_triggers: z.array(z.string()).default([]),
  what_worked: z.array(z.string()).default([]),
  doctor_questions: z.array(z.string()).default([]),
});

function dateOnly(value: Date | string): string {
  return new Date(value).toISOString().split('T')[0];
}

function formatPeriod(start: Date, end: Date): string {
  return `${start.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })} - ${end.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

function extractSymptomNames(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'name' in item) {
          return String((item as { name?: unknown }).name ?? '');
        }
        if (item && typeof item === 'object' && 'symptom' in item) {
          return String((item as { symptom?: unknown }).symptom ?? '');
        }
        return '';
      })
      .filter(Boolean);
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, score]) => score !== false && score !== null && score !== undefined)
      .map(([name]) => name);
  }

  if (typeof value === 'string') return [value];
  return [];
}

export async function buildMonthlyReport(userId: string): Promise<ReportData | null> {
  const supabase = await createClient();
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  const [profileRes, logsRes, haikuRes] = await Promise.all([
    (supabase as any).from('profiles').select('name').eq('id', userId).maybeSingle(),
    (supabase as any)
      .from('symptom_logs')
      .select(
        'created_at, log_date, symptoms, severity, weather_score, notes, mood, triggers, remedies, emotional_tone',
      )
      .eq('user_id', userId)
      .gte('created_at', start.toISOString())
      .order('created_at', { ascending: true }),
    (supabase as any)
      .from('haikus')
      .select('lines, haiku_date')
      .eq('user_id', userId)
      .gte('haiku_date', dateOnly(start))
      .order('haiku_date', { ascending: false })
      .limit(1),
  ]);

  const logs = logsRes.data ?? [];
  if (logs.length === 0) return null;

  const byDay = new Map<string, number[]>();
  const symptomCounts = new Map<string, number>();
  const triggerCounts = new Map<string, number>();
  const remedyCounts = new Map<string, number>();

  for (const log of logs) {
    const day = log.log_date ?? dateOnly(log.created_at);
    const storm = log.weather_score ?? log.severity ?? 0;
    byDay.set(day, [...(byDay.get(day) ?? []), storm]);

    for (const symptom of extractSymptomNames(log.symptoms)) {
      symptomCounts.set(symptom, (symptomCounts.get(symptom) ?? 0) + 1);
    }

    for (const trigger of log.triggers ?? []) {
      triggerCounts.set(trigger, (triggerCounts.get(trigger) ?? 0) + 1);
    }

    for (const remedy of log.remedies ?? []) {
      remedyCounts.set(remedy, (remedyCounts.get(remedy) ?? 0) + 1);
    }
  }

  const trend = Array.from(byDay.entries())
    .map(([date, values]) => ({
      date,
      storm: values.reduce((sum, value) => sum + value, 0) / values.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const avgStorm =
    trend.reduce((sum, entry) => sum + entry.storm, 0) / Math.max(1, trend.length);
  const highestDay = trend.reduce(
    (winner, entry) => (entry.storm > (winner?.storm ?? -1) ? entry : winner),
    trend[0],
  );
  const calmestDay = trend.reduce(
    (winner, entry) => (entry.storm < (winner?.storm ?? 999) ? entry : winner),
    trend[0],
  );

  const topSymptoms = Array.from(symptomCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const fallbackTriggers = Array.from(triggerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  const fallbackRemedies = Array.from(remedyCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name]) => name);

  const logsText = logs
    .slice(-30)
    .map((log: any) => {
      const day = log.log_date ?? dateOnly(log.created_at);
      const symptoms = extractSymptomNames(log.symptoms).join(', ');
      return `${day}: ${symptoms || log.mood || 'check-in'} ${log.severity ?? ''} ${
        log.weather_score != null ? `weather ${log.weather_score}/10` : ''
      } ${log.notes ?? ''} ${(log.triggers ?? []).join(', ')}`.trim();
    })
    .join('\n');

  let analysis = {
    narrative: '',
    top_triggers: fallbackTriggers,
    what_worked: fallbackRemedies,
    doctor_questions: [] as string[],
  };

  try {
    const openai = getOpenAIClient();
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are Luna, summarizing a woman's 30-day menopause journey for a monthly report.
Return JSON: { "narrative": "2-3 paragraphs of warm, specific reflection, weather metaphors, written to her", "top_triggers": ["..."], "what_worked": ["..."], "doctor_questions": ["..."] }
- narrative: lyrical, personal, no more than 180 words
- top_triggers: 3-5 items grounded in the data
- what_worked: 2-4 specific soothing patterns
- doctor_questions: 4-6 clinician-ready questions she could bring to her doctor
Never prescribe. Never diagnose.`,
        },
        { role: 'user', content: `Her last 30 days:\n${logsText}` },
      ],
    });

    const parsed = NarrativeSchema.parse(JSON.parse(res.choices[0]?.message?.content ?? '{}'));
    analysis = {
      narrative: parsed.narrative,
      top_triggers: parsed.top_triggers.length ? parsed.top_triggers : fallbackTriggers,
      what_worked: parsed.what_worked.length ? parsed.what_worked : fallbackRemedies,
      doctor_questions: parsed.doctor_questions,
    };
  } catch (err) {
    console.error('[report] narrative error', err);
    analysis.narrative =
      'This month, your sky shifted in its own rhythm. Each day held its weather, some bright and some heavy, and you met them whisper by whisper.';
  }

  return {
    userName: profileRes.data?.name ?? 'friend',
    period: {
      start: dateOnly(start),
      end: dateOnly(end),
      label: formatPeriod(start, end),
    },
    stats: {
      total_checkins: logs.length,
      avg_storm: Number(avgStorm.toFixed(1)),
      highest_storm_day: highestDay?.date ?? null,
      calmest_day: calmestDay?.date ?? null,
    },
    trend,
    top_symptoms: topSymptoms,
    top_triggers: analysis.top_triggers,
    what_worked: analysis.what_worked,
    doctor_questions: analysis.doctor_questions,
    haiku: haikuRes.data?.[0]?.lines ?? null,
    narrative: analysis.narrative,
  };
}
