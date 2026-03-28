import type { Node, Edge } from 'reactflow'
import type { NodeData, NodeType } from '@/types/nodes'
import type { WorkflowNodeDTO, WorkflowEdgeDTO } from '@/types/workflow'

/**
 * Convert React Flow nodes/edges → DB-friendly DTOs for save API
 */
export function serializeNodes(nodes: Node<NodeData>[]): WorkflowNodeDTO[] {
  return nodes.map((n) => ({
    id: n.id,
    type: n.type as NodeType,
    label: (n.data as { label: string }).label,
    positionX: n.position.x,
    positionY: n.position.y,
    config: n.data,
  }))
}

export function serializeEdges(edges: Edge[]): WorkflowEdgeDTO[] {
  return edges.map((e) => ({
    id: e.id,
    sourceId: e.source,
    targetId: e.target,
    sourcePort: e.sourceHandle ?? undefined,
    targetPort: e.targetHandle ?? undefined,
  }))
}

/**
 * Convert DB records → React Flow nodes/edges for canvas load
 */
export function deserializeNodes(dtos: WorkflowNodeDTO[]): Node<NodeData>[] {
  return dtos.map((dto) => ({
    id: dto.id,
    type: dto.type,
    position: { x: dto.positionX, y: dto.positionY },
    data: dto.config,
  }))
}

export function deserializeEdges(dtos: WorkflowEdgeDTO[]): Edge[] {
  return dtos.map((dto) => ({
    id: dto.id,
    source: dto.sourceId,
    target: dto.targetId,
    sourceHandle: dto.sourcePort ?? null,
    targetHandle: dto.targetPort ?? null,
  }))
}
