"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface TextRevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

/**
 * React-bits style text reveal animation
 * Text that reveals itself with a staggered character animation
 */
export function TextReveal({ children, className, delay = 0 }: TextRevealProps) {
  const text = typeof children === "string" ? children : ""
  const words = text.split(" ")

  return (
    <span className={cn("inline-flex flex-wrap", className)}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex mr-[0.25em]">
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              className="animate-text-reveal opacity-0 inline-block"
              style={{
                animationDelay: `${delay + (wordIndex * word.length + charIndex) * 30}ms`,
                animationFillMode: "forwards",
              }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </span>
  )
}
