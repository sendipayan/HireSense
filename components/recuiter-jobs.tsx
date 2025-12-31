"use client"

import { useState, useMemo } from "react"
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
import { mockJobs } from "@/lib/mock-data"

export function RecruiterJobsClient() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [jobs, setJobs] = useState(
        mockJobs.map((job) => ({
            ...job,
            status: Math.random() > 0.3 ? "Active" : "Closed",
            applicants: Math.floor(Math.random() * 50) + 5,
            views: Math.floor(Math.random() * 500) + 100,
        })),
    )
    const [jobToDelete, setJobToDelete] = useState<string | null>(null)

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const matchesSearch =
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.location.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === "all" || job.status.toLowerCase() === statusFilter.toLowerCase()
            return matchesSearch && matchesStatus
        })
    }, [searchQuery, statusFilter, jobs])

    const handleDelete = () => {
        if (jobToDelete) {
            setJobs(jobs.filter((j) => j.id !== jobToDelete))
            setJobToDelete(null)
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
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                                        {job.location} • {job.type}
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
                                            <Link href={`/recruiter/post-job?edit=${job.id}`}>
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
                                <Badge variant={job.status === "Active" ? "default" : "secondary"}>{job.status}</Badge>
                                <Badge variant="outline" className="bg-muted/50">
                                    {job.salary}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50 mb-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Applicants</p>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-primary" />
                                        <span className="font-semibold">{job.applicants}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Views</p>
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-blue-500" />
                                        <span className="font-semibold">{job.views}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Posted {job.posted}</span>
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
            </div>

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
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Job
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
