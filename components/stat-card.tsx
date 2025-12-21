import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    positive: boolean
  }
}

/**
 * Reusable stat card for dashboards
 * - Clear visual hierarchy
 * - Optional trend indicator
 * - Accessible with proper semantics
 */
export function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          {trend && (
            <p className={`mt-2 text-sm font-medium ${trend.positive ? "text-success" : "text-destructive"}`}>
              {trend.positive ? "+" : ""}
              {trend.value}% from last month
            </p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
      </div>
    </article>
  )
}
