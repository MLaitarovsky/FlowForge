'use client'

import { X, Settings } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflow'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { TextInputConfig } from './panels/TextInputConfig'
import { LLMPromptConfig } from './panels/LLMPromptConfig'
import { TextOutputConfig } from './panels/TextOutputConfig'
import { DocumentUploadConfig } from './panels/DocumentUploadConfig'
import { ChunkerConfig } from './panels/ChunkerConfig'
import { RetrieverConfig } from './panels/RetrieverConfig'
import { StructuredExtractorConfig } from './panels/StructuredExtractorConfig'
import { LLMChainConfig } from './panels/LLMChainConfig'
import { ConditionalBranchConfig } from './panels/ConditionalBranchConfig'
import { JsonOutputConfig } from './panels/JsonOutputConfig'
import type { NodeType } from '@/types/nodes'
import type {
  TextInputNodeData,
  LLMPromptNodeData,
  TextOutputNodeData,
  DocumentUploadNodeData,
  ChunkerNodeData,
  RetrieverNodeData,
  StructuredExtractorNodeData,
  LLMChainNodeData,
  ConditionalBranchNodeData,
  JsonOutputNodeData,
} from '@/types/nodes'

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  textInput: 'Text Input',
  llmPrompt: 'LLM Prompt',
  textOutput: 'Text Output',
  documentUpload: 'Document Upload',
  chunker: 'Chunker',
  retriever: 'Retriever',
  structuredExtractor: 'Structured Extractor',
  llmChain: 'LLM Chain',
  conditionalBranch: 'Conditional Branch',
  jsonOutput: 'JSON Output',
}

export function ConfigPanel() {
  const { nodes, selectedNodeId, setSelectedNodeId } = useWorkflowStore()

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  if (!selectedNode) {
    return (
      <aside className="flex w-72 flex-col items-center justify-center gap-2 border-l bg-muted/30 text-muted-foreground">
        <Settings className="h-8 w-8 opacity-30" />
        <p className="text-sm">Select a node to configure</p>
      </aside>
    )
  }

  const nodeType = selectedNode.type as NodeType

  return (
    <aside className="flex w-72 flex-col border-l bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Node Settings</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setSelectedNodeId(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {NODE_TYPE_LABELS[nodeType]}
        </p>
        <Separator className="mb-4" />
        {nodeType === 'textInput' && (
          <TextInputConfig
            nodeId={selectedNode.id}
            data={selectedNode.data as TextInputNodeData}
          />
        )}
        {nodeType === 'llmPrompt' && (
          <LLMPromptConfig
            nodeId={selectedNode.id}
            data={selectedNode.data as LLMPromptNodeData}
          />
        )}
        {nodeType === 'textOutput' && (
          <TextOutputConfig
            nodeId={selectedNode.id}
            data={selectedNode.data as TextOutputNodeData}
          />
        )}
        {nodeType === 'documentUpload' && (
          <DocumentUploadConfig
            nodeId={selectedNode.id}
            data={selectedNode.data as DocumentUploadNodeData}
          />
        )}
        {nodeType === 'chunker' && (
          <ChunkerConfig
            nodeId={selectedNode.id}
            data={selectedNode.data as ChunkerNodeData}
          />
        )}
        {nodeType === 'retriever' && (
          <RetrieverConfig
            nodeId={selectedNode.id}
            data={selectedNode.data as RetrieverNodeData}
          />
        )}
        {nodeType === 'structuredExtractor' && (
          <StructuredExtractorConfig
            nodeId={selectedNode.id}
            data={selectedNode.data as StructuredExtractorNodeData}
          />
        )}
        {nodeType === 'llmChain' && (
          <LLMChainConfig
            nodeId={selectedNode.id}
            data={selectedNode.data as LLMChainNodeData}
          />
        )}
        {nodeType === 'conditionalBranch' && (
          <ConditionalBranchConfig
            nodeId={selectedNode.id}
            data={selectedNode.data as ConditionalBranchNodeData}
          />
        )}
        {nodeType === 'jsonOutput' && (
          <JsonOutputConfig
            nodeId={selectedNode.id}
            data={selectedNode.data as JsonOutputNodeData}
          />
        )}
      </div>
    </aside>
  )
}
