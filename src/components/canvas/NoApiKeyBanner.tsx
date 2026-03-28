'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, X, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ApiKey {
  id: string
  provider: string
}

export function NoApiKeyBanner() {
  const [dismissed, setDismissed] = useState(false)

  const { data, isLoading } = useQuery<{ data: ApiKey[] }>({
    queryKey: ['api-keys'],
    queryFn: () => fetch('/api/keys').then((r) => r.json()),
    staleTime: 60_000,
  })

  if (isLoading || dismissed) return null
  if (data?.data && data.data.length > 0) return null

  return (
    <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-sm shrink-0">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="flex-1 text-amber-800 dark:text-amber-300">
        No API keys configured. Add your Anthropic or OpenAI key to run workflows.
        Templates can still be previewed in{' '}
        <span className="font-medium">demo mode</span>.
      </p>
      <Button asChild size="sm" variant="outline" className="h-7 gap-1.5 text-xs border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 shrink-0">
        <Link href="/settings">
          <KeyRound className="h-3.5 w-3.5" />
          Add keys
        </Link>
      </Button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 shrink-0"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
