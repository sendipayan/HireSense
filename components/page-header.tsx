import type React from "react"
interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

/**
 * Page header component for consistent page structure
 * - Single h1 for SEO
 * - Optional description and action buttons
 * - Uses text-balance for optimal line breaks
 */
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {/* SEO: Exactly one h1 per page */}
        <h1 className="text-3xl font-bold tracking-tight text-balance">{title}</h1>
        {description && <p className="mt-2 text-muted-foreground text-pretty max-w-2xl">{description}</p>}
      </div>
      {children && <div className="flex gap-3">{children}</div>}
    </div>
  )
}
