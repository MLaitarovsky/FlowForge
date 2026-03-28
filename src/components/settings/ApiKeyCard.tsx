'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ApiKeyForm } from './ApiKeyForm'
import { useToast } from '@/hooks/use-toast'

interface ApiKeyCardProps {
  provider: 'anthropic' | 'openai'
  hasKey: boolean
  onRefresh: () => void
}

const PROVIDER_LABELS = {
  anthropic: { name: 'Anthropic', description: 'Used for Claude models (claude-sonnet-4-6, claude-opus-4-6)' },
  openai: { name: 'OpenAI', description: 'Used for GPT models (gpt-4o, gpt-4-turbo)' },
}

export function ApiKeyCard({ provider, hasKey, onRefresh }: ApiKeyCardProps) {
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()
  const meta = PROVIDER_LABELS[provider]

  const onDelete = async () => {
    setDeleting(true)
    const res = await fetch(`/api/keys/${provider}`, { method: 'DELETE' })
    setDeleting(false)

    if (!res.ok) {
      toast({ title: 'Error', description: 'Failed to remove key', variant: 'destructive' })
      return
    }

    toast({ title: 'Removed', description: `${meta.name} API key removed.` })
    onRefresh()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{meta.name}</CardTitle>
          {hasKey ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <XCircle className="h-3 w-3" />
              Not set
            </Badge>
          )}
        </div>
        <CardDescription>{meta.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ApiKeyForm provider={provider} hasKey={hasKey} onSaved={onRefresh} />
        {hasKey && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Remove key
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
