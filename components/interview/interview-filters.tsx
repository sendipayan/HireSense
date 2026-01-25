"use client"

import { Search, Filter, CalendarIcon, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"

interface InterviewFiltersProps {
    searchQuery: string
    onSearchChange: (value: string) => void
    statusFilter: string
    onStatusChange: (value: string) => void
    jobFilter: string
    onJobChange: (value: string) => void
    dateRange: DateRange | undefined
    onDateRangeChange: (range: DateRange | undefined) => void
    jobs: { id: string; title: string }[]
    onClear: () => void
}

export function InterviewFilters({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    jobFilter,
    onJobChange,
    dateRange,
    onDateRangeChange,
    jobs,
    onClear,
}: InterviewFiltersProps) {
    const hasActiveFilters =
        searchQuery !== "" || statusFilter !== "all" || jobFilter !== "all" || dateRange !== undefined

    return (
        <div className="flex flex-col gap-4 bg-card p-4 rounded-xl border border-border">
            <div className="flex flex-col flex-wrap justify-between lg:flex-row gap-4">
                {/* Search */}
                <div className="relative w-full flex-1 lg:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search candidate..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-center gap-3 flex-1">
                    <div className="flex w-full md:w-[200px] items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden md:block" />
                        <Select value={jobFilter} onValueChange={onJobChange}>
                            <SelectTrigger className=" w-full">
                                <SelectValue placeholder="All Jobs" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Jobs</SelectItem>
                                {jobs.map((job) => (
                                    <SelectItem key={job.id} value={job.id}>
                                        {job.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Select value={statusFilter} onValueChange={onStatusChange}>
                        <SelectTrigger className="md:w-[200px] w-full">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Canceled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn("md:w-[260px] w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={onDateRangeChange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="h-9 px-2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
