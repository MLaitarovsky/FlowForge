import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Link2 } from 'lucide-react'
import { BaseNode } from './BaseNode'
import type { LLMChainNodeData } from '@/types/nodes'
import { useExecutionStore } from '@/store/execution'

function LLMChainNodeInner({ id, data, selected }: NodeProps<LLMChainNodeData>) {
  const status = useExecutionStore((s) => s.nodeStatuses[id] ?? 'idle')

  return (
    <BaseNode
      selected={selected}
      color="bg-violet-600"
      icon={<Link2 className="h-3.5 w-3.5" />}
      label={data.label}
      status={status}
    >
      <p className="text-xs text-muted-foreground">
        {data.steps?.length ?? 0} step{data.steps?.length !== 1 ? 's' : ''}
      </p>
      <Handle type="target" position={Position.Left} id="input" />
      <Handle type="source" position={Position.Right} id="output" />
    </BaseNode>
  )
}

export const LLMChainNode = memo(LLMChainNodeInner)
