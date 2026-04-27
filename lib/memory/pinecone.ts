import { getPineconeIndex } from './pinecone-client';
import { embedText, embedBatch } from './embeddings';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import crypto from 'crypto';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type MemoryType =
  | 'fact'
  | 'trigger'
  | 'remedy'
  | 'person'
  | 'event'
  | 'preference';

export type MemorySource = 'chat' | 'checkin' | 'onboarding' | 'manual';

export interface MemoryInput {
  content: string;
  type?: MemoryType;
  source?: MemorySource;
}

export interface RetrievedMemory {
  id: string;
  content: string;
  type: MemoryType;
  score: number;
  created_at?: string;
}

function hashContent(userId: string, content: string): string {
  return crypto
    .createHash('sha256')
    .update(`${userId}::${content.toLowerCase().trim()}`)
    .digest('hex')
    .slice(0, 32);
}

/**
 * Save a single memory.
 * 1. Generates embedding
 * 2. Upserts to Pinecone (namespace = userId)
 * 3. Upserts to Postgres user_memory (dedup by content hash)
 */
export async function saveMemory(
  userId: string,
  input: MemoryInput,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const content = input.content?.trim();
  if (!content) return { ok: false, error: 'empty_content' };
  if (content.length < 4) return { ok: false, error: 'too_short' };

  const type = input.type ?? 'fact';
  const source = input.source ?? 'chat';
  const vectorId = hashContent(userId, content);

  try {
    const embedding = await embedText(content);

    const index = getPineconeIndex();
    // SDK v6: upsert({ records, namespace })
    await index.upsert({
      records: [
        {
          id: vectorId,
          values: embedding,
          metadata: {
            user_id: userId,
            content,
            type,
            source,
            created_at: new Date().toISOString(),
          },
        },
      ],
      namespace: userId,
    });

    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from('user_memory')
      .upsert(
        { user_id: userId, content, type, source, pinecone_id: vectorId },
        { onConflict: 'user_id,md5(content)', ignoreDuplicates: true },
      )
      .select('id')
      .maybeSingle();

    if (error && !String(error.message).includes('duplicate')) {
      console.warn('[memory] pg upsert warning', error.message);
    }

    return { ok: true, id: data?.id ?? vectorId };
  } catch (err) {
    console.error('[memory] saveMemory error', err);
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

/**
 * Save many memories with a single batched embedding call.
 */
export async function saveMemoriesBatch(
  userId: string,
  items: MemoryInput[],
): Promise<{ saved: number; skipped: number }> {
  const valid = items
    .map((i) => ({ ...i, content: i.content?.trim() ?? '' }))
    .filter((i) => i.content.length >= 4);

  if (valid.length === 0) return { saved: 0, skipped: items.length };

  try {
    const embeddings = await embedBatch(valid.map((i) => i.content));
    const now = new Date().toISOString();
    const index = getPineconeIndex();

    const records = valid.map((item, idx) => ({
      id: hashContent(userId, item.content),
      values: embeddings[idx],
      metadata: {
        user_id: userId,
        content: item.content,
        type: item.type ?? 'fact',
        source: item.source ?? 'chat',
        created_at: now,
      },
    }));

    // SDK v6: upsert({ records, namespace })
    await index.upsert({ records, namespace: userId });

    const supabase = await createClient();
    const rows = valid.map((item, idx) => ({
      user_id: userId,
      content: item.content,
      type: item.type ?? 'fact',
      source: item.source ?? 'chat',
      pinecone_id: records[idx].id,
    }));

    const { error } = await (supabase as any)
      .from('user_memory')
      .upsert(rows, { onConflict: 'user_id,md5(content)', ignoreDuplicates: true });

    if (error && !String(error.message).includes('duplicate')) {
      console.warn('[memory] batch pg warning', error.message);
    }

    return { saved: valid.length, skipped: items.length - valid.length };
  } catch (err) {
    console.error('[memory] saveMemoriesBatch error', err);
    return { saved: 0, skipped: items.length };
  }
}

/**
 * Semantic search across a user's memories.
 */
export async function retrieveMemories(
  userId: string,
  query: string,
  topK = 5,
): Promise<RetrievedMemory[]> {
  const q = query?.trim();
  if (!q) return [];

  try {
    const embedding = await embedText(q);
    const index = getPineconeIndex();

    // SDK v6: query({ vector, topK, namespace, includeMetadata })
    const res = await index.query({
      vector: embedding,
      topK,
      namespace: userId,
      includeMetadata: true,
    });

    return (res.matches ?? [])
      .filter((m) => (m.score ?? 0) > 0.3)
      .map((m) => {
        const meta = (m.metadata ?? {}) as Record<string, unknown>;
        return {
          id: m.id,
          content: String(meta.content ?? ''),
          type: (meta.type as MemoryType) ?? 'fact',
          score: m.score ?? 0,
          created_at: meta.created_at as string | undefined,
        };
      })
      .filter((m) => m.content.length > 0);
  } catch (err) {
    console.error('[memory] retrieveMemories error', err);
    return [];
  }
}

/**
 * GPT-based extraction of durable facts from a transcript/text.
 */
export async function extractMemories(
  text: string,
  context?: { source?: MemorySource },
): Promise<MemoryInput[]> {
  const clean = text?.trim();
  if (!clean || clean.length < 10) return [];

  const systemPrompt = `You are Luna's memory extractor. Read the user's message and extract ONLY durable, personal facts worth remembering long-term.

Examples of what TO extract:
- People: "My daughter Sarah is getting married in June"
- Triggers: "Dairy triggers my hot flashes"
- Remedies: "Yoga helps my stress"
- Preferences: "I prefer mornings for workouts"
- Events: "Starting HRT next week"
- Personal context: "I work as a nurse, night shifts"

Do NOT extract:
- Fleeting feelings ("I feel tired today")
- Generic statements ("menopause is hard")
- Questions or hypotheticals

Return JSON: { "memories": [{ "content": "...", "type": "fact|trigger|remedy|person|event|preference" }] }
Each "content" should be a complete, self-contained sentence referring to the user in third person.
If nothing worth remembering, return { "memories": [] }.`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: clean },
      ],
    });

    const raw = res.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    const memories = Array.isArray(parsed.memories) ? parsed.memories : [];

    return memories
      .filter(
        (m: unknown) =>
          m &&
          typeof (m as Record<string, unknown>).content === 'string' &&
          ((m as Record<string, unknown>).content as string).trim().length > 4,
      )
      .map((m: Record<string, unknown>) => ({
        content: String(m.content).trim(),
        type: (m.type as MemoryType) ?? 'fact',
        source: context?.source ?? 'chat',
      }))
      .slice(0, 6);
  } catch (err) {
    console.error('[memory] extractMemories error', err);
    return [];
  }
}

/**
 * Fire-and-forget: extract memories from text and save them.
 */
export function scheduleMemoryExtraction(
  userId: string,
  text: string,
  source: MemorySource = 'chat',
) {
  (async () => {
    try {
      const memories = await extractMemories(text, { source });
      if (memories.length === 0) return;
      await saveMemoriesBatch(userId, memories);
    } catch (err) {
      console.error('[memory] scheduleMemoryExtraction error', err);
    }
  })();
}

/**
 * Backfill: extract memories from recent symptom_logs and save.
 */
export async function syncMemory(
  userId: string,
  opts: { days?: number } = {},
): Promise<{ ok: boolean; processed: number; saved: number }> {
  const days = opts.days ?? 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const supabase = await createClient();
  const { data: logs, error } = await (supabase as any)
    .from('symptom_logs')
    .select('id, created_at, mood, severity, notes, transcript')
    .eq('user_id', userId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !logs) {
    return { ok: false, processed: 0, saved: 0 };
  }

  const texts = (
    logs as Array<{
      transcript?: string | null;
      notes?: string | null;
      mood?: string | null;
      severity?: number | null;
    }>
  )
    .map((l) => {
      const parts = [
        l.transcript,
        l.notes,
        l.mood && l.severity != null
          ? `${l.mood} at intensity ${l.severity}`
          : l.mood,
      ].filter(Boolean);
      return parts.join('. ');
    })
    .filter((t) => t && t.length > 8);

  if (texts.length === 0) return { ok: true, processed: 0, saved: 0 };

  let totalSaved = 0;
  for (const text of texts) {
    try {
      const memories = await extractMemories(text, { source: 'checkin' });
      if (memories.length > 0) {
        const result = await saveMemoriesBatch(userId, memories);
        totalSaved += result.saved;
      }
    } catch (err) {
      console.error('[memory] syncMemory iteration error', err);
    }
  }

  return { ok: true, processed: texts.length, saved: totalSaved };
}

/**
 * Delete a memory (both Pinecone + Postgres).
 */
export async function deleteMemory(
  userId: string,
  pineconeId: string,
): Promise<{ ok: boolean }> {
  try {
    const index = getPineconeIndex();
    // SDK v6: deleteOne({ id, namespace })
    await index.deleteOne({ id: pineconeId, namespace: userId });

    const supabase = await createClient();
    await (supabase as any)
      .from('user_memory')
      .delete()
      .eq('user_id', userId)
      .eq('pinecone_id', pineconeId);

    return { ok: true };
  } catch (err) {
    console.error('[memory] deleteMemory error', err);
    return { ok: false };
  }
}
