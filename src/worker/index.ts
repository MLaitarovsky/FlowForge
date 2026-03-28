import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config() // fallback to .env
import { Worker, type Job } from 'bullmq'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/crypto'
import { topoSort, getIncomingConnections } from './graph'
import { getExecutor } from './nodes'
import { publishExecutionEvent } from '@/lib/events/execution-bus'
import { resolveConfigVariables } from './variable-injection'
import { estimateCost } from './pricing'
import type { NodeType } from '@/types/nodes'
import type { ConditionalBranchOutput } from './nodes/conditional-branch.executor'

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6381'
import { QUEUE_NAME } from './constants'
export { QUEUE_NAME }

interface ExecutionJob {
  executionId: string
  workflowId: string
  userId: string
}

function sanitizeForLog(obj: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (/key|secret|token|password/i.test(k)) {
      safe[k] = '[REDACTED]'
    } else {
      safe[k] = v
    }
  }
  return safe
}

async function processExecution(job: Job<ExecutionJob>) {
  const { executionId, workflowId, userId } = job.data
  const startedAt = Date.now()

  // Mark execution as running
  await prisma.execution.update({
    where: { id: executionId },
    data: { status: 'RUNNING', startedAt: new Date() },
  })

  await publishExecutionEvent(executionId, {
    type: 'execution_started',
    executionId,
    workflowId,
    timestamp: new Date().toISOString(),
  })

  try {
    // Load workflow
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true, edges: true },
    })
    if (!workflow) throw new Error('Workflow not found.')

    // Load and decrypt API keys
    const apiKeyRecords = await prisma.apiKey.findMany({ where: { userId } })
    const apiKeys: Record<string, string> = {}
    for (const record of apiKeyRecords) {
      try {
        apiKeys[record.provider] = decrypt(record.encryptedKey)
      } catch {
        console.error(`Failed to decrypt key for provider: ${record.provider}`)
      }
    }

    // Map DB edge fields to graph edge interface
    const graphEdges = workflow.edges.map((e) => ({
      source: e.sourceId,
      target: e.targetId,
      sourceHandle: e.sourcePort,
      targetHandle: e.targetPort,
    }))

    // Topological sort
    const orderedIds = topoSort(
      workflow.nodes.map((n) => ({ id: n.id })),
      graphEdges
    )

    // Track outputs, skipped nodes, and cost accumulation
    const nodeOutputs: Record<string, unknown> = {}
    const skippedNodes = new Set<string>()
    let totalTokensAccum = 0
    let totalCostAccum = 0

    for (const nodeId of orderedIds) {
      const node = workflow.nodes.find((n) => n.id === nodeId)
      if (!node) continue

      // Check if this node should be skipped
      const incoming = getIncomingConnections(nodeId, graphEdges)

      // A node is skipped if it has incoming edges AND all source nodes are skipped
      if (incoming.length > 0) {
        const allSkipped = incoming.every((conn) => skippedNodes.has(conn.sourceNodeId))
        if (allSkipped) {
          skippedNodes.add(nodeId)
          await prisma.executionLog.create({
            data: { executionId, nodeId, status: 'SKIPPED', startedAt: new Date(), endedAt: new Date() },
          })
          await publishExecutionEvent(executionId, {
            type: 'node_skipped',
            executionId,
            nodeId,
            timestamp: new Date().toISOString(),
          })
          continue
        }
      }

      // Resolve inputs from upstream outputs
      const inputs: Record<string, unknown> = {}
      for (const conn of incoming) {
        if (!skippedNodes.has(conn.sourceNodeId)) {
          const sourceOutput = nodeOutputs[conn.sourceNodeId]
          // For conditional branch, route by handle
          if (
            sourceOutput !== null &&
            typeof sourceOutput === 'object' &&
            'branch' in (sourceOutput as object)
          ) {
            const branchOutput = sourceOutput as ConditionalBranchOutput
            if (conn.sourceHandle === branchOutput.branch) {
              inputs[conn.targetHandle ?? 'input'] = branchOutput.data
            } else {
              // Wrong branch — this edge is inactive, skip the downstream node
              skippedNodes.add(nodeId)
              break
            }
          } else {
            inputs[conn.targetHandle ?? 'input'] = sourceOutput
          }
        }
      }

      if (skippedNodes.has(nodeId)) {
        await prisma.executionLog.create({
          data: { executionId, nodeId, status: 'SKIPPED', startedAt: new Date(), endedAt: new Date() },
        })
        await publishExecutionEvent(executionId, {
          type: 'node_skipped',
          executionId,
          nodeId,
          timestamp: new Date().toISOString(),
        })
        continue
      }

      const nodeType = node.type as NodeType
      const config = (node.config ?? {}) as Record<string, unknown>
      const nodeStartTime = Date.now()

      await prisma.executionLog.create({
        data: { executionId, nodeId, status: 'RUNNING', startedAt: new Date() },
      })

      await publishExecutionEvent(executionId, {
        type: 'node_started',
        executionId,
        nodeId,
        nodeType,
        timestamp: new Date().toISOString(),
      })

      try {
        const executor = getExecutor(nodeType)
        const resolvedConfig = resolveConfigVariables(config, nodeOutputs)
        const result = await executor.execute({
          nodeId,
          nodeType,
          config: resolvedConfig,
          inputs,
          apiKeys,
        })

        nodeOutputs[nodeId] = result.output
        const durationMs = Date.now() - nodeStartTime

        const model = (resolvedConfig.model as string | undefined) ?? ''
        const nodeCost = result.tokensUsed ? estimateCost(model, result.tokensUsed) : 0
        if (result.tokensUsed) totalTokensAccum += result.tokensUsed
        totalCostAccum += nodeCost

        await prisma.executionLog.updateMany({
          where: { executionId, nodeId, status: 'RUNNING' },
          data: {
            status: 'SUCCESS',
            endedAt: new Date(),
            output: result.output !== undefined ? JSON.stringify(result.output) : undefined,
            tokenUsage: result.tokensUsed ?? null,
            costUsd: nodeCost > 0 ? nodeCost : null,
          },
        })

        await publishExecutionEvent(executionId, {
          type: 'node_completed',
          executionId,
          nodeId,
          nodeType,
          output: result.output,
          durationMs,
          tokensUsed: result.tokensUsed,
          timestamp: new Date().toISOString(),
        })
      } catch (nodeError) {
        const errMsg = nodeError instanceof Error ? nodeError.message : String(nodeError)
        console.error(`Node ${nodeId} (${nodeType}) failed:`, sanitizeForLog({ error: errMsg }))

        await prisma.executionLog.updateMany({
          where: { executionId, nodeId, status: 'RUNNING' },
          data: { status: 'FAILED', endedAt: new Date(), error: errMsg },
        })

        await publishExecutionEvent(executionId, {
          type: 'node_error',
          executionId,
          nodeId,
          nodeType,
          error: errMsg,
          timestamp: new Date().toISOString(),
        })

        throw new Error(`Node "${node.type}" failed: ${errMsg}`)
      }
    }

    const durationMs = Date.now() - startedAt
    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        totalTokens: totalTokensAccum,
        totalCost: totalCostAccum,
      },
    })

    await publishExecutionEvent(executionId, {
      type: 'execution_completed',
      executionId,
      durationMs,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error(`Execution ${executionId} failed:`, errMsg)

    await prisma.execution.update({
      where: { id: executionId },
      data: { status: 'FAILED', endedAt: new Date() },
    }).catch(() => null)

    await publishExecutionEvent(executionId, {
      type: 'execution_failed',
      executionId,
      error: errMsg,
      timestamp: new Date().toISOString(),
    }).catch(() => null)

    throw err
  }
}

const worker = new Worker<ExecutionJob>(QUEUE_NAME, processExecution, {
  connection: { url: REDIS_URL },
  concurrency: 5,
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 50 },
})

worker.on('completed', (job) => {
  console.log(`[worker] Job ${job.id} completed (execution: ${job.data.executionId})`)
})

worker.on('failed', (job, err) => {
  const attempts = job?.attemptsMade ?? 0
  const maxAttempts = job?.opts?.attempts ?? 1
  if (attempts < maxAttempts) {
    console.warn(`[worker] Job ${job?.id} attempt ${attempts}/${maxAttempts} failed, retrying:`, err.message)
  } else {
    console.error(`[worker] Job ${job?.id} permanently failed after ${attempts} attempts:`, err.message)
  }
})

worker.on('error', (err) => {
  console.error('[worker] Worker error:', err.message)
})

console.log(`[worker] FlowForge worker started. Listening on queue: ${QUEUE_NAME}`)
console.log(`[worker] Redis: ${REDIS_URL.replace(/:[^:@]+@/, ':***@')}`)
