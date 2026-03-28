import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Sparkles } from 'lucide-react'
import { BaseNode } from './BaseNode'
import { Badge } from '@/components/ui/badge'
import type { LLMPromptNodeData } from '@/types/nodes'
import { useExecutionStore } from '@/store/execution'

function LLMPromptNodeInner({ id, data, selected }: NodeProps<LLMPromptNodeData>) {
  const status = useExecutionStore((s) => s.nodeStatuses[id])

  return (
    <BaseNode
      selected={selected}
      color="bg-violet-600"
      icon={<Sparkles className="h-3 w-3" />}
      label={data.label}
      status={status}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!h-3 !w-3 !border-2 !border-violet-600 !bg-background"
      />
      <div className="flex flex-col gap-1">
        <Badge variant="secondary" className="w-fit text-[10px]">
          {data.model}
        </Badge>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {data.systemPrompt || 'No system prompt'}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!h-3 !w-3 !border-2 !border-violet-600 !bg-background"
      />
    </BaseNode>
  )
}

export const LLMPromptNode = memo(LLMPromptNodeInner)
