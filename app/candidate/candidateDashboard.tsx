"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { JobCard } from "@/components/job-card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/authStore"
import { useJobStore } from "@/store/jobStore"
import { useEffect, useState } from "react"
import { useApplicationsStore } from "@/store/candidateApplication"
import axios from "axios"
import {
    FileText,
    Briefcase,
    Target,
    TrendingUp,
    Upload,
    Sparkles,
    ArrowRight,
    Clock,
    CheckCircle2,
    AlertCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Inbox, Calendar } from "lucide-react"
import { InterviewStatusBadge } from "@/components/interview/interview-status-badge"
import { useCandidateInterviewStore } from "@/store/useCandidateInterviewStore"

interface Stats {
    applications: number;
    jobs: number;
    resumeScore: number;
}


export default function CandidateClientDashboardPage() {
    const { user } = useAuthStore()
    const [initialLoad, setInitialLoad] = useState(true)
    const { jobs, setJobs } = useJobStore()
    const { applications, setApplications } = useApplicationsStore()
    const { interviews, setInterviews } = useCandidateInterviewStore()
    const [stat, setStat] = useState<Stats>({
        applications: 0,
        jobs: 0,
        resumeScore: 0
    })

    useEffect(() => {
        const fetchDashboardData = async () => {
            const payload1 = { filter: "", search: "", cursor: null }
            const payload2 = { department: [], experience: [], type: [], search: "", cursor: null }

            console.log("fetching jobs")

            // Fetch jobs
            try {
                const res = await axios.post("/api/candidate/getjob", payload2)
                const data = await res.data
                setJobs(data.job || [])
            } catch (error) {
                console.error("Error fetching jobs:", error)
                setJobs([])
            }

            // Fetch applications
            try {
                const res1 = await axios.post("/api/candidate/get_applications", payload1, { withCredentials: true })
                const data1 = await res1.data
                setApplications(data1.applications || [])
            } catch (error) {
                console.error("Error fetching applications:", error)
                setApplications([])
            }

            // Fetch interviews
            try {
                const res2 = await axios.get("/api/candidate/get_interviews", { withCredentials: true })
                const data2 = await res2.data
                setInterviews(data2.interviews || [])
            } catch (error) {
                console.error("Error fetching interviews:", error)
                setInterviews([])
            }

            // Fetch stats
            try {
                const res3 = await axios.get("/api/candidate/stats/dashboard", { withCredentials: true })
                const data3 = await res3.data
                setStat({
                    applications: data3.applications || 0,
                    jobs: data3.jobs || 0,
                    resumeScore: data3.resumeScore || 0
                })
            } catch (error) {
                console.error("Error fetching stats:", error)
                setStat({
                    applications: 0,
                    jobs: 0,
                    resumeScore: 0
                })
            } finally {
                setInitialLoad(false)
            }

            // Always set loading to false, even if all requests fail

        }

        fetchDashboardData()

    }, [])


    // Mock user data


    const stats = [
        { title: "Applications", value: `${stat.applications}`, icon: Briefcase, description: "Based on your profile" },
        { title: "Job Matches", value: `${stat.jobs}`, icon: Target, description: "Based on your profile" },
        { title: "Profile Views", value: 89, icon: TrendingUp, trend: { value: 15, positive: true } },
        { title: "Resume Score", value: `${stat.resumeScore}%`, icon: FileText, description: "Good standing" },
    ]

    // Get status badge variant
    const getStatusVariant = (status: string) => {
        switch (status) {
            case "ACCEPTED":
                return "default"
            case "PENDING":
                return "secondary"
            default:
                return "outline"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ACCEPTED":
                return CheckCircle2
            case "PENDING":
                return Clock
            default:
                return AlertCircle
        }
    }



    return (
        <main className="py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs for navigation and SEO */}
                <Breadcrumbs items={[{ label: "Candidate", href: "/candidate/dashboard" }, { label: "Dashboard" }]} />

                {/* Page Header with h1 */}
                <section aria-labelledby="dashboard-heading">
                    <PageHeader
                        title={`Welcome back, ${user ? user?.name.split(" ")[0] : "..."}`}
                        description="Here's what's happening with your job search."
                    >
                        <Button asChild>
                            <Link href="/candidate/resume-upload">
                                <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                                Update Resume
                            </Link>
                        </Button>
                    </PageHeader>
                </section>

                {/* Stats Grid */}
                <section className="mt-8" aria-labelledby="stats-heading">
                    <h2 id="stats-heading" className="sr-only">
                        Dashboard Statistics
                    </h2>
                    {!initialLoad ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <StatCard key={stat.title} {...stat} />
                        ))}
                    </div> :

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((id) => (
                                <div key={id} className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-35">

                                </div>
                            ))}
                        </div>}
                </section>

                {/* Quick Actions */}
                <section className="mt-8" aria-labelledby="quick-actions-heading">
                    <h2 id="quick-actions-heading" className="text-lg font-semibold mb-4">
                        Quick Actions
                    </h2>
                    {!initialLoad ? <div className="grid gap-4 sm:grid-cols-3">
                        <Link
                            href="/candidate/resume-upload"
                            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg"
                        >
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Upload className="h-5 w-5 text-primary" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="font-medium group-hover:text-primary transition-colors">Upload Resume</p>
                                <p className="text-sm text-muted-foreground">Get AI feedback</p>
                            </div>
                        </Link>
                        <Link
                            href="/candidate/ai-feedback"
                            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg"
                        >
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="font-medium group-hover:text-primary transition-colors">AI Feedback</p>
                                <p className="text-sm text-muted-foreground">Improve your resume</p>
                            </div>
                        </Link>
                        <Link
                            href="/match-results"
                            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg"
                        >
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Target className="h-5 w-5 text-primary" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="font-medium group-hover:text-primary transition-colors">View Matches</p>
                                <p className="text-sm text-muted-foreground">Find your fit</p>
                            </div>
                        </Link>
                    </div> :
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[1, 2, 3].map((id) => <div key={id} className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-20">

                            </div>)}
                        </div>}
                </section>

                {/* Two Column Layout */}
                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-1 space-y-8">


                        {/* Recent Applications */}
                        <section className="lg:col-span-1" aria-labelledby="applications-heading">
                            <div className="flex items-center justify-between mb-4">
                                <h2 id="applications-heading" className="text-lg font-semibold">
                                    Recent Applications
                                </h2>
                                {applications.length > 0 && <Button variant="ghost" size="sm" asChild>
                                    <Link href="/candidate/applications">View All <ArrowRight className="h-4 w-4" /></Link>
                                </Button>}
                            </div>
                            {!initialLoad ? <div className="space-y-3">
                                {applications.length > 0 ? (applications.slice(0, 4).map((app) => {
                                    const StatusIcon = getStatusIcon(app.status)
                                    return (
                                        <article
                                            key={app.id}
                                            className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="font-medium truncate">{app.job.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{app.job.recruiter.companyName}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{new Date(app.createdAt).toISOString().split("T")[0]}</p>
                                                </div>
                                                <Badge variant={getStatusVariant(app.status)} className="shrink-0 gap-1">
                                                    <StatusIcon className="h-3 w-3" aria-hidden="true" />
                                                    {app.status}
                                                </Badge>
                                            </div>
                                        </article>
                                    )
                                })) : (<Card className="border-dashed bg-transparent py-4">
                                    <CardContent className="flex flex-col items-center text-center">
                                        <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                                            <Inbox className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-xl font-semibold">No Applications submitted</h3>
                                        <p className="text-muted-foreground mt-2 max-w-sm">
                                            Try submitting an application to get started.
                                        </p>
                                    </CardContent>
                                </Card>)}
                            </div> :
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((id) => (
                                        <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-25" key={id}>

                                        </div>
                                    ))}
                                </div>}

                        </section>

                        {/* Upcoming Interviews Preview */}
                        <section aria-labelledby="dashboard-interviews-heading">
                            <div className="flex items-center justify-between mb-4">
                                <h2 id="dashboard-interviews-heading" className="text-lg font-semibold">
                                    Next Interviews
                                </h2>
                                {interviews?.length > 0 && <Button variant="ghost" size="sm" asChild>
                                    <Link href="/candidate/interviews">View All <ArrowRight className="h-4 w-4" /></Link>
                                </Button>}
                            </div>
                            {!initialLoad ? <div className="space-y-3">
                                {interviews?.length > 0 ? (interviews?.slice(0, 1).map((interview, i) => (
                                    <div
                                        key={i}
                                        className="rounded-xl border border-primary/20 bg-primary/5 p-4 relative overflow-hidden group"
                                    >
                                        <div className="flex items-start justify-between relative z-10">
                                            <div>
                                                <p className="font-semibold text-primary">{interview.recruiter.companyName}</p>
                                                <p className="text-sm font-medium">{interview.application.job.title}</p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(interview.startAt).toLocaleString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </div>
                                            </div>
                                            <InterviewStatusBadge status={interview.status} />
                                        </div>
                                        {interview.status === "SCHEDULED" && <Button size="sm" className="w-full mt-4 relative z-10" asChild>
                                            <Link href="/candidate/interviews">Prepare Now</Link>
                                        </Button>}
                                    </div>
                                ))) : (<Card className="border-dashed bg-transparent py-4">
                                    <CardContent className="flex flex-col items-center text-center">
                                        <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                                            <Calendar className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-xl font-semibold">No Upcoming Interviews</h3>
                                        <p className="text-muted-foreground mt-2 max-w-sm">
                                            Check back later for new opportunities.
                                        </p>
                                    </CardContent>
                                </Card>)}
                            </div> : <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-25">

                            </div>}
                        </section>
                    </div>

                    {/* Recommended Jobs */}
                    <section className="lg:col-span-2" aria-labelledby="recommended-jobs-heading">
                        <div className="flex items-center justify-between mb-4">
                            <h2 id="recommended-jobs-heading" className="text-lg font-semibold">
                                Recommended Jobs
                            </h2>
                            {jobs.length > 0 && <Button variant="ghost" size="sm" asChild>
                                <Link href="/candidate/browse-jobs">
                                    View All
                                    <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                                </Link>
                            </Button>}
                        </div>
                        {!initialLoad ? <div className="space-y-4">
                            {jobs.length > 0 ? (jobs?.slice(0, 4).map((job, index) => (
                                <JobCard
                                    key={job.id}
                                    id={job.id}
                                    title={job.title}
                                    company={job.recruiter || "Unknown"}
                                    location={job.location}
                                    salary={job.minSalary + " - " + job.maxSalary}
                                    type={job.jobType}
                                    posted={new Date(job.createdAt).toISOString().split("T")[0]}
                                    tags={[...job.requirements.map((requirement) => requirement.name), ...job.optional.map((optional) => optional.name)]}
                                    matchScore={95 - index * 5}
                                />
                            ))) : (<Card className="border-dashed bg-transparent py-4">
                                <CardContent className="flex flex-col items-center text-center">
                                    <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                                        <Briefcase className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-semibold">No Recommended Jobs</h3>
                                    <p className="text-muted-foreground mt-2 max-w-sm">
                                        Wait for new Jobs
                                    </p>
                                </CardContent>
                            </Card>)}
                        </div> :
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((id) => (
                                    <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-40" key={id}>

                                    </div>
                                ))}
                            </div>}
                    </section>


                </div>
            </div>
        </main>
    )
}
