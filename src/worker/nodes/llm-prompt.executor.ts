import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { NodeExecutor } from './types'
import type { NodeExecutorContext, NodeExecutorResult } from '@/types/execution'

export class LLMPromptExecutor implements NodeExecutor {
  async execute(context: NodeExecutorContext): Promise<NodeExecutorResult> {
    const { config, inputs, apiKeys } = context
    const provider = (config.provider as string) ?? 'anthropic'
    const model = (config.model as string) ?? 'claude-sonnet-4-6'
    const systemPrompt = (config.systemPrompt as string) ?? ''
    const temperature = (config.temperature as number) ?? 0.7
    const maxTokens = (config.maxTokens as number) ?? 1024
    const inputText = String(inputs['input'] ?? inputs['output'] ?? '')

    if (provider === 'anthropic') {
      const apiKey = apiKeys['anthropic']
      if (!apiKey) throw new Error('Anthropic API key not configured in settings.')

      const client = new Anthropic({ apiKey })
      const message = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: inputText }],
        temperature,
      })

      const content = message.content[0]
      const text = content.type === 'text' ? content.text : ''
      const tokensUsed = message.usage.input_tokens + message.usage.output_tokens

      return { output: text, tokensUsed }
    }

    if (provider === 'openai') {
      const apiKey = apiKeys['openai']
      if (!apiKey) throw new Error('OpenAI API key not configured in settings.')

      const client = new OpenAI({ apiKey })
      const response = await client.chat.completions.create({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: inputText },
        ],
      })

      const text = response.choices[0]?.message?.content ?? ''
      const tokensUsed = response.usage
        ? response.usage.prompt_tokens + response.usage.completion_tokens
        : undefined

      return { output: text, tokensUsed }
    }

    throw new Error(`Unknown provider: ${provider}`)
  }
}
