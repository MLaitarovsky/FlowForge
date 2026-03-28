'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWorkflowStore } from '@/store/workflow'
import type { StructuredExtractorNodeData } from '@/types/nodes'

interface Props {
  nodeId: string
  data: StructuredExtractorNodeData
}

const ANTHROPIC_MODELS = ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001', 'claude-opus-4-6']
const OPENAI_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']

export function StructuredExtractorConfig({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore()
  const models = data.provider === 'openai' ? OPENAI_MODELS : ANTHROPIC_MODELS

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="se-label">Label</Label>
        <Input
          id="se-label"
          value={data.label}
          onChange={(e) => updateNodeData(nodeId, { label: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Provider</Label>
        <Select
          value={data.provider}
          onValueChange={(v) =>
            updateNodeData(nodeId, {
              provider: v as StructuredExtractorNodeData['provider'],
              model: v === 'openai' ? 'gpt-4o' : 'claude-sonnet-4-6',
            })
          }
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Model</Label>
        <Select
          value={data.model}
          onValueChange={(v) => updateNodeData(nodeId, { model: v })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="se-schema">JSON Schema</Label>
        <Textarea
          id="se-schema"
          rows={6}
          className="font-mono text-xs"
          value={data.jsonSchema}
          onChange={(e) => updateNodeData(nodeId, { jsonSchema: e.target.value })}
          placeholder={'{\n  "name": "string",\n  "age": "number"\n}'}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="se-instructions">Instructions</Label>
        <Textarea
          id="se-instructions"
          rows={3}
          value={data.instructions}
          onChange={(e) => updateNodeData(nodeId, { instructions: e.target.value })}
          placeholder="Extract the person's name and age from the text."
        />
      </div>
    </div>
  )
}
