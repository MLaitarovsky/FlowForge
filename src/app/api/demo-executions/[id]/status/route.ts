import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import fs from 'fs'
import path from 'path'
import type { DemoEvent } from '@/types/demo'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const execution = await prisma.execution.findUnique({
    where: { id: params.id, isDemo: true },
    include: { workflow: { select: { templateSlug: true } } },
  })

  if (!execution?.workflow?.templateSlug) {
    return new Response('Not found', { status: 404 })
  }

  const slug = execution.workflow.templateSlug
  const filePath = path.join(process.cwd(), 'public', 'demo-results', `${slug}.json`)

  if (!fs.existsSync(filePath)) {
    return new Response('Demo data not found', { status: 404 })
  }

  const events = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DemoEvent[]
  const executionId = params.id

  const stream = new ReadableStream({
    async start(controller) {
      const encode = (data: object) =>
        new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)

      for (const { delayMs, ...event } of events) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
        controller.enqueue(encode({ ...event, executionId }))
      }

      await prisma.execution.update({
        where: { id: executionId },
        data: { status: 'COMPLETED', endedAt: new Date() },
      }).catch(() => null)

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
