import type { SymptomExtraction } from '@/types/voice';

export const SYMPTOM_EXTRACTION_SYSTEM_PROMPT = `You are Luna, a compassionate AI companion specializing in menopause support. 
Your role is to listen to a woman's voice check-in and extract structured health data with warmth and precision.

Extract the following from the transcript and return ONLY valid JSON matching this exact schema:
{
  "symptoms": string[],           // list of symptoms mentioned (e.g. "hot flashes", "brain fog", "insomnia")
  "severity": number,             // overall severity 1-10 (1=mild, 10=severe)
  "mood": string,                 // single word mood descriptor
  "energy_level": number,         // 1-10 (1=exhausted, 10=energized)
  "sleep_quality": number,        // 1-10 (1=terrible, 10=excellent)
  "triggers": string[],           // identified triggers (stress, food, weather, etc.)
  "remedies": string[],           // remedies mentioned or implied
  "emotional_tone": string,       // one of: radiant, hopeful, steady, tender, heavy, stormy, exhausted
  "weather_score": number,        // overall wellness score 1-10 (like a weather forecast for her body)
  "ai_summary": string,           // 1-2 sentence clinical summary of the check-in
  "luna_response": string         // 2-3 sentence warm, empathetic response from Luna acknowledging her experience
}

Rules:
- If a field cannot be determined from the transcript, use sensible defaults (severity: 5, energy_level: 5, sleep_quality: 5)
- emotional_tone MUST be one of the exact values listed
- weather_score reflects overall wellbeing: 8-10 = sunny, 5-7 = partly cloudy, 3-4 = overcast, 1-2 = stormy
- luna_response should feel like a warm friend who truly understands menopause, not a clinical chatbot
- Return ONLY the JSON object, no markdown, no explanation`;

export function buildExtractionPrompt(transcript: string, userName: string): string {
  return `${userName}'s voice check-in transcript:\n\n"${transcript}"\n\nExtract the health data as JSON.`;
}

export function buildLunaSystemPrompt(userName: string, menopauseStage: string | null): string {
  const stage = menopauseStage ?? 'perimenopause';
  return `You are Luna, a deeply empathetic AI companion for ${userName}, who is in ${stage}. 
You combine the warmth of a best friend with the knowledge of a menopause specialist. 
You never minimize symptoms, always validate feelings, and offer gentle, evidence-based guidance.
Speak in second person, use "you" and "${userName}" naturally. Keep responses concise and warm.`;
}

export const WHISPER_CONFIG = {
  model: 'whisper-1' as const,
  language: 'en',
  temperature: 0,
} satisfies { model: 'whisper-1'; language: string; temperature: number };

export const GPT_CONFIG = {
  model: 'gpt-4o' as const,
  temperature: 0.3,
  max_tokens: 800,
  response_format: { type: 'json_object' as const },
} satisfies {
  model: 'gpt-4o';
  temperature: number;
  max_tokens: number;
  response_format: { type: 'json_object' };
};

export function validateExtraction(raw: unknown): SymptomExtraction {
  const obj = raw as Record<string, unknown>;

  const emotionalTones = ['radiant', 'hopeful', 'steady', 'tender', 'heavy', 'stormy', 'exhausted'];
  const tone = emotionalTones.includes(obj.emotional_tone as string)
    ? (obj.emotional_tone as SymptomExtraction['emotional_tone'])
    : 'steady';

  return {
    symptoms: Array.isArray(obj.symptoms) ? (obj.symptoms as string[]) : [],
    severity: clamp(Number(obj.severity) || 5, 1, 10),
    mood: String(obj.mood || 'neutral'),
    energy_level: clamp(Number(obj.energy_level) || 5, 1, 10),
    sleep_quality: clamp(Number(obj.sleep_quality) || 5, 1, 10),
    triggers: Array.isArray(obj.triggers) ? (obj.triggers as string[]) : [],
    remedies: Array.isArray(obj.remedies) ? (obj.remedies as string[]) : [],
    emotional_tone: tone,
    weather_score: clamp(Number(obj.weather_score) || 5, 1, 10),
    ai_summary: String(obj.ai_summary || ''),
    luna_response: String(obj.luna_response || ''),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
