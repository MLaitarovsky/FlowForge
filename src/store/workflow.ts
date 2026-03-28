import { create } from 'zustand'
import {
  type Node,
  type Edge,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
  addEdge,
} from 'reactflow'
import type { NodeData, NodeType } from '@/types/nodes'
import { NODE_PORT_DEFS } from '@/types/nodes'

interface WorkflowState {
  nodes: Node<NodeData>[]
  edges: Edge[]
  selectedNodeId: string | null
  workflowId: string | null
  workflowName: string
  isDirty: boolean
  isTemplate: boolean
  templateSlug: string | null

  // Actions
  setWorkflowMeta: (id: string, name: string) => void
  setNodes: (nodes: Node<NodeData>[]) => void
  setEdges: (edges: Edge[]) => void
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  addNode: (type: NodeType, position: { x: number; y: number }) => void
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void
  setSelectedNodeId: (id: string | null) => void
  loadWorkflow: (
    id: string,
    name: string,
    nodes: Node<NodeData>[],
    edges: Edge[],
    isTemplate?: boolean,
    templateSlug?: string | null
  ) => void
  markSaved: () => void
  reset: () => void
}

const DEFAULT_NODE_DATA: Record<NodeType, NodeData> = {
  textInput: { label: 'Text Input', defaultValue: '' },
  llmPrompt: {
    label: 'LLM Prompt',
    model: 'claude-sonnet-4-6',
    systemPrompt: 'You are a helpful assistant.',
    temperature: 0.7,
    maxTokens: 1024,
    provider: 'anthropic',
  },
  textOutput: { label: 'Text Output', format: 'plain' },
  documentUpload: { label: 'Document Upload', fileName: '', fileType: 'txt', fileContent: '', collectionName: '' },
  chunker: { label: 'Chunker', strategy: 'fixed', chunkSize: 500, overlap: 50 },
  retriever: { label: 'Retriever', collectionName: '', topK: 5, embeddingProvider: 'openai' },
  structuredExtractor: {
    label: 'Structured Extractor',
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    jsonSchema: '',
    instructions: '',
  },
  llmChain: {
    label: 'LLM Chain',
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    steps: [{ systemPrompt: 'You are a helpful assistant.', userPromptTemplate: '{{input}}' }],
  },
  conditionalBranch: {
    label: 'Conditional Branch',
    condition: 'contains',
    value: '',
    caseSensitive: false,
  },
  jsonOutput: { label: 'JSON Output', query: '', prettyPrint: true },
}

function isValidConnection(
  source: string,
  sourceHandle: string | null | undefined,
  target: string,
  targetHandle: string | null | undefined,
  nodes: Node<NodeData>[]
): boolean {
  // Prevent self-connections
  if (source === target) return false

  const sourceNode = nodes.find((n) => n.id === source)
  const targetNode = nodes.find((n) => n.id === target)
  if (!sourceNode || !targetNode) return false

  const sourceType = sourceNode.type as NodeType
  const targetType = targetNode.type as NodeType

  const sourceDef = NODE_PORT_DEFS[sourceType]
  const targetDef = NODE_PORT_DEFS[targetType]

  const sourcePort = sourceDef.outputs.find(
    (p) => p.id === (sourceHandle ?? 'output')
  )
  const targetPort = targetDef.inputs.find(
    (p) => p.id === (targetHandle ?? 'input')
  )

  if (!sourcePort || !targetPort) return false
  return sourcePort.type === targetPort.type
}

let nodeCounter = 0

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  workflowId: null,
  workflowName: 'Untitled Workflow',
  isDirty: false,
  isTemplate: false,
  templateSlug: null,

  setWorkflowMeta: (id, name) => set({ workflowId: id, workflowName: name }),

  setNodes: (nodes) => set({ nodes, isDirty: true }),

  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as Node<NodeData>[],
      isDirty: true,
    })),

  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      isDirty: true,
    })),

  onConnect: (connection) => {
    const { nodes } = get()
    if (
      !isValidConnection(
        connection.source!,
        connection.sourceHandle,
        connection.target!,
        connection.targetHandle,
        nodes
      )
    ) {
      return
    }
    set((state) => ({
      edges: addEdge({ ...connection, animated: true }, state.edges),
      isDirty: true,
    }))
  },

  addNode: (type, position) => {
    nodeCounter++
    const id = `${type}-${Date.now()}-${nodeCounter}`
    const data = { ...DEFAULT_NODE_DATA[type] }
    const newNode: Node<NodeData> = { id, type, position, data }
    set((state) => ({
      nodes: [...state.nodes, newNode],
      isDirty: true,
    }))
  },

  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
      isDirty: true,
    })),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  loadWorkflow: (id, name, nodes, edges, isTemplate = false, templateSlug = null) =>
    set({ workflowId: id, workflowName: name, nodes, edges, isDirty: false, selectedNodeId: null, isTemplate, templateSlug }),

  markSaved: () => set({ isDirty: false }),

  reset: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      workflowId: null,
      workflowName: 'Untitled Workflow',
      isDirty: false,
      isTemplate: false,
      templateSlug: null,
    }),
}))
