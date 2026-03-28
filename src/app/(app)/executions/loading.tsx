import { Skeleton } from '@/components/ui/skeleton'

export default function ExecutionsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="rounded-md border overflow-hidden">
        {/* Table header */}
        <div className="flex gap-4 border-b bg-muted/50 px-4 py-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="ml-auto h-4 w-16 hidden sm:block" />
          <Skeleton className="h-4 w-16 hidden md:block" />
          <Skeleton className="h-4 w-12 hidden md:block" />
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b last:border-0 px-4 py-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-auto h-4 w-12 hidden sm:block" />
            <Skeleton className="h-4 w-16 hidden md:block" />
            <Skeleton className="h-4 w-12 hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
