import type { NodeExecutorContext, NodeExecutorResult } from '@/types/execution'

export interface NodeExecutor {
  execute(context: NodeExecutorContext): Promise<NodeExecutorResult>
}
