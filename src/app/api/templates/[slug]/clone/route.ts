import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

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
    include: { nodes: true, edges: true },
  })

  if (!template || !template.isTemplate) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  // Create cloned workflow without nodes first
  const cloned = await prisma.workflow.create({
    data: {
      name: `${template.name} (Copy)`,
      description: template.description,
      userId: session.user.id,
      isTemplate: false,
    },
  })

  // Create nodes and build old->new ID map
  const nodeIdMap: Record<string, string> = {}
  for (const node of template.nodes) {
    const newNode = await prisma.workflowNode.create({
      data: {
        workflowId: cloned.id,
        type: node.type,
        label: node.label,
        positionX: node.positionX,
        positionY: node.positionY,
        config: node.config ?? {},
      },
    })
    nodeIdMap[node.id] = newNode.id
  }

  // Clone edges using mapped node IDs
  for (const edge of template.edges) {
    const newSourceId = nodeIdMap[edge.sourceId]
    const newTargetId = nodeIdMap[edge.targetId]
    if (!newSourceId || !newTargetId) continue

    await prisma.workflowEdge.create({
      data: {
        workflowId: cloned.id,
        sourceId: newSourceId,
        targetId: newTargetId,
        sourcePort: edge.sourcePort,
        targetPort: edge.targetPort,
      },
    })
  }

  return NextResponse.json({ data: { workflowId: cloned.id } })
}
