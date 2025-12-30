"use client"

import { useState, useMemo } from "react"
import { Search, Filter, MapPin, Briefcase, DollarSign, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { mockJobs } from "@/lib/mock-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApplyJobModal } from "@/components/apply-job-modal"
import { useRouter } from "next/navigation"

const jobTypes = ["Full-time", "Part-time", "Contract", "Remote"]
const experienceLevels = ["Entry Level", "Mid Level", "Senior Level", "Lead"]

export function JobsBrowser() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [selectedExperience, setSelectedExperience] = useState<string[]>([])
    const [sortBy, setSortBy] = useState("newest")
    const [applyingJob, setApplyingJob] = useState<(typeof mockJobs)[0] | null>(null)

    const filteredJobs = useMemo(() => {
        return mockJobs.filter((job) => {
            const matchesSearch =
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.description.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(job.type)

            return matchesSearch && matchesType
        })
    }, [searchQuery, selectedTypes])

    const toggleType = (type: string) => {
        setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
    }

    return (
        <>
            <Breadcrumbs items={[{ label: "Candidate", href: "/candidate/dashboard" }, { label: "Browse Jobs" }]} />

            <PageHeader title="Browse Opportunities" description="Discover jobs that match your skills and aspirations." />

            <div className="mt-8 grid gap-8 lg:grid-cols-4">
                {/* Filters Sidebar */}
                <aside className="space-y-6 lg:col-span-1">
                    <div className="rounded-xl border border-border bg-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filters
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => {
                                    setSelectedTypes([])
                                    setSelectedExperience([])
                                }}
                            >
                                Reset
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {/* Job Type */}
                            <div>
                                <h3 className="text-sm font-medium mb-3">Job Type</h3>
                                <div className="space-y-2">
                                    {jobTypes.map((type) => (
                                        <div key={type} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`type-${type}`}
                                                checked={selectedTypes.includes(type)}
                                                onCheckedChange={() => toggleType(type)}
                                            />
                                            <label
                                                htmlFor={`type-${type}`}
                                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {type}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Experience Level */}
                            <div>
                                <h3 className="text-sm font-medium mb-3">Experience Level</h3>
                                <div className="space-y-2">
                                    {experienceLevels.map((level) => (
                                        <div key={level} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`level-${level}`}
                                                checked={selectedExperience.includes(level)}
                                                onCheckedChange={() => {
                                                    setSelectedExperience((prev) =>
                                                        prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
                                                    )
                                                }}
                                            />
                                            <label
                                                htmlFor={`level-${level}`}
                                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {level}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-primary/10 p-6 border border-primary/20">
                        <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            AI Match Score
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Upload your resume to see how well you match with these positions.
                        </p>
                        <Button size="sm" className="w-full bg-transparent" variant="outline">
                            Boost My Search
                        </Button>
                    </div>
                </aside>

                {/* Main Content */}
                <section className="lg:col-span-3 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by job title or company..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest first</SelectItem>
                                <SelectItem value="salary-high">Highest salary</SelectItem>
                                <SelectItem value="match">Best match</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <p className="text-sm text-muted-foreground">Showing {filteredJobs.length} job opportunities</p>

                    <div className="space-y-4">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map((job) => (
                                <article
                                    key={job.id}
                                    className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 "

                                >
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                    <Briefcase className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                                        {job.title}
                                                    </h3>
                                                    <p className="text-muted-foreground">{job.company}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4" aria-hidden="true" />
                                                    {job.location}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <DollarSign className="h-4 w-4" aria-hidden="true" />
                                                    {job.salary}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4" aria-hidden="true" />
                                                    {job.posted}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="secondary">{job.type}</Badge>
                                                {job.tags.map((tag) => (
                                                    <Badge key={tag} variant="outline" className="font-normal">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 min-w-[120px]">
                                            <Button className="w-full cursor-pointer" onClick={() => setApplyingJob(job)}>
                                                Apply Now
                                            </Button>
                                            <Button variant="outline" className="w-full bg-transparent cursor-pointer" onClick={() => router.push(`/candidate/browse-jobs/${job.id}`)}>
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="text-center py-12 border border-dashed rounded-xl">
                                <p className="text-muted-foreground">No jobs found matching your criteria.</p>
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        setSearchQuery("")
                                        setSelectedTypes([])
                                    }}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {applyingJob && (
                <ApplyJobModal job={applyingJob} open={!!applyingJob} onOpenChange={(open) => !open && setApplyingJob(null)} />
            )}
        </>
    )
}
