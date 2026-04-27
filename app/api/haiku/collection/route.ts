import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const runtime = 'nodejs';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data } = await (supabase as any)
    .from('haikus')
    .select('*')
    .eq('user_id', user.id)
    .eq('saved', true)
    .order('haiku_date', { ascending: false });

  return NextResponse.json({ haikus: data ?? [] });
}
