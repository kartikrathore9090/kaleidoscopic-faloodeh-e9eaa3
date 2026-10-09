import { cn } from '@/lib/meta'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} />
}

export function StatSkeleton() {
  return (
    <div className="glass rounded-3xl p-5">
      <Skeleton className="h-9 w-9 rounded-xl" />
      <Skeleton className="mt-5 h-7 w-20" />
      <Skeleton className="mt-2 h-3 w-28" />
    </div>
  )
}

export function RowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4" style={{ opacity: 1 - i * 0.14 }}>
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
          <Skeleton className="hidden h-6 w-16 rounded-full md:block" />
        </div>
      ))}
    </div>
  )
}
