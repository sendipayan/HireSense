"use client"

import { cn } from "@/lib/utils"
import type { ReactNode, ButtonHTMLAttributes } from "react"

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
  shimmerColor?: string
  shimmerSize?: string
  variant?: "primary" | "secondary"
}

/**
 * React-bits style shimmer button component
 * Button with a shimmering light effect that moves across it
 * Made buttons much more visible with solid vibrant colors and better contrast
 */
export function ShimmerButton({
  children,
  className,
  shimmerColor = "rgba(255, 255, 255, 0.3)",
  shimmerSize = "0.1em",
  variant = "primary",
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg px-8 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl",
        variant === "primary"
          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
          : "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50",
        className,
      )}
      {...props}
    >
      {/* Shimmer effect - more visible now */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/10" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  )
}
