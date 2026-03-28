'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useWorkflowStore } from '@/store/workflow'
import {
  deserializeNodes,
  deserializeEdges,
  serializeNodes,
  serializeEdges,
} from '@/lib/workflow/serialize'
import type { WorkflowNodeDTO, WorkflowEdgeDTO } from '@/types/workflow'

interface WorkflowRecord {
  id: string
  name: string
  description?: string
  isTemplate: boolean
  templateSlug: string | null
  nodes: WorkflowNodeDTO[]
  edges: WorkflowEdgeDTO[]
  updatedAt: string
}

async function fetchWorkflow(id: string): Promise<WorkflowRecord> {
  const res = await fetch(`/api/workflows/${id}`)
  const json = (await res.json()) as { data?: WorkflowRecord; error?: string }
  if (!res.ok) throw new Error(json.error ?? 'Failed to fetch workflow')
  return json.data!
}

export function useWorkflowLoad(id: string) {
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow)

  const query = useQuery({
    queryKey: ['workflow', id],
    queryFn: () => fetchWorkflow(id),
    staleTime: Infinity,
  })

  useEffect(() => {
    if (query.data) {
      const nodes = deserializeNodes(query.data.nodes)
      const edges = deserializeEdges(query.data.edges)
      loadWorkflow(
        query.data.id,
        query.data.name,
        nodes,
        edges,
        query.data.isTemplate,
        query.data.templateSlug
      )
    }
  }, [query.data, loadWorkflow])

  return query
}

export function useWorkflowSave(id: string) {
  const { nodes, edges, workflowName, markSaved } = useWorkflowStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/workflows/${id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workflowName,
          nodes: serializeNodes(nodes),
          edges: serializeEdges(edges),
        }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
    },
    onSuccess: () => {
      markSaved()
      queryClient.invalidateQueries({ queryKey: ['workflow', id] })
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
  })
}
