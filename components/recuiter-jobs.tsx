"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, MoreHorizontal, Pencil, Trash2, Users, Eye, Calendar, AlertCircle } from "lucide-react"
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
import axios from "axios"

export function RecruiterJobsClient() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const { jobs, setJobs, removeJob } = useJobStore()
    const [initialLoad, setInitialLoad] = useState(true)
    const [loading, setLoading] = useState(false)
    const [jobToDelete, setJobToDelete] = useState<string | null>(null)

    useEffect(() => {
        const fetch = async () => {
            const res = await axios.get("/api/getjob")
            const data = await res.data
            setJobs(data.job)
            console.log(data.job)
            setInitialLoad(false);
        }
        fetch()

    }, [setJobs])

    useEffect(() => {
        if (jobs)
            console.log(jobs)

    }, [jobs])

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const matchesSearch =
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.location.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === "all" || job.status.toLowerCase() === statusFilter.toLowerCase()
            return matchesSearch && matchesStatus
        })
    }, [searchQuery, statusFilter, jobs])

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
            }

        } catch (err) {
            console.error("Form submission error: ", err);

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
            {!initialLoad ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
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
                                            <Link href={`/recruiter/edit-job?job=${job.id}`}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit Job
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/match-results?job=${job.id}`}>
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
                                    {job.minSalary} - {job.maxSalary}
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
                                <Link
                                    href={`/match-results?job=${job.id}`}
                                    className="text-primary font-medium hover:underline inline-flex items-center"
                                >
                                    View Matches
                                </Link>
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
            </div> :

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
