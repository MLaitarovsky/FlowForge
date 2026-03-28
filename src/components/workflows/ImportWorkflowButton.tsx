'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function ImportWorkflowButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setImporting(true)
    try {
      const text = await file.text()
      const json = JSON.parse(text) as unknown

      const res = await fetch('/api/workflows/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })

      const data = (await res.json()) as { data?: { workflowId: string }; error?: string }
      if (!res.ok || !data.data?.workflowId) {
        throw new Error(data.error ?? 'Import failed')
      }

      toast({ title: 'Workflow imported', description: 'Opening your imported workflow...' })
      router.push(`/workflows/${data.data.workflowId}`)
    } catch (err) {
      toast({
        title: 'Import failed',
        description: err instanceof Error ? err.message : 'Invalid file',
        variant: 'destructive',
      })
      setImporting(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={importing}
      >
        {importing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        Import
      </Button>
    </>
  )
}
