"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  value: number | string
  className?: string
  duration?: number
}

/**
 * React-bits style animated counter component
 * Numbers that animate/count up to their final value
 */
export function AnimatedCounter({ value, className, duration = 2000 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === "string" ? Number.parseFloat(value.replace(/[^0-9.]/g, "")) : value
  const suffix = typeof value === "string" ? value.replace(/[0-9.]/g, "") : ""

  useEffect(() => {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setDisplayValue(Math.floor(numericValue * easeOutQuart))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [numericValue, duration])

  return (
    <span className={cn("tabular-nums", className)}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  )
}
