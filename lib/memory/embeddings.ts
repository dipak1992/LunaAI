import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL = 'text-embedding-3-small'; // 1536 dims

export async function embedText(text: string): Promise<number[]> {
  const clean = text.replace(/\s+/g, ' ').trim().slice(0, 8000);
  if (!clean) throw new Error('Empty text for embedding');

  const res = await openai.embeddings.create({
    model: MODEL,
    input: clean,
  });

  return res.data[0].embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const cleaned = texts
    .map((t) => t.replace(/\s+/g, ' ').trim().slice(0, 8000))
    .filter(Boolean);
  if (cleaned.length === 0) return [];

  const res = await openai.embeddings.create({
    model: MODEL,
    input: cleaned,
  });

  return res.data.map((d) => d.embedding);
}
