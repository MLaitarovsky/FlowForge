export type ExecutionEventType =
  | 'execution_started'
  | 'node_started'
  | 'node_completed'
  | 'node_error'
  | 'node_skipped'
  | 'execution_completed'
  | 'execution_failed'

export interface ExecutionStartedEvent {
  type: 'execution_started'
  executionId: string
  workflowId: string
  timestamp: string
}

export interface NodeStartedEvent {
  type: 'node_started'
  executionId: string
  nodeId: string
  nodeType: string
  timestamp: string
}

export interface NodeCompletedEvent {
  type: 'node_completed'
  executionId: string
  nodeId: string
  nodeType: string
  output: unknown
  durationMs: number
  tokensUsed?: number
  timestamp: string
}

export interface NodeErrorEvent {
  type: 'node_error'
  executionId: string
  nodeId: string
  nodeType: string
  error: string
  timestamp: string
}

export interface NodeSkippedEvent {
  type: 'node_skipped'
  executionId: string
  nodeId: string
  timestamp: string
}

export interface ExecutionCompletedEvent {
  type: 'execution_completed'
  executionId: string
  durationMs: number
  timestamp: string
}

export interface ExecutionFailedEvent {
  type: 'execution_failed'
  executionId: string
  error: string
  timestamp: string
}

export type ExecutionEvent =
  | ExecutionStartedEvent
  | NodeStartedEvent
  | NodeCompletedEvent
  | NodeErrorEvent
  | NodeSkippedEvent
  | ExecutionCompletedEvent
  | ExecutionFailedEvent

export interface NodeExecutorContext {
  nodeId: string
  nodeType: string
  config: Record<string, unknown>
  inputs: Record<string, unknown>
  apiKeys: Record<string, string>
}

export interface NodeExecutorResult {
  output: unknown
  tokensUsed?: number
  costUsd?: number
}
