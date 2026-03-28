'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { ChevronDown, ChevronRight, Loader2, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ExecutionSummary {
  id: string
  status: string
  startedAt: string | null
  durationMs: number | null
  totalTokens: number
  totalCost: number
  isDemo: boolean
}

interface ExecutionLog {
  id: string
  nodeId: string
  nodeLabel: string
  status: string
  tokenUsage: number | null
  error: string | null
  durationMs: number | null
}

interface ExecutionDetail extends ExecutionSummary {
  logs: ExecutionLog[]
}

const STATUS_BADGE: Record<string, string> = {
  COMPLETED: 'bg-green-600 text-white',
  FAILED: 'bg-red-500 text-white',
  RUNNING: 'bg-blue-500 text-white animate-pulse',
  PENDING: 'bg-gray-400 text-white',
  CANCELLED: 'bg-gray-400 text-white',
}

const LOG_STATUS: Record<string, string> = {
  completed: 'bg-green-600 text-white',
  error: 'bg-red-500 text-white',
  running: 'bg-blue-500 text-white',
  skipped: 'bg-gray-400 text-white',
}

function formatDuration(ms: number | null) {
  if (ms === null) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function ExecutionRow({ execution, workflowId }: { execution: ExecutionSummary; workflowId: string }) {
  const [expanded, setExpanded] = useState(false)

  const { data, isFetching } = useQuery<{ data: ExecutionDetail }>({
    queryKey: ['execution-detail', execution.id],
    queryFn: () => fetch(`/api/executions/${execution.id}`).then((r) => r.json()),
    enabled: expanded,
    staleTime: 30_000,
  })

  const detail = data?.data

  return (
    <div className="border rounded-md overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}

        <Badge className={cn('text-[10px] h-4 shrink-0', STATUS_BADGE[execution.status])}>
          {execution.status}
        </Badge>

        {execution.isDemo && (
          <Badge variant="outline" className="text-[10px] h-4 shrink-0">Demo</Badge>
        )}

        <span className="flex-1 text-xs text-muted-foreground truncate">
          {execution.startedAt
            ? formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })
            : 'Just now'}
        </span>

        <span className="text-xs text-muted-foreground shrink-0">
          {formatDuration(execution.durationMs)}
        </span>

        {execution.totalTokens > 0 && (
          <span className="text-[10px] text-muted-foreground shrink-0">
            {execution.totalTokens.toLocaleString()} tk
          </span>
        )}
        {execution.totalCost > 0 && (
          <span className="text-[10px] text-muted-foreground shrink-0">
            ${execution.totalCost.toFixed(4)}
          </span>
        )}
      </button>

      {expanded && (
        <div className="border-t bg-muted/20 px-3 py-2 space-y-1.5">
          {isFetching && !detail ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : detail?.logs.length ? (
            detail.logs.map((log) => (
              <div key={log.id} className="flex items-center gap-2 text-xs">
                <Badge className={cn('text-[10px] h-4 shrink-0', LOG_STATUS[log.status])}>
                  {log.status}
                </Badge>
                <span className="flex-1 truncate">{log.nodeLabel}</span>
                {log.durationMs !== null && (
                  <span className="text-muted-foreground shrink-0">{formatDuration(log.durationMs)}</span>
                )}
                {log.tokenUsage ? (
                  <span className="text-muted-foreground shrink-0">{log.tokenUsage} tk</span>
                ) : null}
                {log.error && (
                  <span className="text-destructive text-[10px] truncate max-w-[120px]" title={log.error}>
                    {log.error}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-1">No logs available.</p>
          )}
        </div>
      )}
    </div>
  )
}

interface HistoryPanelProps {
  workflowId: string
}

export function HistoryPanel({ workflowId }: HistoryPanelProps) {
  const { data, isFetching, isError, refetch } = useQuery<{ data: ExecutionSummary[] }>({
    queryKey: ['executions', workflowId],
    queryFn: () =>
      fetch(`/api/executions?workflowId=${workflowId}`).then((r) => r.json()),
    staleTime: 10_000,
  })

  const executions = data?.data ?? []

  return (
    <div className="w-72 border-l bg-background flex flex-col overflow-hidden shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <h3 className="text-sm font-semibold">Run History</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isFetching && executions.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center py-8 gap-2 text-center">
            <p className="text-sm text-destructive">Failed to load history</p>
            <button
              onClick={() => refetch()}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Try again
            </button>
          </div>
        ) : executions.length === 0 ? (
          <div className="text-center py-8 space-y-1">
            <p className="text-sm text-muted-foreground">No runs yet</p>
            <p className="text-xs text-muted-foreground">
              Hit Run to execute this workflow
            </p>
          </div>
        ) : (
          executions.map((e) => (
            <ExecutionRow key={e.id} execution={e} workflowId={workflowId} />
          ))
        )}
      </div>
    </div>
  )
}
