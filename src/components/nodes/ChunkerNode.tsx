import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Scissors } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { ChunkerNodeData } from '@/types/nodes'
import { useExecutionStore } from '@/store/execution'

function ChunkerNodeInner({ id, data, selected }: NodeProps<ChunkerNodeData>) {
  const status = useExecutionStore((s) => s.nodeStatuses[id] ?? 'idle')

  return (
    <BaseNode
      selected={selected}
      color="bg-blue-600"
      icon={<Scissors className="h-3.5 w-3.5" />}
      label={data.label}
      status={status}
    >
      <p className="text-xs text-muted-foreground">
        {data.strategy} · {data.chunkSize} chars
      </p>
      <Handle type="target" position={Position.Left} id="input" />
      <Handle type="source" position={Position.Right} id="output" />
    </BaseNode>
  )
}

export const ChunkerNode = memo(ChunkerNodeInner)
