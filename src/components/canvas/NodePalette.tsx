'use client'

import { cn } from '@/lib/utils'
import {
  Type,
  Sparkles,
  FileText,
  FileUp,
  Scissors,
  Search,
  Braces,
  Link2,
  GitBranch,
  Code2,
} from 'lucide-react'
import type { NodeType } from '@/types/nodes'

interface PaletteItem {
  type: NodeType
  label: string
  description: string
  icon: React.ReactNode
  color: string
}

interface PaletteCategory {
  label: string
  items: PaletteItem[]
}

const PALETTE_CATEGORIES: PaletteCategory[] = [
  {
    label: 'Input',
    items: [
      {
        type: 'textInput',
        label: 'Text Input',
        description: 'Provide text to the pipeline',
        icon: <Type className="h-4 w-4" />,
        color: 'bg-emerald-600',
      },
      {
        type: 'documentUpload',
        label: 'Document Upload',
        description: 'Upload PDF, DOCX, or TXT',
        icon: <FileUp className="h-4 w-4" />,
        color: 'bg-emerald-600',
      },
    ],
  },
  {
    label: 'Processing',
    items: [
      {
        type: 'chunker',
        label: 'Chunker',
        description: 'Split text into chunks',
        icon: <Scissors className="h-4 w-4" />,
        color: 'bg-blue-600',
      },
      {
        type: 'retriever',
        label: 'Retriever',
        description: 'RAG vector search',
        icon: <Search className="h-4 w-4" />,
        color: 'bg-blue-600',
      },
    ],
  },
  {
    label: 'AI',
    items: [
      {
        type: 'llmPrompt',
        label: 'LLM Prompt',
        description: 'Call an AI model',
        icon: <Sparkles className="h-4 w-4" />,
        color: 'bg-violet-600',
      },
      {
        type: 'structuredExtractor',
        label: 'Structured Extractor',
        description: 'Extract JSON from text',
        icon: <Braces className="h-4 w-4" />,
        color: 'bg-violet-600',
      },
      {
        type: 'llmChain',
        label: 'LLM Chain',
        description: 'Multi-step LLM pipeline',
        icon: <Link2 className="h-4 w-4" />,
        color: 'bg-violet-600',
      },
    ],
  },
  {
    label: 'Control',
    items: [
      {
        type: 'conditionalBranch',
        label: 'Conditional Branch',
        description: 'Route by condition',
        icon: <GitBranch className="h-4 w-4" />,
        color: 'bg-orange-600',
      },
    ],
  },
  {
    label: 'Output',
    items: [
      {
        type: 'textOutput',
        label: 'Text Output',
        description: 'Display pipeline results',
        icon: <FileText className="h-4 w-4" />,
        color: 'bg-amber-600',
      },
      {
        type: 'jsonOutput',
        label: 'JSON Output',
        description: 'Display JSON results',
        icon: <Code2 className="h-4 w-4" />,
        color: 'bg-amber-600',
      },
    ],
  },
]

export function NodePalette({ className }: { className?: string }) {
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: NodeType
  ) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className={cn('flex w-56 flex-col border-r bg-muted/30', className)}>
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Nodes</h2>
        <p className="text-xs text-muted-foreground">Drag onto canvas</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {PALETTE_CATEGORIES.map((category) => (
          <div key={category.label}>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
              {category.label}
            </p>
            <div className="space-y-1.5">
              {category.items.map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type)}
                  className="flex cursor-grab items-start gap-3 rounded-md border bg-card p-2.5 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
                >
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white ${item.color}`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
