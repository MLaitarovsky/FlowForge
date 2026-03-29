'use client'

import { create } from 'zustand'
import type { ExecutionEvent } from '@/types/execution'

export type NodeStatus = 'idle' | 'running' | 'completed' | 'error' | 'skipped'
export type ExecutionStatus = 'idle' | 'pending' | 'running' | 'completed' | 'failed'

interface ExecutionState {
  executionId: string | null
  status: ExecutionStatus
  nodeStatuses: Record<string, NodeStatus>
  nodeOutputs: Record<string, unknown>
  nodeErrors: Record<string, string>
  error: string | null
  isRunning: boolean
  isDemo: boolean

  startExecution: (workflowId: string) => Promise<void>
  startDemoExecution: (templateSlug: string) => Promise<void>
  clearExecution: () => void
}

let eventSource: EventSource | null = null

function closeEventSource() {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  executionId: null,
  status: 'idle',
  nodeStatuses: {},
  nodeOutputs: {},
  nodeErrors: {},
  error: null,
  isRunning: false,
  isDemo: false,

  startExecution: async (workflowId: string) => {
    if (get().isRunning) return

    closeEventSource()
    set({
      executionId: null,
      status: 'pending',
      nodeStatuses: {},
      nodeOutputs: {},
      nodeErrors: {},
      error: null,
      isRunning: true,
      isDemo: false,
    })

    try {
      const res = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
      })
      const json = await res.json() as { data?: { executionId: string }; error?: string }

      if (!res.ok || !json.data?.executionId) {
        set({ status: 'failed', error: json.error ?? 'Failed to start execution', isRunning: false })
        return
      }

      const executionId = json.data.executionId
      set({ executionId, status: 'running' })

      const es = new EventSource(`/api/executions/${executionId}/status`)
      eventSource = es

      es.onmessage = (e: MessageEvent) => {
        try {
          const event = JSON.parse(e.data as string) as ExecutionEvent
          handleEvent(event)
        } catch {
          // malformed
        }
      }

      es.onerror = () => {
        closeEventSource()
        set((s) => ({
          isRunning: false,
          status: s.status === 'running' ? 'failed' : s.status,
          error: s.error ?? 'Connection lost',
        }))
      }
    } catch (err) {
      set({
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
        isRunning: false,
      })
    }
  },

  startDemoExecution: async (templateSlug: string) => {
    if (get().isRunning) return

    closeEventSource()
    set({
      executionId: null,
      status: 'pending',
      nodeStatuses: {},
      nodeOutputs: {},
      nodeErrors: {},
      error: null,
      isRunning: true,
      isDemo: true,
    })

    try {
      const res = await fetch(`/api/templates/${templateSlug}/demo-execute`, {
        method: 'POST',
      })
      const json = await res.json() as { data?: { executionId: string }; error?: string }

      if (!res.ok || !json.data?.executionId) {
        set({ status: 'failed', error: json.error ?? 'Failed to start demo', isRunning: false })
        return
      }

      const executionId = json.data.executionId
      set({ executionId, status: 'running' })

      const es = new EventSource(`/api/demo-executions/${executionId}/status`)
      eventSource = es

      es.onmessage = (e: MessageEvent) => {
        try {
          const event = JSON.parse(e.data as string) as ExecutionEvent
          handleEvent(event)
        } catch {
          // malformed
        }
      }

      es.onerror = () => {
        closeEventSource()
        set((s) => ({
          isRunning: false,
          status: s.status === 'running' ? 'failed' : s.status,
          error: s.error ?? 'Connection lost',
        }))
      }
    } catch (err) {
      set({
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
        isRunning: false,
      })
    }
  },

  clearExecution: () => {
    closeEventSource()
    set({
      executionId: null,
      status: 'idle',
      nodeStatuses: {},
      nodeOutputs: {},
      nodeErrors: {},
      error: null,
      isRunning: false,
      isDemo: false,
    })
  },
}))

function handleEvent(event: ExecutionEvent) {
  useExecutionStore.setState((state) => {
    switch (event.type) {
      case 'node_started':
        return {
          nodeStatuses: { ...state.nodeStatuses, [event.nodeId]: 'running' },
        }
      case 'node_completed':
        return {
          nodeStatuses: { ...state.nodeStatuses, [event.nodeId]: 'completed' },
          nodeOutputs: { ...state.nodeOutputs, [event.nodeId]: event.output },
        }
      case 'node_error':
        return {
          nodeStatuses: { ...state.nodeStatuses, [event.nodeId]: 'error' },
          nodeErrors: { ...state.nodeErrors, [event.nodeId]: event.error },
        }
      case 'node_skipped':
        return {
          nodeStatuses: { ...state.nodeStatuses, [event.nodeId]: 'skipped' },
        }
      case 'execution_completed':
        closeEventSource()
        return { status: 'completed', isRunning: false }
      case 'execution_failed':
        closeEventSource()
        return { status: 'failed', error: event.error, isRunning: false }
      default:
        return {}
    }
  })
}
