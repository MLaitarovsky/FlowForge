import Redis from 'ioredis'
import type { ExecutionEvent } from '@/types/execution'

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6381'

function createRedisClient() {
  return new Redis(REDIS_URL, { maxRetriesPerRequest: null })
}

// Separate publisher instance (shared)
let publisher: Redis | null = null
function getPublisher(): Redis {
  if (!publisher) publisher = createRedisClient()
  return publisher
}

function channelFor(executionId: string) {
  return `execution:${executionId}`
}

export async function publishExecutionEvent(
  executionId: string,
  event: ExecutionEvent
): Promise<void> {
  await getPublisher().publish(channelFor(executionId), JSON.stringify(event))
}

export function subscribeToExecution(
  executionId: string,
  onEvent: (event: ExecutionEvent) => void,
  onEnd: () => void
): () => void {
  const subscriber = createRedisClient()
  const channel = channelFor(executionId)

  subscriber.subscribe(channel)

  subscriber.on('message', (_ch: string, message: string) => {
    try {
      const event = JSON.parse(message) as ExecutionEvent
      onEvent(event)
      if (
        event.type === 'execution_completed' ||
        event.type === 'execution_failed'
      ) {
        onEnd()
      }
    } catch {
      // malformed message — ignore
    }
  })

  // Return cleanup function
  return () => {
    subscriber.unsubscribe(channel)
    subscriber.disconnect()
  }
}
