import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workflows = await prisma.workflow.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ data: workflows })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { name?: string; description?: string }
  const { name, description } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const workflow = await prisma.workflow.create({
    data: {
      name: name.trim(),
      description: description?.trim() ?? null,
      userId: session.user.id,
    },
    select: { id: true, name: true, description: true, createdAt: true, updatedAt: true },
  })

  return NextResponse.json({ data: workflow }, { status: 201 })
}
