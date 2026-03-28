import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { GitBranch } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { ConditionalBranchNodeData } from '@/types/nodes'
import { useExecutionStore } from '@/store/execution'

function ConditionalBranchNodeInner({ id, data, selected }: NodeProps<ConditionalBranchNodeData>) {
  const status = useExecutionStore((s) => s.nodeStatuses[id] ?? 'idle')

  return (
    <BaseNode
      selected={selected}
      color="bg-orange-600"
      icon={<GitBranch className="h-3.5 w-3.5" />}
      label={data.label}
      status={status}
      className="min-w-[200px]"
    >
      <p className="text-xs text-muted-foreground">
        {data.condition}: <span className="font-mono">{data.value || '…'}</span>
      </p>
      <Handle type="target" position={Position.Left} id="input" />
      {/* Two source handles stacked vertically */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: '35%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: '65%' }}
      />
      {/* Labels for handles */}
      <div className="absolute right-[-28px] top-[25%] text-[10px] text-green-600 font-semibold">
        T
      </div>
      <div className="absolute right-[-28px] top-[57%] text-[10px] text-red-500 font-semibold">
        F
      </div>
    </BaseNode>
  )
}

export const ConditionalBranchNode = memo(ConditionalBranchNodeInner)
