import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const workflowId = searchParams.get('workflowId')

  const executions = await prisma.execution.findMany({
    where: {
      workflow: { userId: session.user.id },
      ...(workflowId ? { workflowId } : {}),
    },
    select: {
      id: true,
      workflowId: true,
      status: true,
      isDemo: true,
      startedAt: true,
      endedAt: true,
      createdAt: true,
      totalTokens: true,
      totalCost: true,
      workflow: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const data = executions.map((e) => ({
    id: e.id,
    workflowId: e.workflowId,
    workflowName: e.workflow.name,
    status: e.status,
    startedAt: e.startedAt,
    endedAt: e.endedAt,
    createdAt: e.createdAt,
    durationMs:
      e.startedAt && e.endedAt
        ? e.endedAt.getTime() - e.startedAt.getTime()
        : null,
    totalTokens: e.totalTokens,
    totalCost: e.totalCost,
  }))

  return NextResponse.json({ data })
}
