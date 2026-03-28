'use client'

import { useWorkflowStore } from '@/store/workflow'
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
import type { LLMPromptNodeData } from '@/types/nodes'
import { UpstreamVariables } from './UpstreamVariables'

interface LLMPromptConfigProps {
  nodeId: string
  data: LLMPromptNodeData
}

const ANTHROPIC_MODELS = [
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
]

const OPENAI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
]

export function LLMPromptConfig({ nodeId, data }: LLMPromptConfigProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)

  const models =
    data.provider === 'anthropic' ? ANTHROPIC_MODELS : OPENAI_MODELS

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="llm-label">Label</Label>
        <Input
          id="llm-label"
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
              provider: v as LLMPromptNodeData['provider'],
              model:
                v === 'anthropic'
                  ? 'claude-sonnet-4-6'
                  : 'gpt-4o',
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
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
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <UpstreamVariables nodeId={nodeId} />

      <div className="space-y-1.5">
        <Label htmlFor="system-prompt">System Prompt</Label>
        <Textarea
          id="system-prompt"
          rows={4}
          placeholder="You are a helpful assistant."
          value={data.systemPrompt}
          onChange={(e) =>
            updateNodeData(nodeId, { systemPrompt: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="temperature">Temperature</Label>
          <Input
            id="temperature"
            type="number"
            min={0}
            max={2}
            step={0.1}
            value={data.temperature}
            onChange={(e) =>
              updateNodeData(nodeId, {
                temperature: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="max-tokens">Max Tokens</Label>
          <Input
            id="max-tokens"
            type="number"
            min={1}
            max={100000}
            step={1}
            value={data.maxTokens}
            onChange={(e) =>
              updateNodeData(nodeId, {
                maxTokens: parseInt(e.target.value) || 1024,
              })
            }
          />
        </div>
      </div>
    </div>
  )
}
