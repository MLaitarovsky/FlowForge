export interface GraphNode {
  id: string
}

export interface GraphEdge {
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
}

/**
 * Topological sort using Kahn's algorithm.
 * Returns node IDs in execution order.
 * Throws if a cycle is detected.
 */
export function topoSort(nodes: GraphNode[], edges: GraphEdge[]): string[] {
  const nodeIds = new Set(nodes.map((n) => n.id))
  const inDegree = new Map<string, number>()
  const adjacency = new Map<string, string[]>()

  for (const id of nodeIds) {
    inDegree.set(id, 0)
    adjacency.set(id, [])
  }

  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1)
    adjacency.get(edge.source)!.push(edge.target)
  }

  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }

  const result: string[] = []
  while (queue.length > 0) {
    const current = queue.shift()!
    result.push(current)
    for (const neighbor of adjacency.get(current) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 0) - 1
      inDegree.set(neighbor, newDeg)
      if (newDeg === 0) queue.push(neighbor)
    }
  }

  if (result.length !== nodeIds.size) {
    throw new Error('Workflow contains a cycle and cannot be executed.')
  }

  return result
}

/**
 * For a given node, return a map of { targetHandle -> { sourceNodeId, sourceHandle } }
 * describing which upstream node output connects to each input port.
 */
export function getIncomingConnections(
  nodeId: string,
  edges: GraphEdge[]
): Array<{ sourceNodeId: string; sourceHandle: string | null; targetHandle: string | null }> {
  return edges
    .filter((e) => e.target === nodeId)
    .map((e) => ({
      sourceNodeId: e.source,
      sourceHandle: e.sourceHandle ?? null,
      targetHandle: e.targetHandle ?? null,
    }))
}

/**
 * Returns all node IDs that are reachable downstream from the given node
 * through a specific output handle (used for branch skipping).
 */
export function getDownstreamNodes(
  fromNodeId: string,
  fromHandle: string,
  edges: GraphEdge[]
): string[] {
  const result = new Set<string>()
  const queue = [{ nodeId: fromNodeId, handle: fromHandle }]

  while (queue.length > 0) {
    const { nodeId } = queue.shift()!
    for (const edge of edges) {
      if (edge.source === nodeId && !result.has(edge.target)) {
        result.add(edge.target)
        // Continue downstream from the target with any handle
        queue.push({ nodeId: edge.target, handle: '*' })
      }
    }
  }

  return Array.from(result)
}
