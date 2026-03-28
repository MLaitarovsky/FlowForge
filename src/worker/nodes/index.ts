import type { NodeType } from '@/types/nodes'
import type { NodeExecutor } from './types'
import { TextInputExecutor } from './text-input.executor'
import { TextOutputExecutor } from './text-output.executor'
import { LLMPromptExecutor } from './llm-prompt.executor'
import { DocumentUploadExecutor } from './document-upload.executor'
import { ChunkerExecutor } from './chunker.executor'
import { RetrieverExecutor } from './retriever.executor'
import { StructuredExtractorExecutor } from './structured-extractor.executor'
import { LLMChainExecutor } from './llm-chain.executor'
import { ConditionalBranchExecutor } from './conditional-branch.executor'
import { JsonOutputExecutor } from './json-output.executor'

const registry: Record<NodeType, NodeExecutor> = {
  textInput: new TextInputExecutor(),
  textOutput: new TextOutputExecutor(),
  llmPrompt: new LLMPromptExecutor(),
  documentUpload: new DocumentUploadExecutor(),
  chunker: new ChunkerExecutor(),
  retriever: new RetrieverExecutor(),
  structuredExtractor: new StructuredExtractorExecutor(),
  llmChain: new LLMChainExecutor(),
  conditionalBranch: new ConditionalBranchExecutor(),
  jsonOutput: new JsonOutputExecutor(),
}

export function getExecutor(nodeType: NodeType): NodeExecutor {
  const executor = registry[nodeType]
  if (!executor) throw new Error(`No executor registered for node type: ${nodeType}`)
  return executor
}
