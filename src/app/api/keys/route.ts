import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { encrypt } from '@/lib/crypto'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: { id: true, provider: true, createdAt: true, updatedAt: true },
  })

  return NextResponse.json({ data: keys })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { provider?: string; key?: string }
  const { provider, key } = body

  if (!provider || !key) {
    return NextResponse.json({ error: 'provider and key are required' }, { status: 400 })
  }

  if (!['anthropic', 'openai'].includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
  }

  const encryptedKey = encrypt(key)

  const apiKey = await prisma.apiKey.upsert({
    where: { userId_provider: { userId: session.user.id, provider } },
    create: { userId: session.user.id, provider, encryptedKey },
    update: { encryptedKey },
    select: { id: true, provider: true, updatedAt: true },
  })

  return NextResponse.json({ data: apiKey })
}
