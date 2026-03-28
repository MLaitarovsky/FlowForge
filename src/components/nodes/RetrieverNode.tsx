import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Database } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { RetrieverNodeData } from '@/types/nodes'
import { useExecutionStore } from '@/store/execution'

function RetrieverNodeInner({ id, data, selected }: NodeProps<RetrieverNodeData>) {
  const status = useExecutionStore((s) => s.nodeStatuses[id] ?? 'idle')

  return (
    <BaseNode
      selected={selected}
      color="bg-blue-600"
      icon={<Database className="h-3.5 w-3.5" />}
      label={data.label}
      status={status}
    >
      <p className="text-xs text-muted-foreground truncate max-w-[160px]">
        {data.collectionName || 'default'} · top-{data.topK}
      </p>
      <Handle type="target" position={Position.Left} id="query" />
      <Handle type="source" position={Position.Right} id="output" />
    </BaseNode>
  )
}

export const RetrieverNode = memo(RetrieverNodeInner)
