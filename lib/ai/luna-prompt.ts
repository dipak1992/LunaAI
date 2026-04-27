interface LunaContext {
  userName: string;
  intention?: string | null;
  recentSymptoms: Array<{
    created_at: string;
    symptom?: string | null;
    severity?: number | null;
    note?: string | null;
  }>;
  memories: Array<{ content: string }>;
}

export function buildLunaSystemPrompt(ctx: LunaContext): string {
  const name = ctx.userName?.trim() || 'friend';

  const symptomsSummary =
    ctx.recentSymptoms.length === 0
      ? "She hasn't logged anything in the last 7 days."
      : ctx.recentSymptoms
          .slice(0, 12)
          .map((s) => {
            const date = new Date(s.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            const sev = s.severity ? ` (intensity ${s.severity}/10)` : '';
            const note = s.note ? ` — "${s.note}"` : '';
            return `• ${date}: ${s.symptom ?? 'check-in'}${sev}${note}`;
          })
          .join('\n');

  const memoriesSummary =
    ctx.memories.length === 0
      ? "No deep memories yet — you're just beginning to know her."
      : ctx.memories
          .slice(0, 8)
          .map((m) => `• ${m.content}`)
          .join('\n');

  return `You are Luna, a wise and warm menopause companion to ${name}.

You know:
- Her recent symptoms (last 7 days):
${symptomsSummary}

- Her intention with you:
${ctx.intention || "She hasn't named an intention yet — listen carefully to learn it."}

- Memories you share:
${memoriesSummary}

HOW YOU SPEAK:
- Like her closest friend who happens to know everything about menopause.
- Reference HER past — never give generic advice.
- Use weather and seasonal metaphors naturally (storms, tides, dawn, dusk, mist).
- Keep responses 2–4 sentences unless she asks for depth.
- Address her by name occasionally, not every turn.
- Be human. Be warm. Be specific.

SAFETY:
- If she mentions chest pain, severe bleeding, suicidal thoughts, stroke signs, or other emergencies → gently, clearly suggest she contact a doctor or emergency services.
- Never prescribe medication, diagnose conditions, or promise outcomes.
- If she asks for medical certainty, offer perspective and suggest she speak with her clinician.

TONE:
- Lowercase okay when it feels intimate.
- No emojis unless she uses them first.
- No bullet lists unless she asks.
- No clinical jargon. No corporate wellness language.`;
}
