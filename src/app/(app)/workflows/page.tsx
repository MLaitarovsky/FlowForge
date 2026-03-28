import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { WorkflowCard } from '@/components/workflows/WorkflowCard'
import { NewWorkflowDialog } from '@/components/workflows/NewWorkflowDialog'
import { ImportWorkflowButton } from '@/components/workflows/ImportWorkflowButton'
import { TemplateBrowser } from '@/components/workflows/TemplateBrowser'
import { GitBranch } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function WorkflowsPage() {
  const session = await getSession()
  if (!session) return null

  const workflows = await prisma.workflow.findMany({
    where: { userId: session.user.id, isTemplate: false },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, description: true, updatedAt: true },
  })

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <TemplateBrowser />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Workflows</h1>
          <p className="text-sm text-muted-foreground">
            {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ImportWorkflowButton />
          <NewWorkflowDialog />
        </div>
      </div>

      {workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <GitBranch className="mb-4 h-12 w-12 opacity-30" />
          <h2 className="text-lg font-medium">No workflows yet</h2>
          <p className="mb-4 text-sm">
            Start from a template above or create a blank workflow.
          </p>
          <NewWorkflowDialog />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {workflows.map((wf) => (
            <WorkflowCard key={wf.id} workflow={wf} />
          ))}
        </div>
      )}
    </div>
  )
}
