import { createClient } from '@/lib/supabase/server';
import type { CrisisLogInput } from './crisis-detection';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function logCrisisEvent(input: CrisisLogInput): Promise<void> {
  try {
    const supabase = await createClient();
    await (supabase as any).from('crisis_events').insert({
      user_id: input.user_id,
      level: input.level,
      category: input.category,
      matched_terms: input.matched_terms,
      message_preview: input.message_preview.slice(0, 200),
      source: input.source,
    });
  } catch (err) {
    console.error('[safety] log error', err);
  }
}
