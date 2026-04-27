import { createClient } from '@/lib/supabase/server';
import type { UIMessage } from 'ai';

export async function loadInitialMessages(): Promise<{
  userId: string | null;
  messages: UIMessage[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { userId: null, messages: [] };

  const { data } = await (supabase as any)
    .from('chat_messages')
    .select('id, role, content, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const messages: UIMessage[] = ((data ?? []) as Array<{
    id: string;
    role: string;
    content: string;
    created_at: string;
  }>)
    .reverse()
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      parts: [{ type: 'text' as const, text: m.content }],
      metadata: undefined,
    }));

  return { userId: user.id, messages };
}
