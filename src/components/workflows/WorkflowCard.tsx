import Link from 'next/link'
import { GitBranch, Clock } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { WorkflowDTO } from '@/types/workflow'

interface WorkflowCardProps {
  workflow: { id: string; name: string; description?: string | null; updatedAt: string | Date }
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const updatedAt = new Date(workflow.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{workflow.name}</CardTitle>
        {workflow.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {workflow.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {updatedAt}
        </div>
        <Button size="sm" asChild>
          <Link href={`/workflows/${workflow.id}`}>
            <GitBranch className="mr-1 h-3 w-3" />
            Open
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
