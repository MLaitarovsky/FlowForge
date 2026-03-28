'use client'

import { useWorkflowStore } from '@/store/workflow'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { TextInputNodeData } from '@/types/nodes'

interface TextInputConfigProps {
  nodeId: string
  data: TextInputNodeData
}

export function TextInputConfig({ nodeId, data }: TextInputConfigProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={data.label}
          onChange={(e) => updateNodeData(nodeId, { label: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="defaultValue">Default Value</Label>
        <Textarea
          id="defaultValue"
          rows={4}
          placeholder="Enter default text..."
          value={data.defaultValue}
          onChange={(e) =>
            updateNodeData(nodeId, { defaultValue: e.target.value })
          }
        />
      </div>
    </div>
  )
}
