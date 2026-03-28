'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

interface ApiKeyRecord {
  id: string
  provider: string
  createdAt: string
  updatedAt: string
}

async function fetchKeys(): Promise<ApiKeyRecord[]> {
  const res = await fetch('/api/keys')
  const json = await res.json() as { data?: ApiKeyRecord[]; error?: string }
  if (!res.ok) throw new Error(json.error ?? 'Failed to fetch keys')
  return json.data ?? []
}

export function useApiKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: fetchKeys,
  })
}

export function useApiKeysRefresh() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ['api-keys'] })
}
