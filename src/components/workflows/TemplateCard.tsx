'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GitBranch, Play, Copy, Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface TemplateCardProps {
  template: {
    id: string
    name: string
    description?: string | null
    templateSlug: string | null
    nodes: { id: string; type: string }[]
  }
}

const NODE_TYPE_LABELS: Record<string, string> = {
  textInput: 'Text Input',
  llmPrompt: 'LLM',
  textOutput: 'Output',
  documentUpload: 'Document',
  chunker: 'Chunker',
  retriever: 'Retriever',
  structuredExtractor: 'Extractor',
  llmChain: 'LLM Chain',
  conditionalBranch: 'Branch',
  jsonOutput: 'JSON Out',
}

export function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isCloning, setIsCloning] = useState(false)

  const uniqueTypes = [...new Set(template.nodes.map((n) => n.type))]

  const handlePreview = () => {
    router.push(`/workflows/${template.id}`)
  }

  const handleClone = async () => {
    if (!template.templateSlug || isCloning) return
    setIsCloning(true)
    try {
      const res = await fetch(`/api/templates/${template.templateSlug}/clone`, {
        method: 'POST',
      })
      const json = (await res.json()) as { data?: { workflowId: string }; error?: string }
      if (!res.ok || !json.data?.workflowId) {
        throw new Error(json.error ?? 'Clone failed')
      }
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
    <Card className="flex flex-col hover:shadow-md transition-shadow border-dashed">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{template.name}</CardTitle>
          <Badge variant="secondary" className="text-xs shrink-0">Template</Badge>
        </div>
        {template.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <div className="flex flex-wrap gap-1">
          {uniqueTypes.map((type) => (
            <Badge key={type} variant="outline" className="text-xs">
              {NODE_TYPE_LABELS[type] ?? type}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-2 border-t pt-3">
        <Button size="sm" variant="outline" onClick={handlePreview} className="flex-1">
          <Play className="mr-1 h-3 w-3" />
          Preview
        </Button>
        <Button size="sm" onClick={handleClone} disabled={isCloning} className="flex-1">
          {isCloning ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : (
            <Copy className="mr-1 h-3 w-3" />
          )}
          Use template
        </Button>
      </CardFooter>
    </Card>
  )
}
