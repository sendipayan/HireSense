/**
 * Skeleton loading card for async content
 * - Provides visual feedback during data loading
 * - Reduces perceived loading time
 * - Maintains layout stability
 */
export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-pulse" aria-hidden="true" role="presentation">
      <div className="h-4 w-3/4 rounded bg-muted mb-4" />
      <div className="space-y-3">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
        <div className="h-3 w-4/6 rounded bg-muted" />
      </div>
      <div className="mt-6 flex gap-3">
        <div className="h-8 w-20 rounded bg-muted" />
        <div className="h-8 w-20 rounded bg-muted" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
