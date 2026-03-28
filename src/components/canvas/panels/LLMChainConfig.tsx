'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflow'
import type { LLMChainNodeData } from '@/types/nodes'
import { UpstreamVariables } from './UpstreamVariables'

interface Props {
  nodeId: string
  data: LLMChainNodeData
}

const ANTHROPIC_MODELS = ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001', 'claude-opus-4-6']
const OPENAI_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']

export function LLMChainConfig({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore()
  const models = data.provider === 'openai' ? OPENAI_MODELS : ANTHROPIC_MODELS

  const updateStep = (index: number, field: string, value: string) => {
    const steps = [...(data.steps ?? [])]
    steps[index] = { ...steps[index], [field]: value }
    updateNodeData(nodeId, { steps })
  }

  const addStep = () => {
    const steps = [...(data.steps ?? []), { systemPrompt: '', userPromptTemplate: '{{previous}}' }]
    updateNodeData(nodeId, { steps })
  }

  const removeStep = (index: number) => {
    const steps = (data.steps ?? []).filter((_, i) => i !== index)
    updateNodeData(nodeId, { steps })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="chain-label">Label</Label>
        <Input
          id="chain-label"
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
              provider: v as LLMChainNodeData['provider'],
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

      <UpstreamVariables nodeId={nodeId} />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Chain Steps</Label>
          <Button variant="ghost" size="sm" onClick={addStep}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add step
          </Button>
        </div>
        {(data.steps ?? []).map((step, i) => (
          <div key={i} className="rounded-md border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Step {i + 1}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeStep(i)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">System prompt</Label>
              <Textarea
                rows={2}
                className="text-xs"
                value={step.systemPrompt}
                onChange={(e) => updateStep(i, 'systemPrompt', e.target.value)}
                placeholder="You are a helpful assistant."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">User prompt template</Label>
              <Textarea
                rows={2}
                className="text-xs font-mono"
                value={step.userPromptTemplate}
                onChange={(e) => updateStep(i, 'userPromptTemplate', e.target.value)}
                placeholder="Use {{previous}} for the prior output"
              />
              <p className="text-xs text-muted-foreground">Use {'{{previous}}'} for prior step output, or {'{{nodeId.output}}'} for upstream nodes</p>
            </div>
          </div>
        ))}
        {(data.steps ?? []).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No steps yet. Click &quot;Add step&quot; to begin.
          </p>
        )}
      </div>
    </div>
  )
}
