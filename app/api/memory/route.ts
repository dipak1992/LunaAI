import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteMemory } from '@/lib/memory/pinecone';

export const runtime = 'nodejs';

// GET /api/memory — list user's memories
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await (supabase as any).auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data } = await (supabase as any)
    .from('user_memory')
    .select('id, content, type, source, pinecone_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  return NextResponse.json({ memories: data ?? [] });
}

// DELETE /api/memory — delete a memory by pinecone_id
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await (supabase as any).auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { pinecone_id } = body as { pinecone_id?: string };

  if (!pinecone_id) {
    return NextResponse.json({ error: 'Missing pinecone_id' }, { status: 400 });
  }

  const result = await deleteMemory(user.id, pinecone_id);
  return NextResponse.json(result);
}
