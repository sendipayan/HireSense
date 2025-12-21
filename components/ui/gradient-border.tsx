"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface GradientBorderProps {
  children: ReactNode
  className?: string
  borderWidth?: number
  animated?: boolean
}

/**
 * React-bits style gradient border component
 * Container with an animated gradient border
 */
export function GradientBorder({ children, className, borderWidth = 2, animated = true }: GradientBorderProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-[var(--border-width)]",
        animated && "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient",
        !animated && "bg-gradient-to-r from-primary to-accent",
        className,
      )}
      style={{ ["--border-width" as string]: `${borderWidth}px` }}
    >
      <div className="h-full w-full rounded-[calc(1rem-var(--border-width))] bg-background">{children}</div>
    </div>
  )
}
