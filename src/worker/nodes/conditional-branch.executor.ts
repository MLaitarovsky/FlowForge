import type { NodeExecutor } from './types'
import type { NodeExecutorContext, NodeExecutorResult } from '@/types/execution'

export interface ConditionalBranchOutput {
  branch: 'true' | 'false'
  data: string
}

export class ConditionalBranchExecutor implements NodeExecutor {
  async execute(context: NodeExecutorContext): Promise<NodeExecutorResult> {
    const { config, inputs } = context
    const condition = (config.condition as string) ?? 'contains'
    const value = (config.value as string) ?? ''
    const caseSensitive = (config.caseSensitive as boolean) ?? false
    const inputText = String(inputs['input'] ?? inputs['output'] ?? '')

    let matches = false
    const compareText = caseSensitive ? inputText : inputText.toLowerCase()
    const compareValue = caseSensitive ? value : value.toLowerCase()

    switch (condition) {
      case 'contains':
        matches = compareText.includes(compareValue)
        break
      case 'equals':
        matches = compareText === compareValue
        break
      case 'regex': {
        const flags = caseSensitive ? '' : 'i'
        try {
          matches = new RegExp(value, flags).test(inputText)
        } catch {
          matches = false
        }
        break
      }
      case 'json_path': {
        try {
          const parsed = JSON.parse(inputText) as unknown
          // Simple dot-notation path resolution
          const parts = value.split('.')
          let current: unknown = parsed
          for (const part of parts) {
            if (current === null || typeof current !== 'object') {
              current = undefined
              break
            }
            current = (current as Record<string, unknown>)[part]
          }
          matches = current !== undefined && current !== null && current !== false && current !== ''
        } catch {
          matches = false
        }
        break
      }
      default:
        matches = false
    }

    const result: ConditionalBranchOutput = {
      branch: matches ? 'true' : 'false',
      data: inputText,
    }

    return { output: result }
  }
}
