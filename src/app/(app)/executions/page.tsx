import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS_BADGE: Record<string, string> = {
  COMPLETED: 'bg-green-600 text-white',
  FAILED: 'bg-red-500 text-white',
  RUNNING: 'bg-blue-500 text-white',
  PENDING: 'bg-gray-400 text-white',
  CANCELLED: 'bg-gray-400 text-white',
}

function formatDuration(ms: number | null) {
  if (ms === null) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export default async function ExecutionsPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect('/login')

  const executions = await prisma.execution.findMany({
    where: { workflow: { userId: session.user.id } },
    select: {
      id: true,
      workflowId: true,
      status: true,
      isDemo: true,
      startedAt: true,
      endedAt: true,
      totalTokens: true,
      totalCost: true,
      workflow: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const rows = executions.map((e) => ({
    id: e.id,
    workflowId: e.workflow.id,
    workflowName: e.workflow.name,
    status: e.status,
    isDemo: e.isDemo,
    startedAt: e.startedAt,
    durationMs:
      e.startedAt && e.endedAt
        ? e.endedAt.getTime() - e.startedAt.getTime()
        : null,
    totalTokens: e.totalTokens,
    totalCost: e.totalCost,
  }))

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Execution History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All workflow runs across your account
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-muted-foreground">No executions yet.</p>
          <p className="text-sm text-muted-foreground">
            Open a workflow and hit{' '}
            <Link href="/workflows" className="underline hover:text-foreground">
              Run
            </Link>{' '}
            to see results here.
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Workflow</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Started</th>
                <th className="hidden sm:table-cell text-right px-4 py-3 font-medium text-muted-foreground">Duration</th>
                <th className="hidden md:table-cell text-right px-4 py-3 font-medium text-muted-foreground">Tokens</th>
                <th className="hidden md:table-cell text-right px-4 py-3 font-medium text-muted-foreground">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/workflows/${row.workflowId}`}
                      className="font-medium hover:underline"
                    >
                      {row.workflowName}
                    </Link>
                    {row.isDemo && (
                      <Badge variant="outline" className="ml-2 text-[10px] h-4">
                        Demo
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn('text-[10px]', STATUS_BADGE[row.status])}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.startedAt
                      ? formatDistanceToNow(new Date(row.startedAt), { addSuffix: true })
                      : '—'}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-right text-muted-foreground">
                    {formatDuration(row.durationMs)}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-right text-muted-foreground">
                    {row.totalTokens > 0 ? row.totalTokens.toLocaleString() : '—'}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-right text-muted-foreground">
                    {row.totalCost > 0 ? `$${row.totalCost.toFixed(4)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
