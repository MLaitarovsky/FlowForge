import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { NodeExecutor } from './types'
import type { NodeExecutorContext, NodeExecutorResult } from '@/types/execution'

interface ChainStep {
  systemPrompt: string
  userPromptTemplate: string
}

export class LLMChainExecutor implements NodeExecutor {
  async execute(context: NodeExecutorContext): Promise<NodeExecutorResult> {
    const { config, inputs, apiKeys } = context
    const provider = (config.provider as string) ?? 'anthropic'
    const model = (config.model as string) ?? 'claude-sonnet-4-6'
    const steps = (config.steps as ChainStep[]) ?? []
    let current = String(inputs['input'] ?? inputs['output'] ?? '')
    let totalTokens = 0

    if (steps.length === 0) {
      return { output: current }
    }

    for (const step of steps) {
      const userContent = step.userPromptTemplate.replace('{{previous}}', current).replace('{{input}}', current)

      if (provider === 'anthropic') {
        const apiKey = apiKeys['anthropic']
        if (!apiKey) throw new Error('Anthropic API key not configured.')
        const client = new Anthropic({ apiKey })
        const msg = await client.messages.create({
          model,
          max_tokens: 2048,
          system: step.systemPrompt,
          messages: [{ role: 'user', content: userContent }],
        })
        const c = msg.content[0]
        current = c.type === 'text' ? c.text : ''
        totalTokens += msg.usage.input_tokens + msg.usage.output_tokens
      } else if (provider === 'openai') {
        const apiKey = apiKeys['openai']
        if (!apiKey) throw new Error('OpenAI API key not configured.')
        const client = new OpenAI({ apiKey })
        const resp = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: step.systemPrompt },
            { role: 'user', content: userContent },
          ],
        })
        current = resp.choices[0]?.message?.content ?? ''
        if (resp.usage) totalTokens += resp.usage.prompt_tokens + resp.usage.completion_tokens
      } else {
        throw new Error(`Unknown provider: ${provider}`)
      }
    }

    return { output: current, tokensUsed: totalTokens }
  }
}
