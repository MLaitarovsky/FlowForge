import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const templates = await prisma.workflow.findMany({
    where: { isTemplate: true },
    select: {
      id: true,
      name: true,
      description: true,
      templateSlug: true,
      nodes: { select: { id: true, type: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ data: templates })
}
