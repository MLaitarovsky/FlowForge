'use client'

import { useWorkflowStore } from '@/store/workflow'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TextOutputNodeData } from '@/types/nodes'

interface TextOutputConfigProps {
  nodeId: string
  data: TextOutputNodeData
}

export function TextOutputConfig({ nodeId, data }: TextOutputConfigProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="out-label">Label</Label>
        <Input
          id="out-label"
          value={data.label}
          onChange={(e) => updateNodeData(nodeId, { label: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Output Format</Label>
        <Select
          value={data.format}
          onValueChange={(v) =>
            updateNodeData(nodeId, {
              format: v as TextOutputNodeData['format'],
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="plain">Plain Text</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
