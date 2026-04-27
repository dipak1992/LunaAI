import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncMemory } from '@/lib/memory/pinecone';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST /api/memory/sync — backfill memories from recent check-ins
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await (supabase as any).auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await syncMemory(user.id, { days: 30 });
  return NextResponse.json(result);
}
