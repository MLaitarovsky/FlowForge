import OpenAI from 'openai'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536

export { EMBEDDING_DIMENSIONS }

export async function generateEmbedding(
  text: string,
  apiKey: string
): Promise<number[]> {
  const client = new OpenAI({ apiKey })
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  })
  return response.data[0].embedding
}

export async function generateEmbeddings(
  texts: string[],
  apiKey: string
): Promise<number[][]> {
  const client = new OpenAI({ apiKey })
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  })
  return response.data.map((d) => d.embedding)
}
