import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const execution = await prisma.execution.findFirst({
    where: {
      id: params.id,
      workflow: { userId: session.user.id },
    },
    include: {
      logs: {
        orderBy: { startedAt: 'asc' },
      },
      workflow: {
        select: {
          name: true,
          nodes: { select: { id: true, label: true, type: true } },
        },
      },
    },
  })

  if (!execution) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const nodeMap = Object.fromEntries(
    execution.workflow.nodes.map((n) => [n.id, { label: n.label, type: n.type }])
  )

  const data = {
    id: execution.id,
    workflowId: execution.workflowId,
    workflowName: execution.workflow.name,
    status: execution.status,
    isDemo: execution.isDemo,
    startedAt: execution.startedAt,
    endedAt: execution.endedAt,
    durationMs:
      execution.startedAt && execution.endedAt
        ? execution.endedAt.getTime() - execution.startedAt.getTime()
        : null,
    totalTokens: execution.totalTokens,
    totalCost: execution.totalCost,
    logs: execution.logs.map((l) => ({
      id: l.id,
      nodeId: l.nodeId,
      nodeLabel: nodeMap[l.nodeId]?.label ?? l.nodeId,
      nodeType: nodeMap[l.nodeId]?.type ?? 'unknown',
      status: l.status,
      tokenUsage: l.tokenUsage,
      costUsd: l.costUsd,
      error: l.error,
      startedAt: l.startedAt,
      endedAt: l.endedAt,
      durationMs:
        l.endedAt ? l.endedAt.getTime() - l.startedAt.getTime() : null,
    })),
  }

  return NextResponse.json({ data })
}
