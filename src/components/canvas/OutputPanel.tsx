'use client'

import { useState, useRef, useCallback } from 'react'
import { useWorkflowStore } from '@/store/workflow'
import { useExecutionStore } from '@/store/execution'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { JsonTreeView } from '@/components/ui/json-tree-view'

type Tab = 'outputs' | 'logs'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  idle: { label: 'Idle', className: 'bg-muted text-muted-foreground' },
  running: { label: 'Running', className: 'bg-blue-500 text-white animate-pulse' },
  completed: { label: 'Completed', className: 'bg-green-600 text-white' },
  skipped: { label: 'Skipped', className: 'bg-gray-400 text-white' },
  error: { label: 'Error', className: 'bg-red-500 text-white' },
}

const MIN_HEIGHT = 80
const MAX_HEIGHT = 600
const DEFAULT_HEIGHT = 256

export function OutputPanel() {
  const [collapsed, setCollapsed] = useState(false)
  const [height, setHeight] = useState(DEFAULT_HEIGHT)
  const [tab, setTab] = useState<Tab>('outputs')
  const [expandedLogNode, setExpandedLogNode] = useState<string | null>(null)
  const heightRef = useRef(DEFAULT_HEIGHT)

  const { nodes } = useWorkflowStore()
  const { nodeStatuses, nodeOutputs, nodeErrors, status, error } = useExecutionStore()

  const onDragStart = useCallback((e: React.MouseEvent) => {
    const startY = e.clientY
    const startHeight = heightRef.current

    const onMouseMove = (ev: MouseEvent) => {
      const delta = startY - ev.clientY
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight + delta))
      heightRef.current = newHeight
      setHeight(newHeight)
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [])

  const hasActivity = Object.keys(nodeStatuses).length > 0
  if (!hasActivity) return null

  const nodesWithOutput = nodes.filter((n) => nodeOutputs[n.id] !== undefined)
  const nodesWithStatus = nodes.filter((n) => nodeStatuses[n.id])

  return (
    <div
      className="border-t bg-background flex flex-col"
      style={{ height: collapsed ? 40 : height }}
    >
      {/* Drag handle */}
      {!collapsed && (
        <div
          className="h-1 w-full cursor-row-resize hover:bg-primary/30 transition-colors shrink-0"
          onMouseDown={onDragStart}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 h-10 shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold">Execution Output</h3>
          {!collapsed && (
            <div className="flex gap-1">
              {(['outputs', 'logs'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'text-xs px-2 py-0.5 rounded',
                    tab === t
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t === 'outputs' ? 'Outputs' : 'Node Log'}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {tab === 'outputs' && (
            <>
              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}
              {nodesWithOutput.map((node) => (
                <div key={node.id} className="rounded-md border p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{node.data.label}</span>
                    {nodeStatuses[node.id] && (
                      <Badge
                        className={cn(
                          'text-[10px] h-4',
                          STATUS_BADGE[nodeStatuses[node.id]]?.className
                        )}
                      >
                        {STATUS_BADGE[nodeStatuses[node.id]]?.label}
                      </Badge>
                    )}
                  </div>
                  <div className="max-h-48 overflow-y-auto mt-1">
                    {typeof nodeOutputs[node.id] === 'object' && nodeOutputs[node.id] !== null ? (
                      <JsonTreeView data={nodeOutputs[node.id]} />
                    ) : (
                      <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap break-words font-mono">
                        {String(nodeOutputs[node.id])}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
              {nodesWithOutput.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {status === 'running' ? 'Waiting for node outputs…' : 'No outputs yet.'}
                </p>
              )}
            </>
          )}

          {tab === 'logs' && (
            <>
              {nodesWithStatus.map((node) => {
                const s = nodeStatuses[node.id]
                const isExpanded = expandedLogNode === node.id
                const hasDetail = nodeOutputs[node.id] !== undefined || nodeErrors[node.id]
                return (
                  <div key={node.id} className="rounded-md border overflow-hidden">
                    <button
                      className="w-full flex items-center gap-2 text-xs px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => setExpandedLogNode(isExpanded ? null : node.id)}
                    >
                      <Badge className={cn('text-[10px] h-4 shrink-0', STATUS_BADGE[s]?.className)}>
                        {STATUS_BADGE[s]?.label}
                      </Badge>
                      <span className="flex-1 text-muted-foreground">{node.data.label}</span>
                      {hasDetail && (
                        <ChevronRight
                          className={cn('h-3 w-3 text-muted-foreground transition-transform', isExpanded && 'rotate-90')}
                        />
                      )}
                    </button>
                    {isExpanded && hasDetail && (
                      <div className="border-t px-3 py-2 bg-muted/20 max-h-40 overflow-y-auto">
                        {nodeErrors[node.id] ? (
                          <p className="text-[11px] text-destructive font-mono whitespace-pre-wrap break-words">
                            {nodeErrors[node.id]}
                          </p>
                        ) : typeof nodeOutputs[node.id] === 'object' && nodeOutputs[node.id] !== null ? (
                          <JsonTreeView data={nodeOutputs[node.id]} />
                        ) : (
                          <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap break-words font-mono">
                            {String(nodeOutputs[node.id])}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              {nodesWithStatus.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No activity yet.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
