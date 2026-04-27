/**
 * SETUP REQUIRED IN SUPABASE DASHBOARD:
 * 1. Authentication → Settings → Enable "Allow anonymous sign-ins"
 * 2. Verify RLS policies on: symptom_logs, haikus, profiles use auth.uid()
 * 3. Add cleanup cron: DELETE FROM auth.users WHERE is_anonymous=true AND created_at < NOW() - INTERVAL '30 days'
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOpenAIClient } from '@/lib/openai/client';
import { detectCrisis, crisisResponse } from '@/lib/safety/crisis-detection';
import { logCrisisEvent } from '@/lib/safety/log-crisis';

// Simple in-memory rate limiter (per IP, 3 requests/hour)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'Please try again later.' },
        { status: 429 }
      );
    }

    const supabase = await createClient();

    // Get or create anonymous session
    const { data: { user } } = await supabase.auth.getUser();
    let userId: string;

    if (user) {
      userId = user.id;
    } else {
      // Sign in anonymously
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
      if (anonError || !anonData.user) {
        return NextResponse.json(
          { error: 'auth_failed', message: 'Unable to start trial. Please try again.' },
          { status: 500 }
        );
      }
      userId = anonData.user.id;
    }

    // Check usage: only 1 trial check-in allowed for anonymous users
    if (user?.is_anonymous) {
      const { count } = await supabase
        .from('symptom_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if ((count ?? 0) >= 1) {
        return NextResponse.json(
          { error: 'trial_used', message: 'Create an account to continue your journey with Luna.' },
          { status: 403 }
        );
      }
    }

    // Parse input: audio blob or text
    const contentType = req.headers.get('content-type') || '';
    let transcript: string;

    const openai = getOpenAIClient();

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const audio = formData.get('audio') as Blob | null;

      if (!audio) {
        return NextResponse.json(
          { error: 'no_audio', message: 'No audio received.' },
          { status: 400 }
        );
      }

      // Transcribe via Whisper
      const audioFile = new File([audio], 'recording.webm', { type: audio.type });
      const transcription = await openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: audioFile,
        language: 'en',
      });
      transcript = transcription.text;
    } else {
      const body = await req.json();
      transcript = body.text;

      if (!transcript || transcript.trim().length === 0) {
        return NextResponse.json(
          { error: 'no_text', message: 'Please share how you\'re feeling.' },
          { status: 400 }
        );
      }
    }

    // Crisis detection
    const crisisResult = detectCrisis(transcript);
    if (crisisResult.level !== 'none') {
      await logCrisisEvent({
        user_id: userId,
        level: crisisResult.level as Exclude<typeof crisisResult.level, 'none'>,
        category: crisisResult.category,
        matched_terms: crisisResult.matched_terms,
        message_preview: transcript,
        source: 'checkin',
      });
      return NextResponse.json({
        transcript,
        response: crisisResponse(crisisResult),
        haiku: null,
        crisis: true,
        crisisLevel: crisisResult.level,
        crisisCategory: crisisResult.category,
      });
    }

    // Generate Luna response (trial mode: warmer, shorter)
    const lunaResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are Luna, a gentle AI companion for women navigating menopause. This is a first-time visitor's very first whisper to you. Respond with:
- 2-3 sentences maximum
- Deep warmth and emotional resonance
- Acknowledge what she shared without clinical language
- End with something that makes her feel truly heard
- Do NOT reference memory, past conversations, or forecasts
- Do NOT suggest actions or give advice
- Speak as a wise friend, not a therapist`
        },
        { role: 'user', content: transcript }
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    const response = lunaResponse.choices[0]?.message?.content || 'I hear you. Thank you for sharing this moment with me.';

    // Generate haiku directly (not using getOrGenerateTodayHaiku since trial doesn't need date-based logic)
    let haiku: { lines: string[]; mood?: string } | null = null;
    try {
      const haikuRes = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.95,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are Luna, writing a haiku for someone who just shared how they feel.
A haiku is 3 lines. Aim for a 5-7-5 syllable pattern.
Write soft, poetic English about her emotional weather.
Use nature, moon, weather, tide, or bloom imagery.
Avoid cliches. Avoid em dashes. Avoid punctuation at line ends unless needed.
Return JSON: { "lines": ["line 1", "line 2", "line 3"], "mood": "one word mood" }`,
          },
          {
            role: 'user',
            content: `She said: "${transcript}"\n\nLuna replied: "${response}"\n\nWrite a haiku capturing this moment.`,
          },
        ],
      });

      const raw = haikuRes.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.lines) && parsed.lines.length === 3) {
        haiku = { lines: parsed.lines, mood: parsed.mood };
      }
    } catch (haikuErr) {
      console.error('[trial/check-in] Haiku generation failed:', haikuErr);
    }

    // Save symptom log
    await supabase.from('symptom_logs').insert({
      user_id: userId,
      transcript,
      luna_response: response,
      weather_score: 5, // neutral default for trial
      symptoms: [],
      triggers: [],
      is_trial_entry: true,
    });

    // Save haiku
    if (haiku) {
      await supabase.from('haikus').insert({
        user_id: userId,
        haiku_date: new Date().toISOString().split('T')[0],
        lines: haiku.lines,
        mood: haiku.mood ?? null,
        is_trial_entry: true,
      });
    }

    return NextResponse.json({
      transcript,
      response,
      haiku,
      crisis: false,
      sessionId: userId,
    });
  } catch (error) {
    console.error('[trial/check-in] Error:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
