import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { FileText } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { TextOutputNodeData } from '@/types/nodes'
import { useExecutionStore } from '@/store/execution'

function TextOutputNodeInner({ id, data, selected }: NodeProps<TextOutputNodeData>) {
  const status = useExecutionStore((s) => s.nodeStatuses[id])

  return (
    <BaseNode
      selected={selected}
      color="bg-amber-600"
      icon={<FileText className="h-3 w-3" />}
      label={data.label}
      status={status}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!h-3 !w-3 !border-2 !border-amber-600 !bg-background"
      />
      <p className="text-xs text-muted-foreground">
        Format: <span className="font-medium">{data.format}</span>
      </p>
    </BaseNode>
  )
}

export const TextOutputNode = memo(TextOutputNodeInner)
