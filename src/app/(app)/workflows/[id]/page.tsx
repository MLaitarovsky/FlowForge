'use client'

import { useState } from 'react'
import { ReactFlowProvider } from 'reactflow'
import { useParams } from 'next/navigation'
import { Loader2, Monitor } from 'lucide-react'
import { WorkflowCanvas } from '@/components/canvas/WorkflowCanvas'
import { NodePalette } from '@/components/canvas/NodePalette'
import { ConfigPanel } from '@/components/canvas/ConfigPanel'
import { HistoryPanel } from '@/components/canvas/HistoryPanel'
import { WorkflowToolbar } from '@/components/canvas/WorkflowToolbar'
import { OutputPanel } from '@/components/canvas/OutputPanel'
import { useWorkflowLoad, useWorkflowSave } from '@/hooks/useWorkflow'
import { useWorkflowStore } from '@/store/workflow'
import { useToast } from '@/hooks/use-toast'
import { NoApiKeyBanner } from '@/components/canvas/NoApiKeyBanner'

function WorkflowPageInner({ id }: { id: string }) {
  const { toast } = useToast()
  const { isLoading, isError } = useWorkflowLoad(id)
  const saveMutation = useWorkflowSave(id)
  const isTemplate = useWorkflowStore((s) => s.isTemplate)
  const [showHistory, setShowHistory] = useState(false)

  const onSave = async () => {
    try {
      await saveMutation.mutateAsync()
      toast({ title: 'Saved', description: 'Workflow saved successfully.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to save workflow.', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center text-destructive">
        Failed to load workflow.
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {!isTemplate && <NoApiKeyBanner />}

      {/* Mobile notice — canvas editor is desktop-only */}
      <div className="flex items-center gap-3 border-b bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-300 lg:hidden">
        <Monitor className="h-4 w-4 shrink-0" />
        <span>The canvas editor works best on a larger screen. Drag-and-drop is disabled on mobile.</span>
      </div>

      <WorkflowToolbar
        onSave={onSave}
        isSaving={saveMutation.isPending}
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory((h) => !h)}
      />
      <div className="flex flex-1 overflow-hidden">
        {!isTemplate && <NodePalette className="hidden lg:flex" />}
        <div className="flex flex-1 flex-col overflow-hidden">
          <WorkflowCanvas />
          <OutputPanel />
        </div>
        {showHistory ? (
          <HistoryPanel workflowId={id} />
        ) : (
          <ConfigPanel />
        )}
      </div>
    </div>
  )
}

export default function WorkflowPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <ReactFlowProvider>
      <WorkflowPageInner id={id} />
    </ReactFlowProvider>
  )
}
