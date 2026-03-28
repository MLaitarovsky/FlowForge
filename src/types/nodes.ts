export type NodeType =
  | 'textInput'
  | 'llmPrompt'
  | 'textOutput'
  | 'documentUpload'
  | 'chunker'
  | 'retriever'
  | 'structuredExtractor'
  | 'llmChain'
  | 'conditionalBranch'
  | 'jsonOutput'

export interface TextInputNodeData {
  label: string
  defaultValue: string
}

export interface LLMPromptNodeData {
  label: string
  model: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  provider: 'anthropic' | 'openai'
}

export interface TextOutputNodeData {
  label: string
  format: 'plain' | 'markdown'
}

export interface DocumentUploadNodeData {
  label: string
  fileName: string
  fileContent: string // base64
  fileType: 'pdf' | 'docx' | 'txt' | 'md'
  collectionName: string
}

export interface ChunkerNodeData {
  label: string
  chunkSize: number
  overlap: number
  strategy: 'fixed' | 'sentence' | 'paragraph'
}

export interface RetrieverNodeData {
  label: string
  collectionName: string
  topK: number
  embeddingProvider: 'openai' | 'default'
}

export interface StructuredExtractorNodeData {
  label: string
  provider: 'anthropic' | 'openai'
  model: string
  jsonSchema: string // JSON string
  instructions: string
}

export interface LLMChainNodeData {
  label: string
  provider: 'anthropic' | 'openai'
  model: string
  steps: Array<{ systemPrompt: string; userPromptTemplate: string }>
}

export interface ConditionalBranchNodeData {
  label: string
  condition: 'contains' | 'equals' | 'regex' | 'json_path'
  value: string
  caseSensitive: boolean
}

export interface JsonOutputNodeData {
  label: string
  query: string // JSONPath expression, optional
  prettyPrint: boolean
}

export type NodeData =
  | TextInputNodeData
  | LLMPromptNodeData
  | TextOutputNodeData
  | DocumentUploadNodeData
  | ChunkerNodeData
  | RetrieverNodeData
  | StructuredExtractorNodeData
  | LLMChainNodeData
  | ConditionalBranchNodeData
  | JsonOutputNodeData

// Port types for connection validation
export type PortType = 'text' | 'json' | 'chunks'

export interface PortDef {
  id: string
  type: PortType
  label: string
}

export const NODE_PORT_DEFS: Record<
  NodeType,
  { inputs: PortDef[]; outputs: PortDef[] }
> = {
  textInput: {
    inputs: [],
    outputs: [{ id: 'output', type: 'text', label: 'Text' }],
  },
  llmPrompt: {
    inputs: [{ id: 'input', type: 'text', label: 'Input' }],
    outputs: [{ id: 'output', type: 'text', label: 'Output' }],
  },
  textOutput: {
    inputs: [{ id: 'input', type: 'text', label: 'Input' }],
    outputs: [],
  },
  documentUpload: {
    inputs: [],
    outputs: [{ id: 'output', type: 'text', label: 'Text' }],
  },
  chunker: {
    inputs: [{ id: 'input', type: 'text', label: 'Text' }],
    outputs: [{ id: 'output', type: 'chunks', label: 'Chunks' }],
  },
  retriever: {
    inputs: [{ id: 'query', type: 'text', label: 'Query' }],
    outputs: [{ id: 'output', type: 'json', label: 'Results' }],
  },
  structuredExtractor: {
    inputs: [{ id: 'input', type: 'text', label: 'Input' }],
    outputs: [{ id: 'output', type: 'json', label: 'JSON' }],
  },
  llmChain: {
    inputs: [{ id: 'input', type: 'text', label: 'Input' }],
    outputs: [{ id: 'output', type: 'text', label: 'Output' }],
  },
  conditionalBranch: {
    inputs: [{ id: 'input', type: 'text', label: 'Input' }],
    outputs: [
      { id: 'true', type: 'text', label: 'True' },
      { id: 'false', type: 'text', label: 'False' },
    ],
  },
  jsonOutput: {
    inputs: [{ id: 'input', type: 'json', label: 'JSON' }],
    outputs: [],
  },
}
