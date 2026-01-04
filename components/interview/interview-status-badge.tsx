"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, Calendar } from "lucide-react"

export type InterviewStatus = "scheduled" | "confirmed" | "completed" | "canceled"

interface InterviewStatusBadgeProps {
    status: InterviewStatus
    className?: string
}

export function InterviewStatusBadge({ status, className }: InterviewStatusBadgeProps) {
    const config = {
        scheduled: {
            icon: Clock,
            variant: "secondary" as const,
            label: "Scheduled",
            className: "bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-500/20",
        },
        confirmed: {
            icon: Calendar,
            variant: "default" as const,
            label: "Confirmed",
            className: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 dark:bg-indigo-500/20",
        },
        completed: {
            icon: CheckCircle2,
            variant: "default" as const,
            label: "Completed",
            className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/20",
        },
        canceled: {
            icon: XCircle,
            variant: "destructive" as const,
            label: "Canceled",
            className: "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20",
        },
    }

    const { icon: Icon, label, className: variantClasses } = config[status]

    return (
        <Badge variant="outline" className={`${variantClasses} gap-1.5 px-2 py-0.5 font-medium ${className}`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
        </Badge>
    )
}
