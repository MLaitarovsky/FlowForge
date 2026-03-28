'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useWorkflowStore } from '@/store/workflow'
import type { JsonOutputNodeData } from '@/types/nodes'

interface Props {
  nodeId: string
  data: JsonOutputNodeData
}

export function JsonOutputConfig({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore()

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="jo-label">Label</Label>
        <Input
          id="jo-label"
          value={data.label}
          onChange={(e) => updateNodeData(nodeId, { label: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="jo-query">JSONPath query (optional)</Label>
        <Input
          id="jo-query"
          value={data.query}
          onChange={(e) => updateNodeData(nodeId, { query: e.target.value })}
          placeholder="$.results[0]"
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Leave empty to display the full JSON response
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="jo-pretty"
          type="checkbox"
          checked={data.prettyPrint}
          onChange={(e) => updateNodeData(nodeId, { prettyPrint: e.target.checked })}
          className="h-4 w-4 rounded border-border"
        />
        <Label htmlFor="jo-pretty">Pretty print</Label>
      </div>
    </div>
  )
}
