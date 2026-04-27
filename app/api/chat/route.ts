import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { buildLunaSystemPrompt } from '@/lib/ai/luna-prompt';
import { retrieveMemories, scheduleMemoryExtraction } from '@/lib/memory/pinecone';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = (await req.json()) as { messages: UIMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    // Extract latest user message text for memory retrieval + persistence
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    const lastUserText = lastUserMsg
      ? lastUserMsg.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => (p as any).text)
          .join('')
      : '';

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch user context + vector memories in parallel
    const [profileRes, symptomsRes, vectorMemories] = await Promise.all([
      (supabase as any)
        .from('profiles')
        .select('name, menopause_stage')
        .eq('id', user.id)
        .maybeSingle(),
      (supabase as any)
        .from('symptom_logs')
        .select('created_at, mood, severity, notes')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(20),
      // Semantic memory retrieval — falls back to [] if Pinecone not configured
      lastUserText
        ? retrieveMemories(user.id, lastUserText, 5).catch(() => [])
        : Promise.resolve([]),
    ]);

    const systemPrompt = buildLunaSystemPrompt({
      userName:
        profileRes.data?.name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'friend',
      intention: null,
      recentSymptoms: (symptomsRes.data ?? []).map((s: any) => ({
        created_at: s.created_at,
        symptom: s.mood,
        severity: s.severity,
        note: s.notes,
      })),
      memories: vectorMemories.map((m) => ({ content: m.content })),
    });

    // Convert UI messages to model messages (async in AI SDK v6)
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages: modelMessages,
      temperature: 0.85,
      maxOutputTokens: 500,
      onFinish: async ({ text }) => {
        try {
          const rows: Array<{ user_id: string; role: string; content: string }> = [];
          if (lastUserText.trim()) {
            rows.push({ user_id: user.id, role: 'user', content: lastUserText });
          }
          if (text?.trim()) {
            rows.push({ user_id: user.id, role: 'assistant', content: text });
          }
          if (rows.length) {
            await (supabase as any).from('chat_messages').insert(rows);
          }

          // Fire-and-forget: extract durable memories from the user's message
          if (lastUserText.trim()) {
            scheduleMemoryExtraction(user.id, lastUserText, 'chat');
          }
        } catch (err) {
          console.error('[chat] persist error', err);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error('[chat] route error', err);
    return NextResponse.json(
      { error: 'Something went quiet. Try again in a moment.' },
      { status: 500 },
    );
  }
}
