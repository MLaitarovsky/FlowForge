'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWorkflowStore } from '@/store/workflow'
import type { RetrieverNodeData } from '@/types/nodes'

interface Props {
  nodeId: string
  data: RetrieverNodeData
}

export function RetrieverConfig({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore()

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ret-label">Label</Label>
        <Input
          id="ret-label"
          value={data.label}
          onChange={(e) => updateNodeData(nodeId, { label: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ret-collection">Collection name</Label>
        <Input
          id="ret-collection"
          value={data.collectionName}
          onChange={(e) => updateNodeData(nodeId, { collectionName: e.target.value })}
          placeholder="my-documents"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ret-topk">Top-K results</Label>
        <Input
          id="ret-topk"
          type="number"
          min={1}
          max={20}
          value={data.topK}
          onChange={(e) => updateNodeData(nodeId, { topK: Number(e.target.value) })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Embedding provider</Label>
        <Select
          value={data.embeddingProvider}
          onValueChange={(v) =>
            updateNodeData(nodeId, { embeddingProvider: v as RetrieverNodeData['embeddingProvider'] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI (text-embedding-3-small)</SelectItem>
            <SelectItem value="default">ChromaDB default</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
