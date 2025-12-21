"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface GlowEffectProps {
  children: ReactNode
  className?: string
  glowColor?: string
  intensity?: "low" | "medium" | "high"
}

/**
 * React-bits style glow effect wrapper
 * Adds a glowing effect around the children
 */
export function GlowEffect({
  children,
  className,
  glowColor = "hsl(var(--primary))",
  intensity = "medium",
}: GlowEffectProps) {
  const intensityMap = {
    low: "0 0 20px",
    medium: "0 0 40px",
    high: "0 0 60px",
  }

  return (
    <div
      className={cn("relative", className)}
      style={{
        filter: `drop-shadow(${intensityMap[intensity]} ${glowColor})`,
      }}
    >
      {children}
    </div>
  )
}
