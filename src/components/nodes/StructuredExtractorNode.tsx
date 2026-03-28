import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Braces } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { StructuredExtractorNodeData } from '@/types/nodes'
import { useExecutionStore } from '@/store/execution'

function StructuredExtractorNodeInner({ id, data, selected }: NodeProps<StructuredExtractorNodeData>) {
  const status = useExecutionStore((s) => s.nodeStatuses[id] ?? 'idle')

  return (
    <BaseNode
      selected={selected}
      color="bg-violet-600"
      icon={<Braces className="h-3.5 w-3.5" />}
      label={data.label}
      status={status}
    >
      <p className="text-xs text-muted-foreground">{data.model || 'claude-sonnet-4-6'}</p>
      <Handle type="target" position={Position.Left} id="input" />
      <Handle type="source" position={Position.Right} id="output" />
    </BaseNode>
  )
}

export const StructuredExtractorNode = memo(StructuredExtractorNodeInner)
