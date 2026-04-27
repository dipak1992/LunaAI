import { NextResponse } from 'next/server';
import { getOrGenerateTodayHaiku } from '@/lib/haiku/generate';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getOrGenerateTodayHaiku(user.id);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Couldn't write a haiku today." },
      { status: 500 },
    );
  }

  return NextResponse.json({ haiku: result.haiku });
}
