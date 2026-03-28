import { ChromaClient, Collection } from 'chromadb'

const CHROMA_URL = process.env.CHROMA_URL ?? 'http://localhost:8000'

const globalForChroma = globalThis as unknown as { chroma: ChromaClient | undefined }

export function getChromaClient(): ChromaClient {
  if (!globalForChroma.chroma) {
    globalForChroma.chroma = new ChromaClient({ path: CHROMA_URL })
  }
  return globalForChroma.chroma
}

export async function getOrCreateCollection(name: string): Promise<Collection> {
  const client = getChromaClient()
  return client.getOrCreateCollection({ name })
}

export async function addDocuments(
  collectionName: string,
  ids: string[],
  documents: string[],
  embeddings: number[][],
  metadatas: Record<string, string>[]
): Promise<void> {
  const collection = await getOrCreateCollection(collectionName)
  await collection.add({ ids, documents, embeddings, metadatas })
}

export async function queryCollection(
  collectionName: string,
  queryEmbedding: number[],
  nResults: number
): Promise<Array<{ id: string; document: string; distance: number }>> {
  const collection = await getOrCreateCollection(collectionName)
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults,
  })

  const ids = results.ids[0] ?? []
  const documents = results.documents[0] ?? []
  const distances = results.distances?.[0] ?? []

  return ids.map((id, i) => ({
    id,
    document: documents[i] ?? '',
    distance: distances[i] ?? 0,
  }))
}
