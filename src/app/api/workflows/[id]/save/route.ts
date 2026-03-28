import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { WorkflowNodeDTO, WorkflowEdgeDTO } from '@/types/workflow'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const owned = await prisma.workflow.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true },
  })
  if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json() as {
    name?: string
    nodes?: WorkflowNodeDTO[]
    edges?: WorkflowEdgeDTO[]
  }

  const { name, nodes = [], edges = [] } = body

  // Atomic transaction: update name, replace all nodes & edges
  await prisma.$transaction([
    prisma.workflow.update({
      where: { id: params.id },
      data: { name: name?.trim() ?? undefined, updatedAt: new Date() },
    }),
    prisma.workflowNode.deleteMany({ where: { workflowId: params.id } }),
    prisma.workflowEdge.deleteMany({ where: { workflowId: params.id } }),
    prisma.workflowNode.createMany({
      data: nodes.map((n) => ({
        id: n.id,
        workflowId: params.id,
        type: n.type,
        label: n.label,
        positionX: n.positionX,
        positionY: n.positionY,
        config: n.config as unknown as Prisma.InputJsonValue,
      })),
    }),
    prisma.workflowEdge.createMany({
      data: edges.map((e) => ({
        id: e.id,
        workflowId: params.id,
        sourceId: e.sourceId,
        targetId: e.targetId,
        sourcePort: e.sourcePort ?? null,
        targetPort: e.targetPort ?? null,
      })),
    }),
  ])

  return NextResponse.json({ data: { ok: true, savedAt: new Date().toISOString() } })
}
