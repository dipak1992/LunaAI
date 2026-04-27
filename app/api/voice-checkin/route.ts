import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOpenAIClient } from '@/lib/openai/client';
import {
  SYMPTOM_EXTRACTION_SYSTEM_PROMPT,
  buildExtractionPrompt,
  buildLunaSystemPrompt,
  WHISPER_CONFIG,
  GPT_CONFIG,
  validateExtraction,
} from '@/lib/openai/prompts';
import { checkVoiceCheckInRateLimit } from '@/lib/utils/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60; // seconds

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Rate limit ────────────────────────────────────────────────────────
    const rateLimit = await checkVoiceCheckInRateLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Daily check-in limit reached. Resets at midnight UTC.`,
          resetAt: rateLimit.resetAt,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt,
          },
        },
      );
    }

    // ── Parse multipart form data ─────────────────────────────────────────
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Max 25 MB (Whisper limit)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio file too large (max 25 MB)' }, { status: 400 });
    }

    // ── Fetch user profile ────────────────────────────────────────────────
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('name, menopause_stage')
      .eq('id', user.id)
      .single();

    const userName: string = profile?.name ?? 'friend';
    const menopauseStage: string | null = profile?.menopause_stage ?? null;

    // ── Whisper transcription ─────────────────────────────────────────────
    const openai = getOpenAIClient();

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: WHISPER_CONFIG.model,
      language: WHISPER_CONFIG.language,
      temperature: WHISPER_CONFIG.temperature,
    });

    const transcript = transcription.text.trim();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Could not transcribe audio. Please speak clearly and try again.' },
        { status: 422 },
      );
    }

    // ── GPT-4o symptom extraction ─────────────────────────────────────────
    const completion = await openai.chat.completions.create({
      model: GPT_CONFIG.model,
      temperature: GPT_CONFIG.temperature,
      max_tokens: GPT_CONFIG.max_tokens,
      response_format: GPT_CONFIG.response_format,
      messages: [
        {
          role: 'system',
          content: buildLunaSystemPrompt(userName, menopauseStage),
        },
        {
          role: 'system',
          content: SYMPTOM_EXTRACTION_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: buildExtractionPrompt(transcript, userName),
        },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content ?? '{}';
    const extracted = validateExtraction(JSON.parse(rawContent));

    // ── Persist to Supabase ───────────────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];

    const { data: logRow, error: insertError } = await (supabase as any)
      .from('symptom_logs')
      .insert({
        user_id: user.id,
        log_date: today,
        transcript,
        ai_summary: extracted.ai_summary,
        luna_response: extracted.luna_response,
        weather_score: extracted.weather_score,
        emotional_tone: extracted.emotional_tone,
        triggers: extracted.triggers,
        remedies: extracted.remedies,
        symptoms: extracted.symptoms,
        severity: extracted.severity,
        mood: extracted.mood,
        energy_level: extracted.energy_level,
        sleep_quality: extracted.sleep_quality,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[voice-checkin] Insert error:', insertError);
      // Still return the result even if DB write fails
    }

    return NextResponse.json(
      {
        transcript,
        aiSummary: extracted.ai_summary,
        lunaResponse: extracted.luna_response,
        weatherScore: extracted.weather_score,
        emotionalTone: extracted.emotional_tone,
        triggers: extracted.triggers,
        remedies: extracted.remedies,
        logId: logRow?.id ?? null,
      },
      {
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining - 1),
          'X-RateLimit-Reset': rateLimit.resetAt,
        },
      },
    );
  } catch (err) {
    console.error('[voice-checkin] Unexpected error:', err);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
