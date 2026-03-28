import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { subscribeToExecution } from '@/lib/events/execution-bus'
import type { ExecutionEvent } from '@/types/execution'

function sseMessage(event: ExecutionEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const execution = await prisma.execution.findUnique({
    where: { id: params.id, workflow: { userId: session.user.id } },
    include: { logs: true },
  })

  if (!execution) {
    return new Response('Not found', { status: 404 })
  }

  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  }

  // If already terminal, send historical state and close
  if (execution.status === 'COMPLETED' || execution.status === 'FAILED') {
    const events: ExecutionEvent[] = []

    events.push({
      type: 'execution_started',
      executionId: execution.id,
      workflowId: execution.workflowId,
      timestamp: execution.startedAt?.toISOString() ?? new Date().toISOString(),
    })

    for (const log of execution.logs) {
      if (log.status === 'SUCCESS') {
        events.push({
          type: 'node_completed',
          executionId: execution.id,
          nodeId: log.nodeId,
          nodeType: '',
          output: log.output ?? null,
          durationMs: log.endedAt && log.startedAt
            ? log.endedAt.getTime() - log.startedAt.getTime()
            : 0,
          tokensUsed: log.tokenUsage ?? undefined,
          timestamp: log.endedAt?.toISOString() ?? new Date().toISOString(),
        })
      } else if (log.status === 'FAILED') {
        events.push({
          type: 'node_error',
          executionId: execution.id,
          nodeId: log.nodeId,
          nodeType: '',
          error: log.error ?? 'Unknown error',
          timestamp: log.endedAt?.toISOString() ?? new Date().toISOString(),
        })
      } else if (log.status === 'SKIPPED') {
        events.push({
          type: 'node_skipped',
          executionId: execution.id,
          nodeId: log.nodeId,
          timestamp: log.endedAt?.toISOString() ?? new Date().toISOString(),
        })
      }
    }

    if (execution.status === 'COMPLETED') {
      events.push({
        type: 'execution_completed',
        executionId: execution.id,
        durationMs: execution.endedAt && execution.startedAt
          ? execution.endedAt.getTime() - execution.startedAt.getTime()
          : 0,
        timestamp: execution.endedAt?.toISOString() ?? new Date().toISOString(),
      })
    } else {
      events.push({
        type: 'execution_failed',
        executionId: execution.id,
        error: 'Execution failed',
        timestamp: execution.endedAt?.toISOString() ?? new Date().toISOString(),
      })
    }

    const body = events.map(sseMessage).join('')
    return new Response(body, { headers })
  }

  // Stream live events via Redis Pub/Sub
  const stream = new ReadableStream({
    start(controller) {
      const signal = req.signal

      const cleanup = subscribeToExecution(
        execution.id,
        (event) => {
          try {
            controller.enqueue(new TextEncoder().encode(sseMessage(event)))
          } catch {
            // Stream closed
          }
        },
        () => {
          try {
            controller.close()
          } catch {
            // Already closed
          }
        }
      )

      // Cleanup on client disconnect
      signal.addEventListener('abort', () => {
        cleanup()
        try {
          controller.close()
        } catch {
          // Already closed
        }
      })

      // 10-minute timeout
      const timeout = setTimeout(() => {
        cleanup()
        try {
          controller.close()
        } catch {
          // Already closed
        }
      }, 10 * 60 * 1000)

      signal.addEventListener('abort', () => clearTimeout(timeout))
    },
  })

  return new Response(stream, { headers })
}
