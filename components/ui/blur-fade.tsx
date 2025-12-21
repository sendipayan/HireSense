"use client"

import { useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface BlurFadeProps {
  children: ReactNode
  className?: string
  delay?: number
  inView?: boolean
  direction?: "up" | "down" | "left" | "right"
}

/**
 * React-bits style blur fade animation component
 * Elements fade in with a blur effect and slide from a direction
 */
export function BlurFade({ children, className, delay = 0, direction = "up" }: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null)

  const directionStyles = {
    up: "translate-y-6",
    down: "-translate-y-6",
    left: "translate-x-6",
    right: "-translate-x-6",
  }

  return (
    <div
      ref={ref}
      className={cn("animate-blur-fade opacity-0", className)}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
        ["--blur-fade-direction" as string]: directionStyles[direction],
      }}
    >
      {children}
    </div>
  )
}
