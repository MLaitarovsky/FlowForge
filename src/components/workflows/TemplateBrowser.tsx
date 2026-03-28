import { prisma } from '@/lib/db'
import { TemplateCard } from './TemplateCard'
import { Sparkles } from 'lucide-react'

async function getTemplates() {
  return prisma.workflow.findMany({
    where: { isTemplate: true },
    select: {
      id: true,
      name: true,
      description: true,
      templateSlug: true,
      nodes: { select: { id: true, type: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function TemplateBrowser() {
  const templates = await getTemplates()

  if (templates.length === 0) return null

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">Start from a template</h2>
          <p className="text-sm text-muted-foreground">
            Explore pre-built workflows — preview with live demo or clone to customize.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </section>
  )
}
