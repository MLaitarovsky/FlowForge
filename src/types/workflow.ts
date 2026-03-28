import type { NodeType, NodeData } from './nodes'

export interface WorkflowNodeDTO {
  id: string
  type: NodeType
  label: string
  positionX: number
  positionY: number
  config: NodeData
}

export interface WorkflowEdgeDTO {
  id: string
  sourceId: string
  targetId: string
  sourcePort?: string
  targetPort?: string
}

export interface WorkflowDTO {
  id: string
  name: string
  description?: string
  nodes: WorkflowNodeDTO[]
  edges: WorkflowEdgeDTO[]
  createdAt: string
  updatedAt: string
}
