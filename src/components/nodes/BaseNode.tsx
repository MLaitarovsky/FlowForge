import { memo, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { NodeStatus } from '@/store/execution'

interface BaseNodeProps {
  selected: boolean
  color: string
  icon: ReactNode
  label: string
  children?: ReactNode
  className?: string
  status?: NodeStatus
}

const STATUS_RING: Record<NonNullable<NodeStatus>, string> = {
  idle: '',
  running: 'ring-2 ring-blue-400 ring-offset-1 animate-pulse',
  completed: 'ring-2 ring-green-500 ring-offset-1',
  error: 'ring-2 ring-red-500 ring-offset-1',
  skipped: 'ring-2 ring-gray-400 ring-offset-1 ring-dashed',
}

function BaseNodeInner({
  selected,
  color,
  icon,
  label,
  children,
  className,
  status = 'idle',
}: BaseNodeProps) {
  return (
    <div
      className={cn(
        'min-w-[180px] max-w-[240px] rounded-lg border-2 bg-card shadow-md transition-shadow',
        selected ? 'border-primary shadow-lg' : 'border-border',
        STATUS_RING[status],
        className
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 rounded-t-md px-3 py-2 text-white',
          color
        )}
      >
        <span className="text-sm">{icon}</span>
        <span className="truncate text-xs font-semibold">{label}</span>
      </div>
      {children && <div className="p-2">{children}</div>}
    </div>
  )
}

export const BaseNode = memo(BaseNodeInner)
