'use client'

import { useState } from 'react'
import { useWorkflowStore } from '@/store/workflow'
import { Check, Copy } from 'lucide-react'

interface UpstreamVariablesProps {
  nodeId: string
}

export function UpstreamVariables({ nodeId }: UpstreamVariablesProps) {
  const { nodes, edges } = useWorkflowStore()
  const [copied, setCopied] = useState<string | null>(null)

  const upstreamIds = edges.filter((e) => e.target === nodeId).map((e) => e.source)
  const upstreamNodes = nodes.filter((n) => upstreamIds.includes(n.id))

  if (upstreamNodes.length === 0) return null

  const handleCopy = (id: string) => {
    const syntax = `{{${id}.output}}`
    navigator.clipboard.writeText(syntax).catch(() => null)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground font-medium">Available variables</p>
      <div className="flex flex-wrap gap-1.5">
        {upstreamNodes.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => handleCopy(node.id)}
            className="inline-flex items-center gap-1 text-[10px] font-mono bg-muted px-2 py-1 rounded hover:bg-primary/10 transition-colors"
            title={`Click to copy: {{${node.id}.output}}`}
          >
            {copied === node.id ? (
              <Check className="h-2.5 w-2.5 text-green-600" />
            ) : (
              <Copy className="h-2.5 w-2.5 text-muted-foreground" />
            )}
            {`{{${node.data.label}.output}}`}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">
        Click a variable to copy. Paste into any prompt field to inject upstream output.
      </p>
    </div>
  )
}
