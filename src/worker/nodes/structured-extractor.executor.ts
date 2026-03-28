import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { NodeExecutor } from './types'
import type { NodeExecutorContext, NodeExecutorResult } from '@/types/execution'

async function extractWithRetry(
  callFn: () => Promise<string>,
  maxRetries = 2
): Promise<unknown> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const raw = await callFn()
      // Strip markdown code fences if present
      const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
      return JSON.parse(cleaned)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }
  throw new Error(`Structured extraction failed after retries: ${lastError?.message}`)
}

export class StructuredExtractorExecutor implements NodeExecutor {
  async execute(context: NodeExecutorContext): Promise<NodeExecutorResult> {
    const { config, inputs, apiKeys } = context
    const provider = (config.provider as string) ?? 'anthropic'
    const model = (config.model as string) ?? 'claude-sonnet-4-6'
    const jsonSchema = (config.jsonSchema as string) ?? '{}'
    const instructions = (config.instructions as string) ?? ''
    const inputText = String(inputs['input'] ?? inputs['output'] ?? '')

    const systemPrompt = `You are a structured data extractor. Extract information from the provided text and return ONLY valid JSON matching this schema:\n\n${jsonSchema}\n\n${instructions}\n\nReturn ONLY the JSON object, no explanation.`

    let totalTokens: number | undefined

    if (provider === 'anthropic') {
      const apiKey = apiKeys['anthropic']
      if (!apiKey) throw new Error('Anthropic API key not configured.')
      const client = new Anthropic({ apiKey })

      const result = await extractWithRetry(async () => {
        const msg = await client.messages.create({
          model,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: inputText }],
        })
        totalTokens = msg.usage.input_tokens + msg.usage.output_tokens
        const c = msg.content[0]
        return c.type === 'text' ? c.text : ''
      })
      return { output: result, tokensUsed: totalTokens }
    }

    if (provider === 'openai') {
      const apiKey = apiKeys['openai']
      if (!apiKey) throw new Error('OpenAI API key not configured.')
      const client = new OpenAI({ apiKey })

      const result = await extractWithRetry(async () => {
        const resp = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: inputText },
          ],
        })
        if (resp.usage) totalTokens = resp.usage.prompt_tokens + resp.usage.completion_tokens
        return resp.choices[0]?.message?.content ?? ''
      })
      return { output: result, tokensUsed: totalTokens }
    }

    throw new Error(`Unknown provider: ${provider}`)
  }
}
