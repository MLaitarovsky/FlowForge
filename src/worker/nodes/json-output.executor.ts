import type { NodeExecutor } from './types'
import type { NodeExecutorContext, NodeExecutorResult } from '@/types/execution'

function resolvePath(obj: unknown, path: string): unknown {
  if (!path) return obj
  const parts = path.replace(/^\$\.?/, '').split('.')
  let current = obj
  for (const part of parts) {
    if (current === null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

export class JsonOutputExecutor implements NodeExecutor {
  async execute(context: NodeExecutorContext): Promise<NodeExecutorResult> {
    const { config, inputs } = context
    const query = (config.query as string) ?? ''
    const prettyPrint = (config.prettyPrint as boolean) ?? true
    const raw = inputs['input'] ?? inputs['output']

    let parsed: unknown
    if (typeof raw === 'string') {
      try {
        parsed = JSON.parse(raw)
      } catch {
        parsed = raw
      }
    } else {
      parsed = raw
    }

    const result = query ? resolvePath(parsed, query) : parsed
    const output = prettyPrint
      ? JSON.stringify(result, null, 2)
      : JSON.stringify(result)

    return { output }
  }
}
