'use client'

import { useState } from 'react'
import { Save, Loader2, ArrowLeft, Play, Square, Copy, Sparkles, History, Download } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWorkflowStore } from '@/store/workflow'
import { useExecutionStore } from '@/store/execution'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface WorkflowToolbarProps {
  onSave: () => void
  isSaving: boolean
  showHistory: boolean
  onToggleHistory: () => void
}

export function WorkflowToolbar({ onSave, isSaving, showHistory, onToggleHistory }: WorkflowToolbarProps) {
  const { workflowName, isDirty, setWorkflowMeta, workflowId, isTemplate, templateSlug, nodes, edges } = useWorkflowStore()
  const { isRunning, status, startExecution, startDemoExecution, clearExecution } = useExecutionStore()
  const { toast } = useToast()
  const router = useRouter()
  const [isCloning, setIsCloning] = useState(false)

  const handleExport = () => {
    const payload = { name: workflowName, nodes, edges }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowName.replace(/\s+/g, '-').toLowerCase()}.flowforge.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRun = async () => {
    if (!workflowId) return
    if (isTemplate && templateSlug) {
      await startDemoExecution(templateSlug)
    } else {
      await startExecution(workflowId)
    }
  }

  const handleClone = async () => {
    if (!templateSlug || isCloning) return
    setIsCloning(true)
    try {
      const res = await fetch(`/api/templates/${templateSlug}/clone`, { method: 'POST' })
      const json = (await res.json()) as { data?: { workflowId: string }; error?: string }
      if (!res.ok || !json.data?.workflowId) throw new Error(json.error ?? 'Clone failed')
      toast({ title: 'Template cloned', description: 'Opening your new workflow...' })
      router.push(`/workflows/${json.data.workflowId}`)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to clone template',
        variant: 'destructive',
      })
      setIsCloning(false)
    }
  }

  return (
    <header className="flex h-14 items-center gap-2 border-b bg-background px-3 sm:gap-3 sm:px-4">
      <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
        <Link href="/workflows">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>

      <Input
        className="h-8 w-32 sm:max-w-[240px] sm:w-auto text-sm font-medium"
        value={workflowName}
        onChange={(e) => setWorkflowMeta(workflowId ?? '', e.target.value)}
        readOnly={isTemplate}
      />

      {isTemplate && (
        <Badge variant="secondary" className="gap-1 text-xs hidden sm:flex">
          <Sparkles className="h-3 w-3" />
          Template
        </Badge>
      )}

      {!isTemplate && isDirty && (
        <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
          Unsaved
        </Badge>
      )}

      {status === 'completed' && (
        <Badge className="text-xs bg-green-600 hidden sm:inline-flex">Completed</Badge>
      )}
      {status === 'failed' && (
        <Badge variant="destructive" className="text-xs hidden sm:inline-flex">Failed</Badge>
      )}

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {!isTemplate && (
          <>
            <Button size="sm" variant="ghost" onClick={handleExport} className="h-8 px-2 sm:px-3" title="Export workflow as JSON">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Export</span>
            </Button>
            <Button
              size="sm"
              variant={showHistory ? 'secondary' : 'ghost'}
              onClick={onToggleHistory}
              className="h-8 px-2 sm:px-3"
              title="Run history"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">History</span>
            </Button>
          </>
        )}
        {isRunning ? (
          <Button size="sm" variant="outline" onClick={clearExecution} className="h-8 px-2 sm:px-3">
            <Square className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Stop</span>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="default"
            className="h-8 px-2 sm:px-3 bg-green-600 hover:bg-green-700"
            onClick={handleRun}
            disabled={!workflowId}
          >
            <Play className="h-4 w-4" />
            <span className="ml-1.5">{isTemplate ? 'Demo' : 'Run'}</span>
          </Button>
        )}

        {isTemplate ? (
          <Button size="sm" onClick={handleClone} disabled={isCloning} className="h-8 px-2 sm:px-3">
            {isCloning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="hidden sm:inline ml-2">Use template</span>
          </Button>
        ) : (
          <Button size="sm" onClick={onSave} disabled={isSaving} className="h-8 px-2 sm:px-3">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="hidden sm:inline ml-2">Save</span>
          </Button>
        )}
      </div>
    </header>
  )
}
