import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function getOwnedWorkflow(workflowId: string, userId: string) {
  return prisma.workflow.findFirst({
    where: { id: workflowId, userId },
  })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workflow = await prisma.workflow.findFirst({
    where: {
      id: params.id,
      OR: [{ userId: session.user.id }, { isTemplate: true }],
    },
    include: {
      nodes: true,
      edges: true,
    },
  })

  if (!workflow) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ data: workflow })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const owned = await getOwnedWorkflow(params.id, session.user.id)
  if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json() as { name?: string; description?: string }

  const workflow = await prisma.workflow.update({
    where: { id: params.id },
    data: {
      name: body.name?.trim() ?? owned.name,
      description: body.description?.trim() ?? owned.description,
    },
    select: { id: true, name: true, description: true, updatedAt: true },
  })

  return NextResponse.json({ data: workflow })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const owned = await getOwnedWorkflow(params.id, session.user.id)
  if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.workflow.delete({ where: { id: params.id } })

  return NextResponse.json({ data: { ok: true } })
}
