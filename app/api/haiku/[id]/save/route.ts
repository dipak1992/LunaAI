import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const runtime = 'nodejs';

export async function POST(req: Request, ctx: RouteContext<'/api/haiku/[id]/save'>) {
  const { id } = await ctx.params;
  const { saved } = (await req.json()) as { saved?: boolean };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await (supabase as any)
    .from('haikus')
    .update({ saved: !!saved })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
