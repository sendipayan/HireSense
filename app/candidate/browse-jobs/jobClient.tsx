"use client"

import { useState, useMemo, useRef } from "react"
import { Search, Filter, MapPin, Briefcase, DollarSign, Clock, IndianRupee } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApplyJobModal } from "@/components/apply-job-modal"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useEffect } from "react"
import { useJobStore } from "@/store/jobStore"
import { useCandidateStore } from "@/store/candidateStore"
import { useAuthStore } from "@/store/authStore"
import { useCursorStore } from "@/store/nextCursorStore"
import { Spinner } from "@/components/ui/spinner"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"

const jobTypes = ["FULL_TIME", "BOTH", "INTERNSHIP"]
const experienceLevels = ["NONE", "ENTRY_LEVEL", "MID_LEVEL", "SENIOR_LEVEL", "LEAD", "EXECUTIVE"]
const Department = ["NONE",
    "ENGINEERING",
    "DESIGN",
    "MARKETING",
    "SALES",
    "SUPPORT",
    "HR",
    "FINANCE",
    "OPERATIONS"]

interface Job {
    id: string,
    title: string
    recruiter: string,

}

interface User {
    id: string;
    name: string
    email: string
    resumeId: string
    resumeName: string
    resumeUrl: string
    createdAt: Date
}

export function JobsBrowser() {
    const router = useRouter()
    const { jobs, setJobs, addJob } = useJobStore()
    const { user } = useAuthStore()
    const { candidateProfile, setCandidateProfile } = useCandidateStore()
    const [initialLoad, setInitialLoad] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [selectedExperience, setSelectedExperience] = useState<string[]>([])
    const [selectedDepartment, setSelectedDepartment] = useState<string[]>([])
    const [sortBy, setSortBy] = useState("newest")
    const [applyingJob, setApplyingJob] = useState<Job | null>(null)
    const [users, setUsers] = useState<User | null>(null)
    const [userload, setUserload] = useState(true)
    const [trigger, setTrigger] = useState(false)
    const [loading, setLoading] = useState(false);
    const { cursor, hasMore, setPage } = useCursorStore()
    const [search, setSearch] = useState("")

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef(false);

    const fetchMore = async () => {
        if (loadingRef.current || !hasMore) return;

        try {
            loadingRef.current = true;
            setLoading(true);
            console.log("fetching more");
            const payload = { department: selectedDepartment, experience: selectedExperience, type: selectedTypes, search: search, cursor: cursor }
            const res = await axios.post("/api/candidate/getjob", payload,
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
        setInitialLoad(true)
        async function loadUser() {
            const res = await axios.get("/api/auth/me")
            const data = await res.data
            if (data?.user?.user?.role === "CANDIDATE") {
                setCandidateProfile(data?.user)
            }
            setUserload(false)
            console.log("user: ", data.user)
        }

        loadUser()

    }, [trigger])

    useEffect(() => {

        if (userload || !candidateProfile) {
            return
        }
        const fetch = async () => {
            const payload = { department: [], experience: [], type: [], search: "" }
            const res = await axios.post("/api/candidate/getjob", payload, { withCredentials: true })
            const data = await res.data
            console.log("jobs: ", data.job)
            setJobs(data.job)
            setPage({ cursor: data.cursor, hasMore: data.hasMore })
            setInitialLoad(false)
        }
        fetch()
    }, [candidateProfile])

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
            const payload = { department: selectedDepartment, experience: selectedExperience, type: selectedTypes, search: currentTrimmed }
            console.log(payload)
            try {
                setInitialLoad(true)
                const res = await axios.post("/api/candidate/getjob", payload, { withCredentials: true })
                const data = await res.data
                console.log("jobs: ", data.job)
                setJobs(data.job)
                setPage({ cursor: data.cursor, hasMore: data.hasMore })
                setInitialLoad(false)

            } catch (error) {
                console.log(error)
            } finally {
                setInitialLoad(false)
            }

        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);




    useEffect(() => {
        if (!user || !candidateProfile || !initialLoad) return
        console.log("candidateProfile: ", candidateProfile)
        setUsers({
            id: candidateProfile?.id || "",
            name: user?.name || "",
            email: user?.email || "",
            resumeId: candidateProfile?.resumes[0]?.id || "",
            resumeName: candidateProfile?.resumes[0]?.resumeName || "",
            resumeUrl: candidateProfile?.resumes[0]?.resumeUrl || "",
            createdAt: candidateProfile?.resumes[0]?.createdAt || new Date()
        })
    }, [user, candidateProfile, initialLoad])

    const applyFilter = async () => {
        if (selectedDepartment.length === 0 && selectedExperience.length === 0 && selectedTypes.length === 0) {
            return
        }
        const payload = { department: selectedDepartment, experience: selectedExperience, type: selectedTypes, search }
        console.log(payload)
        try {
            setInitialLoad(true)
            const res = await axios.post("/api/candidate/getjob", payload, { withCredentials: true })
            const data = await res.data
            console.log("jobs: ", data.job)
            setJobs(data.job)
            setPage({ cursor: data.cursor, hasMore: data.hasMore })
            setInitialLoad(false)

        } catch (error) {
            console.log(error)
        } finally {
            setInitialLoad(false)
        }

    }


    return (
        <>
            <Breadcrumbs items={[{ label: "Candidate", href: "/candidate/dashboard" }, { label: "Browse Jobs" }]} />

            <PageHeader title="Browse Opportunities" description="Discover jobs that match your skills and aspirations." />

            <div className="mt-8 grid gap-8 lg:grid-cols-4">
                {/* Filters Sidebar */}
                <aside className="space-y-6 hidden lg:block lg:col-span-1 lg:sticky lg:top-6 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-3">
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
                                    setTrigger(!trigger)
                                    setSelectedTypes([])
                                    setSelectedExperience([])
                                    setSelectedDepartment([])
                                }}
                                disabled={selectedDepartment.length === 0 && selectedExperience.length === 0 && selectedTypes.length === 0}

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
                                                onCheckedChange={() => setSelectedTypes((prev) =>
                                                    prev.includes(type) ? prev.filter((l) => l !== type) : [...prev, type],
                                                )}
                                            />
                                            <label
                                                htmlFor={`type-${type}`}
                                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {type.replace("_", " ")}
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
                                                {level.replace("_", " ")}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium mb-3">Department</h3>
                                <div className="space-y-2">
                                    {Department.map((type) => (
                                        <div key={type} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`type-${type}`}
                                                checked={selectedDepartment.includes(type)}
                                                onCheckedChange={() => {
                                                    setSelectedDepartment((prev) =>
                                                        prev.includes(type) ? prev.filter((l) => l !== type) : [...prev, type],
                                                    )
                                                }}
                                            />
                                            <label
                                                htmlFor={`type-${type}`}
                                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {type.replace("_", " ")}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Button className="w-full mt-6" onClick={() => {
                            applyFilter()
                        }}
                            disabled={selectedDepartment.length === 0 && selectedExperience.length === 0 && selectedTypes.length === 0}
                        >
                            Apply Filters
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
                                onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <Sheet >
                            <SheetTrigger asChild>
                                <Button variant="outline" className="lg:hidden">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[540px] p-6 overflow-y-auto">

                                <div className="py-6 space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <SheetHeader>
                                            <SheetTitle className="flex items-center gap-2"><Filter className="h-4 w-4" />Filters</SheetTitle>
                                        </SheetHeader>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-xs"
                                            onClick={() => {
                                                setTrigger(!trigger)
                                                setSelectedTypes([])
                                                setSelectedExperience([])
                                                setSelectedDepartment([])
                                            }}
                                            disabled={selectedDepartment.length === 0 && selectedExperience.length === 0 && selectedTypes.length === 0}

                                        >
                                            Reset
                                        </Button>
                                    </div>

                                    {/* Job Type */}
                                    <div>
                                        <h3 className="text-sm font-medium mb-3">Job Type</h3>
                                        <div className="space-y-2">
                                            {jobTypes.map((type) => (
                                                <div key={type} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`mobile-type-${type}`}
                                                        checked={selectedTypes.includes(type)}
                                                        onCheckedChange={() => setSelectedTypes((prev) =>
                                                            prev.includes(type) ? prev.filter((l) => l !== type) : [...prev, type],
                                                        )}
                                                    />
                                                    <label
                                                        htmlFor={`mobile-type-${type}`}
                                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        {type.replace("_", " ")}
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
                                                        id={`mobile-level-${level}`}
                                                        checked={selectedExperience.includes(level)}
                                                        onCheckedChange={() => {
                                                            setSelectedExperience((prev) =>
                                                                prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
                                                            )
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={`mobile-level-${level}`}
                                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        {level.replace("_", " ")}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Department */}
                                    <div>
                                        <h3 className="text-sm font-medium mb-3">Department</h3>
                                        <div className="space-y-2">
                                            {Department.map((type) => (
                                                <div key={type} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`mobile-dept-${type}`}
                                                        checked={selectedDepartment.includes(type)}
                                                        onCheckedChange={() => {
                                                            setSelectedDepartment((prev) =>
                                                                prev.includes(type) ? prev.filter((l) => l !== type) : [...prev, type],
                                                            )
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={`mobile-dept-${type}`}
                                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        {type.replace("_", " ")}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <Button className="w-full mt-6" onClick={() => {
                                        applyFilter()
                                    }}
                                        disabled={selectedDepartment.length === 0 && selectedExperience.length === 0 && selectedTypes.length === 0}

                                    >
                                        Apply Filters
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <p className="text-sm text-muted-foreground">Showing {jobs?.length} job opportunities</p>

                    {!initialLoad ? <div className="space-y-4">
                        {jobs?.length > 0 ? (
                            jobs?.map((job) => (
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
                                                    <p className="text-muted-foreground">{job.recruiter}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4" aria-hidden="true" />
                                                    {job.location}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <IndianRupee className="h-4 w-4" aria-hidden="true" />
                                                    {job.minSalary} - {job.maxSalary}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4" aria-hidden="true" />
                                                    {new Date(job.createdAt).toISOString().split("T")[0]}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="secondary">{job.jobType}</Badge>
                                                {job.requirements.map((tag) => (
                                                    <Badge key={tag} variant="outline" className="font-normal">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 min-w-[120px]">
                                            <Button className="w-full cursor-pointer" onClick={() => setApplyingJob({ title: job.title, recruiter: job.recruiter || "", id: job.id })} disabled={job.applied}>
                                                {job.applied ? "Applied" : "Apply Now"}
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
                        {hasMore && (
                            <div ref={loaderRef} className="w-full flex justify-center items-center">
                                <Spinner className="w-10 h-10" />
                            </div>
                        )}
                    </div> : <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="w-full bg-muted-foreground/50 border border-border rounded-xl p-6 mb-8 animate-pulse h-50">

                            </div>
                        ))}
                    </div>}
                </section>
            </div>

            {applyingJob && (
                <ApplyJobModal user={users} trigger={trigger} setTrigger={setTrigger} job={applyingJob} open={!!applyingJob} onOpenChange={(open) => !open && setApplyingJob(null)} />
            )}
        </>
    )
}
