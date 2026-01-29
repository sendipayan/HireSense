"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, Filter, MoreHorizontal, Pencil, Trash2, Users, Eye, Calendar, AlertCircle, IndianRupee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "./ui/spinner"
import { useJobStore } from "@/store/jobStore"
import axios, { AxiosError } from "axios"
import { useCursorStore } from "@/store/nextCursorStore"
import toast from "react-hot-toast"



export function RecruiterJobsClient() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const { jobs, setJobs, removeJob } = useJobStore()
    const [initialLoad, setInitialLoad] = useState(true)
    const [loading, setLoading] = useState(false)
    const { cursor, hasMore, setPage } = useCursorStore()
    const [jobToDelete, setJobToDelete] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("")
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef(false);

    const fetchMore = async () => {
        if (loadingRef.current || !hasMore) return;

        try {
            loadingRef.current = true;
            setLoading(true);
            console.log("fetching more");
            const payload = { status: filter, search: search, cursor: cursor }
            const res = await axios.post("/api/recruiter/getjob", payload,
                { withCredentials: true })

            const data = await res.data
            console.log("next jobs: ", data)
            setJobs([...jobs, ...data.job])
            setPage({ cursor: data.cursor, hasMore: data.hasMore })

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    };

    // We use a ref to access the DOM element for the observer
    const loaderRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Check if intersecting AND if we have more to load AND we aren't currently loading
                if (entry.isIntersecting && hasMore && !loadingRef.current) {
                    fetchMore();
                }
            },
            { rootMargin: "100px" }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
            observer.disconnect();
        };
    }, [hasMore, jobs, cursor]); // Re-run effect when data/cursor changes to keep closure fresh

    useEffect(() => {
        const fetch = async () => {
            const payload = { status: "", search: "", cursor: null }
            const res = await axios.post("/api/recruiter/getjob", payload, { withCredentials: true })
            const data = await res.data
            setJobs(data.job)
            setPage({ cursor: data.cursor, hasMore: data.hasMore })
            console.log(data.job)
            setInitialLoad(false);
        }
        fetch()

    }, [setJobs])

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
            try {
                setInitialLoad(true)
                const res = await axios.post("/api/recruiter/getjob", payload, { withCredentials: true })
                const data = await res.data
                setJobs(data.job)
                setPage({ cursor: data.cursor, hasMore: data.hasMore })
            } catch (err) {
                console.log(err)
            } finally {
                setInitialLoad(false)
            }

        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);


    useEffect(() => {
        if (statusFilter === "all") {
            setFilter("")
        }
        else {
            setFilter(statusFilter)
        }
    }, [statusFilter])

    useEffect(() => {
        if (initialLoad) {
            return
        }

        const fetch = async () => {
            try {
                setInitialLoad(true)
                const payload = { status: filter, search: search, cursor: null }
                console.log(payload)
                const res = await axios.post("/api/recruiter/getjob", payload, { withCredentials: true })
                const data = await res.data
                setJobs(data.job)
                setPage({ cursor: data.cursor, hasMore: data.hasMore })
            } catch (err) {
                console.log(err)
            } finally {
                setInitialLoad(false)
            }

        }
        fetch()
    }, [filter])


    const deleteJob = async () => {
        if (jobToDelete?.trim() === "") {
            return
        }
        try {
            setLoading(true);
            const res = await axios.delete(`/api/recruiter/delete_job/${jobToDelete}`, { withCredentials: true });
            if (res.status === 200) {
                console.log("Form submitted: ", res.data);
                removeJob(jobToDelete || "")
                toast.success("Job deleted successfully");
            }

        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("Form submission error:", err.response?.data?.error);
                toast.error(err.response?.data?.error || "Failed to delete job");
            } else {
                console.error("Unexpected error:", err);
                toast.error("An unexpected error occurred");
            }

        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-xl border border-border">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title or location..."
                        className="pl-9 bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] bg-background">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Jobs Grid */}
            {!initialLoad ? (<><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.length > 0 ? (
                    jobs.map((job) => (
                        <div
                            key={job.id}
                            className="group relative bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                                        {job.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {job.location} • {job.jobType}
                                    </p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/recruiter/jobs/edit-job?job=${job.id}`}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit Job
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={"/recruiter/top-matches"}>
                                                <Users className="mr-2 h-4 w-4" /> View Matches
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => setJobToDelete(job.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Job
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                <Badge variant={job.status === "ACTIVE" ? "default" : "secondary"}>{job.status}</Badge>
                                <Badge variant="outline" className="bg-muted/50">
                                    <IndianRupee className="h-4 w-4" />{job.minSalary} - <IndianRupee className="h-4 w-4 ml-2" />{job.maxSalary}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50 mb-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Applicants</p>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-primary" />
                                        <span className="font-semibold">15</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Views</p>
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-blue-500" />
                                        <span className="font-semibold">450</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Posted {new Date(job.createdAt).toISOString().split("T")[0]}</span>
                                </div>

                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-card border border-dashed border-border rounded-xl">
                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <AlertCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No jobs found</h3>
                        <p className="text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
                        <Button
                            variant="outline"
                            className="mt-6 bg-transparent"
                            onClick={() => {
                                setSearchQuery("")
                                setStatusFilter("all")
                            }}
                        >
                            Clear All Filters
                        </Button>
                    </div>
                )}

            </div>
                {hasMore && (
                    <div ref={loaderRef} className="w-full flex justify-center items-center">
                        <Spinner className="w-10 h-10" />
                    </div>
                )}</>) :

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-[30vh]" >

                        </div>
                    ))}
                </div>}

            {/* Delete Confirmation */}
            <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the job posting and remove all associated
                            application data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteJob}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {loading ? <Spinner className="h-5 w-5" /> : "Delete Job"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
