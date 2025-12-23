"use client"

import { useMemo } from "react"

interface ProfileCompletionIndicatorProps {
  completedFields: number
  totalFields: number
  className?: string
}

export function ProfileCompletionIndicator({
  completedFields,
  totalFields,
  className = "",
}: ProfileCompletionIndicatorProps) {
  const percentage = useMemo(() => Math.round((completedFields / totalFields) * 100), [completedFields, totalFields])

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">Profile Completion</span>
          <span className="text-sm font-semibold text-primary">{percentage}%</span>
        </div>
        {/* Animated progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  )
}
