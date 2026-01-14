"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { useState } from "react"

interface InterviewHistoryFiltersProps {
    onSearchChange: (query: string) => void
    onStatusChange: (status: string) => void
    onTypeChange: (type: string) => void
}

export function InterviewHistoryFilters({
    onSearchChange,
    onStatusChange,
    onTypeChange,
}: InterviewHistoryFiltersProps) {
    const [search, setSearch] = useState("")

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearch(value)
        onSearchChange(value)
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3 mb-6 p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                    placeholder="Search by company or job title..."
                    value={search}
                    onChange={handleSearchChange}
                    className="border-0 bg-card focus-visible:ring-0"
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Select onValueChange={onStatusChange} defaultValue="all">
                    <SelectTrigger className="w-full sm:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CONFIRMED">Accepted</SelectItem>
                        <SelectItem value="CANCELLED">Rejected</SelectItem>
                    </SelectContent>
                </Select>

                <Select onValueChange={onTypeChange} defaultValue="all">
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="ONLINE">Online</SelectItem>
                        <SelectItem value="PHONE">Phone</SelectItem>
                        <SelectItem value="IN_PERSON">In-Person</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
