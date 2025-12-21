import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
}

/**
 * Feature card for landing page sections
 * - Uses <article> for semantic structure
 * - Hover states for interactivity
 * - Icon with aria-hidden for decorative images
 */
export function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
  return (
    <article className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
        <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground leading-relaxed">{description}</p>
    </article>
  )
}
