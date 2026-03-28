import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { provider } = params

  await prisma.apiKey.deleteMany({
    where: { userId: session.user.id, provider },
  })

  return NextResponse.json({ data: { ok: true } })
}
