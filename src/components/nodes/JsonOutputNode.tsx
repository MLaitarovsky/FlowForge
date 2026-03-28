import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { FileJson } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { JsonOutputNodeData } from '@/types/nodes'
import { useExecutionStore } from '@/store/execution'

function JsonOutputNodeInner({ id, data, selected }: NodeProps<JsonOutputNodeData>) {
  const status = useExecutionStore((s) => s.nodeStatuses[id] ?? 'idle')

  return (
    <BaseNode
      selected={selected}
      color="bg-amber-600"
      icon={<FileJson className="h-3.5 w-3.5" />}
      label={data.label}
      status={status}
    >
      <p className="text-xs text-muted-foreground">
        {data.prettyPrint ? 'Pretty print' : 'Compact'}
      </p>
      <Handle type="target" position={Position.Left} id="input" />
    </BaseNode>
  )
}

export const JsonOutputNode = memo(JsonOutputNodeInner)
