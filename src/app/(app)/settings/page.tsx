'use client'

import { KeyRound } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ApiKeyCard } from '@/components/settings/ApiKeyCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiKeys, useApiKeysRefresh } from '@/hooks/useApiKeys'

export default function SettingsPage() {
  const { data: keys = [], isLoading } = useApiKeys()
  const refresh = useApiKeysRefresh()

  const hasAnthropicKey = keys.some((k) => k.provider === 'anthropic')
  const hasOpenAiKey = keys.some((k) => k.provider === 'openai')

  return (
    <div className="mx-auto max-w-2xl flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <KeyRound className="h-5 w-5" />
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your API keys. Keys are encrypted at rest with AES-256-GCM.
        </p>
      </div>

      <Separator className="mb-6" />

      <section>
        <h2 className="mb-4 text-base font-semibold">API Keys (BYOK)</h2>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-36 w-full rounded-lg" />
            <Skeleton className="h-36 w-full rounded-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            <ApiKeyCard
              provider="anthropic"
              hasKey={hasAnthropicKey}
              onRefresh={refresh}
            />
            <ApiKeyCard
              provider="openai"
              hasKey={hasOpenAiKey}
              onRefresh={refresh}
            />
          </div>
        )}
      </section>
    </div>
  )
}
