import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Type } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { TextInputNodeData } from '@/types/nodes'
import { useExecutionStore } from '@/store/execution'

function TextInputNodeInner({ id, data, selected }: NodeProps<TextInputNodeData>) {
  const status = useExecutionStore((s) => s.nodeStatuses[id])

  return (
    <BaseNode
      selected={selected}
      color="bg-emerald-600"
      icon={<Type className="h-3 w-3" />}
      label={data.label}
      status={status}
    >
      <p className="truncate text-xs text-muted-foreground">
        {data.defaultValue || 'No default value'}
      </p>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!h-3 !w-3 !border-2 !border-emerald-600 !bg-background"
      />
    </BaseNode>
  )
}

export const TextInputNode = memo(TextInputNodeInner)
