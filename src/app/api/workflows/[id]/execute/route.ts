import { NextResponse } from 'next/server'
import { Queue } from 'bullmq'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { topoSort } from '@/worker/graph'

export const dynamic = 'force-dynamic'
import { QUEUE_NAME } from '@/worker/constants'

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6381'

const executionQueue = new Queue(QUEUE_NAME, {
  connection: { url: REDIS_URL },
})

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const workflowId = params.id

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId, userId: session.user.id },
    include: { nodes: true, edges: true },
  })

  if (!workflow) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  }

  if (workflow.nodes.length === 0) {
    return NextResponse.json(
      { error: 'Workflow has no nodes. Add at least one node before running.' },
      { status: 400 }
    )
  }

  // Validate no cycles
  try {
    topoSort(
      workflow.nodes.map((n) => ({ id: n.id })),
      workflow.edges.map((e) => ({
        source: e.sourceId,
        target: e.targetId,
        sourceHandle: e.sourcePort,
        targetHandle: e.targetPort,
      }))
    )
  } catch {
    return NextResponse.json(
      { error: 'Workflow contains a cycle and cannot be executed.' },
      { status: 400 }
    )
  }

  // Create execution record
  const execution = await prisma.execution.create({
    data: {
      workflowId,
      status: 'PENDING',
    },
  })

  // Enqueue job
  await executionQueue.add(
    'execute',
    { executionId: execution.id, workflowId, userId: session.user.id },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
    }
  )

  return NextResponse.json({ data: { executionId: execution.id } })
}
