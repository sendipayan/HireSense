"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface FloatingParticlesProps {
  className?: string
  quantity?: number
  color?: string
}

/**
 * React-bits style floating particles background
 * Creates animated floating dots/particles in the background
 */
export function FloatingParticles({ className, quantity = 50, color = "hsl(var(--primary))" }: FloatingParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear existing particles
    container.innerHTML = ""

    // Create particles
    for (let i = 0; i < quantity; i++) {
      const particle = document.createElement("div")
      particle.className = "absolute rounded-full animate-float opacity-20"
      particle.style.width = `${Math.random() * 4 + 2}px`
      particle.style.height = particle.style.width
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      particle.style.backgroundColor = color
      particle.style.animationDelay = `${Math.random() * 5}s`
      particle.style.animationDuration = `${Math.random() * 10 + 10}s`
      container.appendChild(particle)
    }
  }, [quantity, color])

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    />
  )
}
