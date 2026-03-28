import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const template = await prisma.workflow.findUnique({
    where: { templateSlug: params.slug },
    select: { id: true, isTemplate: true },
  })

  if (!template || !template.isTemplate) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  const execution = await prisma.execution.create({
    data: {
      workflowId: template.id,
      status: 'RUNNING',
      isDemo: true,
      startedAt: new Date(),
    },
  })

  return NextResponse.json({ data: { executionId: execution.id } })
}
