import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl flex-1 overflow-y-auto p-6">
      <div className="mb-6 space-y-1.5">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-80" />
      </div>

      <Skeleton className="mb-6 h-px w-full" />

      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
