import { Pinecone } from '@pinecone-database/pinecone';

let _client: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (_client) return _client;

  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    throw new Error('PINECONE_API_KEY is not set');
  }

  _client = new Pinecone({ apiKey });
  return _client;
}

export function getPineconeIndex() {
  const indexName = process.env.PINECONE_INDEX ?? 'luna-memory';
  return getPineconeClient().index(indexName);
}
