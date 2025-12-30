"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Filter, Calendar, Building2, ChevronRight, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockApplications } from "@/lib/mock-data"

export default function ApplicationsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    const filteredApplications = useMemo(() => {
        return mockApplications.filter((app) => {
            const matchesSearch =
                app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.company.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === "all" || app.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [searchQuery, statusFilter])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Under Review":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                        {status}
                    </Badge>
                )
            case "Interview Scheduled":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                    >
                        {status}
                    </Badge>
                )
            case "Application Sent":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400"
                    >
                        {status}
                    </Badge>
                )
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            asChild
                            className="mb-2 -ml-2 h-8 gap-1 text-muted-foreground hover:text-foreground"
                        >
                            <Link href="/candidate/dashboard">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
                        <p className="text-muted-foreground">Track and manage your active job applications.</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-8 grid gap-4 md:grid-cols-[1fr,200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by job title or company..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Application Sent">Application Sent</SelectItem>
                            <SelectItem value="Under Review">Under Review</SelectItem>
                            <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Applications List */}
                <div className="grid gap-4">
                    {filteredApplications.length > 0 ? (
                        filteredApplications.map((app) => (
                            <Card key={app.id} className="overflow-hidden transition-all hover:border-primary/50">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row md:items-center">
                                        <div className="flex-1 p-6">
                                            <div className="mb-2 flex items-center justify-between">
                                                {getStatusBadge(app.status)}
                                                <div className="flex items-center gap-1 text-sm font-medium text-primary">
                                                    <span className="text-muted-foreground">Match Score:</span>
                                                    {app.matchScore}%
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-semibold">{app.jobTitle}</h3>
                                            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Building2 className="h-4 w-4" />
                                                    {app.company}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4" />
                                                    Applied on {app.appliedDate}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-t border-border bg-muted/30 p-4 md:border-l md:border-t-0 md:p-6">
                                            <Button asChild variant="outline" className="w-full md:w-auto bg-transparent">
                                                <Link href={`/candidate/browse-jobs/${app.id}`}>
                                                    View Job Details
                                                    <ChevronRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="flex flex-col items-center justify-center border-dashed p-12 text-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Filter className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <CardTitle className="mb-2">No applications found</CardTitle>
                            <CardDescription>We couldn't find any applications matching your search criteria.</CardDescription>
                            <Button
                                variant="outline"
                                className="mt-4 bg-transparent"
                                onClick={() => {
                                    setSearchQuery("")
                                    setStatusFilter("all")
                                }}
                            >
                                Clear all filters
                            </Button>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    )
}
