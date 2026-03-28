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
import type { ConditionalBranchNodeData } from '@/types/nodes'

interface Props {
  nodeId: string
  data: ConditionalBranchNodeData
}

export function ConditionalBranchConfig({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore()

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cb-label">Label</Label>
        <Input
          id="cb-label"
          value={data.label}
          onChange={(e) => updateNodeData(nodeId, { label: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Condition type</Label>
        <Select
          value={data.condition}
          onValueChange={(v) =>
            updateNodeData(nodeId, { condition: v as ConditionalBranchNodeData['condition'] })
          }
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="regex">Regex match</SelectItem>
            <SelectItem value="json_path">JSON path truthy</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cb-value">
          {data.condition === 'regex' ? 'Pattern' : data.condition === 'json_path' ? 'Path (e.g. result.ok)' : 'Value'}
        </Label>
        <Input
          id="cb-value"
          value={data.value}
          onChange={(e) => updateNodeData(nodeId, { value: e.target.value })}
          placeholder={
            data.condition === 'regex'
              ? '^[A-Z].*'
              : data.condition === 'json_path'
                ? 'status.active'
                : 'expected text'
          }
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="cb-case"
          type="checkbox"
          checked={data.caseSensitive}
          onChange={(e) => updateNodeData(nodeId, { caseSensitive: e.target.checked })}
          className="h-4 w-4 rounded border-border"
        />
        <Label htmlFor="cb-case">Case sensitive</Label>
      </div>
      <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
        <p>True → upper output handle</p>
        <p>False → lower output handle</p>
      </div>
    </div>
  )
}
