'use client'

import { useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useWorkflowStore } from '@/store/workflow'
import type { DocumentUploadNodeData } from '@/types/nodes'

interface Props {
  nodeId: string
  data: DocumentUploadNodeData
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function DocumentUploadConfig({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      alert('File too large. Maximum size is 10MB.')
      return
    }
    const ext = file.name.split('.').pop()?.toLowerCase()
    const fileType =
      ext === 'pdf' ? 'pdf' : ext === 'docx' ? 'docx' : ext === 'md' ? 'md' : 'txt'

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1] ?? ''
      updateNodeData(nodeId, { fileName: file.name, fileContent: base64, fileType })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="doc-label">Label</Label>
        <Input
          id="doc-label"
          value={data.label}
          onChange={(e) => updateNodeData(nodeId, { label: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>File</Label>
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
        >
          {data.fileName ? (
            <p className="text-sm font-medium truncate max-w-[180px]">{data.fileName}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Drop or click to upload</p>
          )}
          <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, MD · Max 10MB</p>
          <Button variant="outline" size="sm" type="button">
            Choose file
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt,.md"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="collection-name">ChromaDB Collection</Label>
        <Input
          id="collection-name"
          value={data.collectionName}
          onChange={(e) => updateNodeData(nodeId, { collectionName: e.target.value })}
          placeholder="my-documents"
        />
        <p className="text-xs text-muted-foreground">
          Chunks are stored in this collection for RAG retrieval
        </p>
      </div>
    </div>
  )
}
