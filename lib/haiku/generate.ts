import { z } from 'zod';
import { getOpenAIClient } from '@/lib/openai/client';
import { createClient } from '@/lib/supabase/server';

/* eslint-disable @typescript-eslint/no-explicit-any */

const HaikuSchema = z.object({
  lines: z.array(z.string()).length(3),
  mood: z.string().optional(),
});

export interface HaikuRecord {
  id: string;
  haiku_date: string;
  lines: string[];
  mood: string | null;
  saved: boolean;
  created_at: string;
}

function todayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export async function getOrGenerateTodayHaiku(
  userId: string,
): Promise<{ ok: boolean; haiku?: HaikuRecord; error?: string }> {
  const supabase = await createClient();
  const today = todayDate();

  const { data: existing } = await (supabase as any)
    .from('haikus')
    .select('*')
    .eq('user_id', userId)
    .eq('haiku_date', today)
    .maybeSingle();

  if (existing) {
    return { ok: true, haiku: existing as HaikuRecord };
  }

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const [profileRes, symptomsRes] = await Promise.all([
    (supabase as any).from('profiles').select('name').eq('id', userId).maybeSingle(),
    (supabase as any)
      .from('symptom_logs')
      .select('created_at, mood, severity, notes, weather_score, emotional_tone, triggers')
      .eq('user_id', userId)
      .gte('created_at', threeDaysAgo)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const name = profileRes.data?.name ?? 'friend';
  const logs = symptomsRes.data ?? [];
  const contextLines =
    logs.length === 0
      ? "She has not shared much yet. Write something gentle and open."
      : logs
          .map((log: any) => {
            const parts = [
              log.mood,
              log.emotional_tone,
              log.weather_score != null ? `weather ${log.weather_score}/10` : null,
              log.severity != null ? `intensity ${log.severity}/10` : null,
              Array.isArray(log.triggers) && log.triggers.length
                ? `triggers: ${log.triggers.join(', ')}`
                : null,
              log.notes,
            ].filter(Boolean);

            return `- ${parts.join(' | ')}`;
          })
          .join('\n');

  try {
    const openai = getOpenAIClient();
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.95,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are Luna, writing a daily haiku for ${name}.
A haiku is 3 lines. Aim for a 5-7-5 syllable pattern.
Write soft, poetic English about her emotional weather, specific to what she has felt lately.
Use nature, moon, weather, tide, or bloom imagery.
Avoid cliches. Avoid em dashes. Avoid punctuation at line ends unless needed.
Return JSON: { "lines": ["line 1", "line 2", "line 3"], "mood": "one word mood" }`,
        },
        {
          role: 'user',
          content: `Her recent days:\n${contextLines}\n\nWrite today's haiku.`,
        },
      ],
    });

    const raw = res.choices[0]?.message?.content ?? '{}';
    const parsed = HaikuSchema.parse(JSON.parse(raw));
    const { data: saved, error } = await (supabase as any)
      .from('haikus')
      .insert({
        user_id: userId,
        haiku_date: today,
        lines: parsed.lines,
        mood: parsed.mood ?? null,
      })
      .select('*')
      .single();

    if (error || !saved) {
      const { data: refetch } = await (supabase as any)
        .from('haikus')
        .select('*')
        .eq('user_id', userId)
        .eq('haiku_date', today)
        .maybeSingle();

      if (refetch) return { ok: true, haiku: refetch as HaikuRecord };
      return { ok: false, error: error?.message ?? 'Save failed' };
    }

    return { ok: true, haiku: saved as HaikuRecord };
  } catch (err) {
    console.error('[haiku] generate error', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Generation failed',
    };
  }
}
