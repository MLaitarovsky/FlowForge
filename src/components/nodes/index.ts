import { TextInputNode } from './TextInputNode'
import { LLMPromptNode } from './LLMPromptNode'
import { TextOutputNode } from './TextOutputNode'
import { DocumentUploadNode } from './DocumentUploadNode'
import { ChunkerNode } from './ChunkerNode'
import { RetrieverNode } from './RetrieverNode'
import { StructuredExtractorNode } from './StructuredExtractorNode'
import { LLMChainNode } from './LLMChainNode'
import { ConditionalBranchNode } from './ConditionalBranchNode'
import { JsonOutputNode } from './JsonOutputNode'

export const nodeTypes = {
  textInput: TextInputNode,
  llmPrompt: LLMPromptNode,
  textOutput: TextOutputNode,
  documentUpload: DocumentUploadNode,
  chunker: ChunkerNode,
  retriever: RetrieverNode,
  structuredExtractor: StructuredExtractorNode,
  llmChain: LLMChainNode,
  conditionalBranch: ConditionalBranchNode,
  jsonOutput: JsonOutputNode,
} as const
