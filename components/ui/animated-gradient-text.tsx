"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface AnimatedGradientTextProps {
  children: ReactNode
  className?: string
}

/**
 * React-bits style animated gradient text component
 * Creates a shimmering gradient effect that animates across the text
 */
export function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "inline-flex animate-gradient bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent",
        className,
      )}
    >
      {children}
    </span>
  )
}
