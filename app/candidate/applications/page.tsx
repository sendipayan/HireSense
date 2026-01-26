"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, Filter, Calendar, Building2, ChevronRight, ArrowLeft, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCursorStore } from "@/store/nextCursorStore"
import { useApplicationsStore } from "@/store/candidateApplication"
import axios from "axios"
import { Spinner } from "@/components/ui/spinner"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function ApplicationsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const { applications, setApplications } = useApplicationsStore()
    const [initialLoad, setInitialLoad] = useState(true)
    const [filter, setFilter] = useState("")
    const [search, setSearch] = useState("")
    const { cursor, setPage, hasMore } = useCursorStore()
    const [loading, setLoading] = useState(false)

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef(false);

    const fetchMore = async () => {
        if (loadingRef.current || !hasMore || !cursor) return;

        try {
            loadingRef.current = true;
            setLoading(true);
            console.log("fetching more");
            const payload = { status: filter, search, cursor }
            const response = await axios.post('/api/candidate/get_applications', payload, { withCredentials: true })
            const data = await response.data
            setApplications([...applications, ...data.applications])
            setPage({ cursor: data.cursor, hasMore: data.hasMore })

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    };

    const setLoaderRef = (node: HTMLDivElement | null) => {
        if (!node) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    fetchMore();
                }
            },
            { rootMargin: "100px" }
        );

        observerRef.current.observe(node);
    };

    useEffect(() => {
        if (cursor) {
            console.log("cursor is", cursor)
        }
    }, [cursor])


    useEffect(() => {

        const fetchApplications = async () => {
            try {
                const payload = { status: "", search: "", cursor: null }
                const response = await axios.post('/api/candidate/get_applications', payload, { withCredentials: true })
                const data = await response.data
                console.log("data is", data)
                setApplications(data.applications)
                setPage({ cursor: data.cursor, hasMore: data.hasMore })
            } catch (error) {
                console.log(error)
            } finally {
                setInitialLoad(false)
            }
        }
        fetchApplications()
    }, [])

    const prevSearchQueryRef = useRef("")

    useEffect(() => {
        const currentTrimmed = searchQuery.trim()
        const prevTrimmed = prevSearchQueryRef.current.trim()

        if (currentTrimmed === prevTrimmed) {
            prevSearchQueryRef.current = searchQuery
            return
        }

        const timeoutId = setTimeout(async () => {
            console.log("Search:", currentTrimmed);
            setSearch(currentTrimmed)
            prevSearchQueryRef.current = searchQuery;
            const payload = { status: filter, search: currentTrimmed, cursor: null }
            console.log(payload)

            try {
                setInitialLoad(true)
                const response = await axios.post('/api/candidate/get_applications', payload, { withCredentials: true })
                const data = await response.data
                console.log("data is", data)
                setApplications(data.applications)
                setPage({ cursor: data.cursor, hasMore: data.hasMore })

            } catch (error) {
                console.log(error)
            } finally {
                setInitialLoad(false)

            }


        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);



    useEffect(() => {
        if (statusFilter === "all") {
            setFilter("")
        } else {
            setFilter(statusFilter)
        }

    }, [statusFilter])

    useEffect(() => {
        if (initialLoad) return

        const fetchApplications = async () => {

            const payload = { status: filter, search, cursor: null }
            console.log(payload)
            try {
                setInitialLoad(true)
                const response = await axios.post('/api/candidate/get_applications', payload, { withCredentials: true })
                const data = await response.data
                console.log("data is", data)
                setApplications(data.applications)
                setPage({ cursor: data.cursor, hasMore: data.hasMore })

            } catch (error) {
                console.log(error)
            } finally {
                setInitialLoad(false)

            }
        }

        fetchApplications()

    }, [filter])

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
                {/* Breadcrumbs */}
                <Breadcrumbs items={[{ label: "Candidate", href: "/candidate/dashboard" }, { label: "Applications" }]} />

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
                            <SelectItem value="PENDING">Application Sent</SelectItem>
                            <SelectItem value="WAITLIST">Under Review</SelectItem>
                            <SelectItem value="SCHEDULED">Interview Scheduled</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                            <SelectItem value="ACCEPTED">Hired</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Applications List */}
                {!initialLoad ? <div className="grid gap-4">
                    {applications.length > 0 ? (
                        applications.map((app) => (
                            <Card key={app.id} className="overflow-hidden transition-all hover:border-primary/50">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row md:items-center">
                                        <div className="flex-1 p-6">
                                            <div className="mb-2 flex items-center justify-between">
                                                {getStatusBadge(app.status)}
                                                <div className="flex items-center gap-1 text-sm font-medium text-primary">
                                                    <span className="text-muted-foreground">Match Score:</span>
                                                    {app.score}%
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-semibold">{app.job.title}</h3>
                                            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Building2 className="h-4 w-4" />
                                                    {app.job.recruiter.companyName}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4" />
                                                    Applied on {new Date(app.createdAt).toISOString().split("T")[0]}
                                                </div>
                                                {app.resume.resumeMimeType === "application/pdf" ? <div className="flex items-center gap-1.5 cursor-pointer hover:text-primary"
                                                    onClick={() => {
                                                        window.open(`https://docs.google.com/gview?url=${encodeURIComponent(app.resume.resumeUrl)}&embedded=true`, "_blank", "noopener,noreferrer")
                                                    }}>
                                                    <FileText className="h-4 w-4" />
                                                    {"Resume: " + app.resume.resumeName}
                                                </div> : <div className="flex items-center gap-1.5 cursor-pointer hover:text-primary"
                                                    onClick={() => { window.open(app.resume.resumeUrl, "_blank", "noopener,noreferrer") }}>
                                                    <FileText className="h-4 w-4" />
                                                    {"Resume: " + app.resume.resumeName}
                                                </div>}
                                            </div>
                                        </div>
                                        <div className="border-t border-border bg-muted/30 p-4 md:border-l md:border-t-0 md:p-6">
                                            <Button asChild variant="outline" className="w-full md:w-auto bg-transparent">
                                                <Link href={`/candidate/browse-jobs/${app.job.id}`}>
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
                    {hasMore && <div ref={setLoaderRef} className="w-full flex justify-center items-center">
                        <Spinner className="w-10 h-10" />
                    </div>}
                </div> :

                    <div className="grid gap-4">
                        {[1, 2, 3].map((item) => (
                            <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-40" key={item}>

                            </div>
                        ))}
                    </div>}
            </main>
        </div>
    )
}
