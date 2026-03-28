import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { FileUp } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { DocumentUploadNodeData } from '@/types/nodes'
import { useExecutionStore } from '@/store/execution'

function DocumentUploadNodeInner({ id, data, selected }: NodeProps<DocumentUploadNodeData>) {
  const status = useExecutionStore((s) => s.nodeStatuses[id] ?? 'idle')

  return (
    <BaseNode
      selected={selected}
      color="bg-emerald-600"
      icon={<FileUp className="h-3.5 w-3.5" />}
      label={data.label}
      status={status}
    >
      <p className="text-xs text-muted-foreground truncate max-w-[160px]">
        {data.fileName || 'No file selected'}
      </p>
      <Handle type="source" position={Position.Right} id="output" />
    </BaseNode>
  )
}

export const DocumentUploadNode = memo(DocumentUploadNodeInner)
