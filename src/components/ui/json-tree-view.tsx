'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JsonTreeNodeProps {
  name: string | null
  value: unknown
  depth?: number
  defaultExpanded?: boolean
}

function getType(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

function ValueDisplay({ value }: { value: unknown }) {
  const type = getType(value)
  if (type === 'string') {
    return (
      <span className="text-green-600 dark:text-green-400">
        &quot;{String(value)}&quot;
      </span>
    )
  }
  if (type === 'number') {
    return <span className="text-blue-600 dark:text-blue-400">{String(value)}</span>
  }
  if (type === 'boolean') {
    return <span className="text-amber-600 dark:text-amber-400">{String(value)}</span>
  }
  if (type === 'null') {
    return <span className="text-muted-foreground italic">null</span>
  }
  return null
}

function JsonTreeNode({ name, value, depth = 0, defaultExpanded = true }: JsonTreeNodeProps) {
  const type = getType(value)
  const isExpandable = type === 'object' || type === 'array'
  const [expanded, setExpanded] = useState(defaultExpanded && depth < 2)

  const indent = depth * 12

  if (!isExpandable) {
    return (
      <div className="flex items-baseline gap-1 text-[11px] font-mono leading-5" style={{ paddingLeft: indent }}>
        {name !== null && (
          <span className="text-foreground/70 shrink-0">{name}:</span>
        )}
        <ValueDisplay value={value} />
      </div>
    )
  }

  const entries = type === 'array'
    ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
    : Object.entries(value as Record<string, unknown>)

  const bracket = type === 'array' ? ['[', ']'] : ['{', '}']
  const summary = `${entries.length} ${type === 'array' ? 'item' : 'key'}${entries.length !== 1 ? 's' : ''}`

  return (
    <div style={{ paddingLeft: indent }}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-0.5 text-[11px] font-mono leading-5 hover:bg-muted/60 rounded px-0.5 w-full text-left"
      >
        {expanded
          ? <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          : <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        }
        {name !== null && (
          <span className="text-foreground/70 mr-1">{name}:</span>
        )}
        <span className="text-muted-foreground">{bracket[0]}</span>
        {!expanded && (
          <span className="text-muted-foreground ml-1">{summary}{bracket[1]}</span>
        )}
      </button>
      {expanded && (
        <div>
          {entries.map(([k, v]) => (
            <JsonTreeNode
              key={k}
              name={type === 'array' ? null : k}
              value={v}
              depth={depth + 1}
              defaultExpanded={defaultExpanded}
            />
          ))}
          <div
            className="text-[11px] font-mono text-muted-foreground leading-5"
            style={{ paddingLeft: 4 }}
          >
            {bracket[1]}
          </div>
        </div>
      )}
    </div>
  )
}

interface JsonTreeViewProps {
  data: unknown
  className?: string
}

export function JsonTreeView({ data, className }: JsonTreeViewProps) {
  const type = getType(data)
  const isExpandable = type === 'object' || type === 'array'

  if (!isExpandable) {
    return (
      <div className={cn('text-[11px] font-mono', className)}>
        <ValueDisplay value={data} />
      </div>
    )
  }

  return (
    <div className={cn('text-[11px] font-mono', className)}>
      <JsonTreeNode name={null} value={data} depth={0} defaultExpanded={true} />
    </div>
  )
}
