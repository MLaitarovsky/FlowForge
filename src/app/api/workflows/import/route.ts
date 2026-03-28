import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { WorkflowNodeDTO, WorkflowEdgeDTO } from '@/types/workflow'

export const dynamic = 'force-dynamic'
import type { NodeType } from '@/types/nodes'

const VALID_NODE_TYPES = new Set<string>([
  'textInput', 'llmPrompt', 'textOutput', 'documentUpload',
  'chunker', 'retriever', 'structuredExtractor', 'llmChain',
  'conditionalBranch', 'jsonOutput',
])

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    name?: unknown
    nodes?: unknown
    edges?: unknown
  }

  if (typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (!Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
    return NextResponse.json({ error: 'nodes and edges arrays are required' }, { status: 400 })
  }

  // Validate and normalise nodes from React Flow format
  const nodes: WorkflowNodeDTO[] = []
  for (const n of body.nodes as Record<string, unknown>[]) {
    if (typeof n.id !== 'string') continue
    if (typeof n.type !== 'string' || !VALID_NODE_TYPES.has(n.type)) continue
    const pos = (n.position ?? {}) as Record<string, unknown>
    const data = (n.data ?? {}) as Record<string, unknown>
    nodes.push({
      id: n.id,
      type: n.type as NodeType,
      label: typeof data.label === 'string' ? data.label : n.type,
      positionX: typeof pos.x === 'number' ? pos.x : 0,
      positionY: typeof pos.y === 'number' ? pos.y : 0,
      config: data as unknown as WorkflowNodeDTO['config'],
    })
  }

  // Validate edges from React Flow format
  const edges: WorkflowEdgeDTO[] = []
  for (const e of body.edges as Record<string, unknown>[]) {
    if (typeof e.id !== 'string') continue
    if (typeof e.source !== 'string' || typeof e.target !== 'string') continue
    edges.push({
      id: e.id,
      sourceId: e.source,
      targetId: e.target,
      sourcePort: typeof e.sourceHandle === 'string' ? e.sourceHandle : undefined,
      targetPort: typeof e.targetHandle === 'string' ? e.targetHandle : undefined,
    })
  }

  const name = `${body.name.trim()} (imported)`

  const workflow = await prisma.$transaction(async (tx) => {
    const wf = await tx.workflow.create({
      data: { name, userId: session.user.id },
      select: { id: true },
    })
    if (nodes.length > 0) {
      await tx.workflowNode.createMany({
        data: nodes.map((n) => ({
          id: n.id,
          workflowId: wf.id,
          type: n.type,
          label: n.label,
          positionX: n.positionX,
          positionY: n.positionY,
          config: n.config as unknown as Prisma.InputJsonValue,
        })),
      })
    }
    if (edges.length > 0) {
      await tx.workflowEdge.createMany({
        data: edges.map((e) => ({
          id: e.id,
          workflowId: wf.id,
          sourceId: e.sourceId,
          targetId: e.targetId,
          sourcePort: e.sourcePort ?? null,
          targetPort: e.targetPort ?? null,
        })),
      })
    }
    return wf
  })

  return NextResponse.json({ data: { workflowId: workflow.id } }, { status: 201 })
}
