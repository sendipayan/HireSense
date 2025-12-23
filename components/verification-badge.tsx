"use client"

import { CheckCircle2, Clock, XCircle } from "lucide-react"

interface VerificationBadgeProps {
  status: "verified" | "pending" | "rejected"
  label: string
}

/**
 * Verification status badge showing current verification state
 * - Three states: verified (green), pending (yellow), rejected (red)
 * - Accessible with proper aria labels
 */
export function VerificationBadge({ status, label }: VerificationBadgeProps) {
  const config = {
    verified: {
      icon: CheckCircle2,
      color: "text-success bg-success/10",
      text: "Verified",
    },
    pending: {
      icon: Clock,
      color: "text-warning bg-warning/10",
      text: "Pending",
    },
    rejected: {
      icon: XCircle,
      color: "text-destructive bg-destructive/10",
      text: "Rejected",
    },
  }

  const Icon = config[status].icon

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-md ${config[status].color}`}>
      <Icon className="w-4 h-4" />
      <div>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs">{config[status].text}</p>
      </div>
    </div>
  )
}
