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
import type { ChunkerNodeData } from '@/types/nodes'

interface Props {
  nodeId: string
  data: ChunkerNodeData
}

export function ChunkerConfig({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore()

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="chunker-label">Label</Label>
        <Input
          id="chunker-label"
          value={data.label}
          onChange={(e) => updateNodeData(nodeId, { label: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Strategy</Label>
        <Select
          value={data.strategy}
          onValueChange={(v) =>
            updateNodeData(nodeId, { strategy: v as ChunkerNodeData['strategy'] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Fixed size</SelectItem>
            <SelectItem value="sentence">By sentence</SelectItem>
            <SelectItem value="paragraph">By paragraph</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="chunk-size">Chunk size (chars)</Label>
        <Input
          id="chunk-size"
          type="number"
          min={50}
          max={4000}
          value={data.chunkSize}
          onChange={(e) => updateNodeData(nodeId, { chunkSize: Number(e.target.value) })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="chunk-overlap">Overlap (chars)</Label>
        <Input
          id="chunk-overlap"
          type="number"
          min={0}
          max={500}
          value={data.overlap}
          onChange={(e) => updateNodeData(nodeId, { overlap: Number(e.target.value) })}
        />
      </div>
    </div>
  )
}
