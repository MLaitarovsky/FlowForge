'use client'

import { useState } from 'react'
import { KeyRound, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface ApiKeyFormProps {
  provider: 'anthropic' | 'openai'
  hasKey: boolean
  onSaved: () => void
}

const PROVIDER_LABELS = {
  anthropic: { name: 'Anthropic', placeholder: 'sk-ant-...' },
  openai: { name: 'OpenAI', placeholder: 'sk-...' },
}

export function ApiKeyForm({ provider, hasKey, onSaved }: ApiKeyFormProps) {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const meta = PROVIDER_LABELS[provider]

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!key.trim()) return
    setLoading(true)

    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, key }),
    })

    setLoading(false)

    if (!res.ok) {
      toast({ title: 'Error', description: 'Failed to save API key', variant: 'destructive' })
      return
    }

    setKey('')
    toast({ title: 'Saved', description: `${meta.name} API key saved.` })
    onSaved()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`key-${provider}`}>
          {hasKey ? 'Replace API Key' : 'API Key'}
        </Label>
        <div className="flex gap-2">
          <Input
            id={`key-${provider}`}
            type="password"
            placeholder={meta.placeholder}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="font-mono text-sm"
          />
          <Button type="submit" size="sm" disabled={loading || !key.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            <span className="ml-1">Save</span>
          </Button>
        </div>
      </div>
    </form>
  )
}
