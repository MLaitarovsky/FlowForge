import type { NodeExecutor } from './types'
import type { NodeExecutorContext, NodeExecutorResult } from '@/types/execution'
import { queryCollection } from '@/lib/chromadb'
import { generateEmbedding } from '@/lib/embeddings'

export class RetrieverExecutor implements NodeExecutor {
  async execute(context: NodeExecutorContext): Promise<NodeExecutorResult> {
    const { config, inputs, apiKeys } = context
    const query = String(inputs['query'] ?? inputs['input'] ?? '')
    const collectionName = (config.collectionName as string) ?? 'default'
    const topK = (config.topK as number) ?? 5
    const embeddingProvider = (config.embeddingProvider as string) ?? 'openai'

    if (!query) {
      return { output: [] }
    }

    let queryEmbedding: number[]

    if (embeddingProvider === 'openai') {
      const apiKey = apiKeys['openai']
      if (!apiKey) throw new Error('OpenAI API key required for embeddings.')
      queryEmbedding = await generateEmbedding(query, apiKey)
    } else {
      throw new Error(
        'Only "openai" embedding provider is supported. Please add an OpenAI API key.'
      )
    }

    const results = await queryCollection(collectionName, queryEmbedding, topK)
    return { output: results }
  }
}
