import type { NodeExecutor } from './types'
import type { NodeExecutorContext, NodeExecutorResult } from '@/types/execution'

export class TextInputExecutor implements NodeExecutor {
  async execute(context: NodeExecutorContext): Promise<NodeExecutorResult> {
    const defaultValue = (context.config.defaultValue as string) ?? ''
    return { output: defaultValue }
  }
}
