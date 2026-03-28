import type { NodeExecutor } from './types'
import type { NodeExecutorContext, NodeExecutorResult } from '@/types/execution'

export class TextOutputExecutor implements NodeExecutor {
  async execute(context: NodeExecutorContext): Promise<NodeExecutorResult> {
    const input = context.inputs['input'] ?? context.inputs['output'] ?? ''
    return { output: String(input) }
  }
}
