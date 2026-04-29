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
import { scheduleMemoryExtraction } from '@/lib/memory/pinecone';
import { scheduleForecastRefresh } from '@/lib/forecast/trigger-after-checkin';
import { checkCheckinUsage, recordUsage } from '@/lib/subscription/usage';
import { crisisResponse, detectCrisis } from '@/lib/safety/crisis-detection';
import { logCrisisEvent } from '@/lib/safety/log-crisis';

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

    // ── Subscription usage limit ──────────────────────────────────────────
    const usage = await checkCheckinUsage(user.id);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: 'limit_reached',
          message: "You've used this week's check-ins. Unlock unlimited with Full Moon.",
          usage,
        },
        { status: 402 },
      );
    }

    // ── Fetch user profile ────────────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, menopause_stage')
      .eq('id', user.id)
      .single();

    const userName: string = profile?.name ?? 'friend';
    const menopauseStage: string | null = profile?.menopause_stage ?? null;

    const openai = getOpenAIClient();
    const contentType = req.headers.get('content-type') ?? '';
    let transcript = '';

    if (contentType.includes('application/json')) {
      const body = (await req.json()) as { text?: string; quickTags?: string[] };
      const text = body.text?.trim();
      const tags = Array.isArray(body.quickTags) ? body.quickTags.filter(Boolean) : [];
      transcript = [text, tags.length ? `Quick check-in tags: ${tags.join(', ')}` : '']
        .filter(Boolean)
        .join('\n\n')
        .trim();
    } else {
      // ── Parse multipart form data ───────────────────────────────────────
      const formData = await req.formData();
      const audioFile = formData.get('audio') as File | null;

      if (!audioFile || audioFile.size === 0) {
        return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
      }

      // Max 25 MB (Whisper limit)
      if (audioFile.size > 25 * 1024 * 1024) {
        return NextResponse.json({ error: 'Audio file too large (max 25 MB)' }, { status: 400 });
      }

      // ── Whisper transcription ───────────────────────────────────────────
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: WHISPER_CONFIG.model,
        language: WHISPER_CONFIG.language,
        temperature: WHISPER_CONFIG.temperature,
      });

      transcript = transcription.text.trim();
    }

    if (!transcript) {
      return NextResponse.json(
        { error: 'Please share a few words or choose a quick check-in tag.' },
        { status: 422 },
      );
    }

    const assessment = detectCrisis(transcript);
    if (assessment.level !== 'none') {
      await logCrisisEvent({
        user_id: user.id,
        level: assessment.level,
        category: assessment.category,
        matched_terms: assessment.matched_terms,
        message_preview: transcript,
        source: 'checkin',
      });

      return NextResponse.json({
        ok: true,
        crisis: {
          level: assessment.level,
          message: crisisResponse(assessment),
        },
      });
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

    const { data: logRow, error: insertError } = await supabase
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
    } else {
      await recordUsage(user.id, 'checkin');
    }

    // Fire-and-forget: extract durable memories from transcript
    const memoryText = [transcript, extracted.ai_summary].filter(Boolean).join('. ');
    if (memoryText.trim().length > 10) {
      scheduleMemoryExtraction(user.id, memoryText, 'checkin');
    }

    // Fire-and-forget: refresh 7-day forecast
    scheduleForecastRefresh(user.id);

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
    );
  } catch (err) {
    console.error('[voice-checkin] Unexpected error:', err);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
