"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { JobCard } from "@/components/job-card"
import { Badge } from "@/components/ui/badge"
import { mockJobs, mockApplications } from "@/lib/mock-data"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation";
import { useJobStore } from "@/store/jobStore"
import { useEffect, useState } from "react"
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



export default function CandidateClientDashboardPage() {
    const router = useRouter()
    const { isLoggedIn } = useAuthStore()
    const [initialLoad, setInitialLoad] = useState(true)
    const { jobs, setJobs } = useJobStore()

    useEffect(() => {
        const fetch = async () => {
            const res = await axios.get("/api/getjob")
            const data = await res.data
            console.log(data)
            setJobs(data.job)
            setInitialLoad(false);
        }
        fetch()
    }, [setJobs])

    useEffect(() => {
        console.log(jobs)
    }, [])
    // Mock user data
    const user = {
        name: "Sarah Chen",
        resumeScore: 85,
        profileComplete: 92,
    }

    const stats = [
        { title: "Applications", value: 12, icon: Briefcase, trend: { value: 20, positive: true } },
        { title: "Job Matches", value: 47, icon: Target, description: "Based on your profile" },
        { title: "Profile Views", value: 89, icon: TrendingUp, trend: { value: 15, positive: true } },
        { title: "Resume Score", value: `${user.resumeScore}%`, icon: FileText, description: "Good standing" },
    ]

    // Get status badge variant
    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Interview Scheduled":
                return "default"
            case "Under Review":
                return "secondary"
            default:
                return "outline"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Interview Scheduled":
                return CheckCircle2
            case "Under Review":
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
                        title={`Welcome back, ${user.name.split(" ")[0]}`}
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
                            href="/ai-feedback"
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
                    {/* Recent Applications */}
                    <section className="lg:col-span-1" aria-labelledby="applications-heading">
                        <div className="flex items-center justify-between mb-4">
                            <h2 id="applications-heading" className="text-lg font-semibold">
                                Recent Applications
                            </h2>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/candidate/dashboard">View All</Link>
                            </Button>
                        </div>
                        {!initialLoad ? <div className="space-y-3">
                            {mockApplications.map((app) => {
                                const StatusIcon = getStatusIcon(app.status)
                                return (
                                    <article
                                        key={app.id}
                                        className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="font-medium truncate">{app.jobTitle}</h3>
                                                <p className="text-sm text-muted-foreground">{app.company}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{app.appliedDate}</p>
                                            </div>
                                            <Badge variant={getStatusVariant(app.status)} className="shrink-0 gap-1">
                                                <StatusIcon className="h-3 w-3" aria-hidden="true" />
                                                {app.status}
                                            </Badge>
                                        </div>
                                    </article>
                                )
                            })}
                        </div> :
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((id) => (
                                    <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-25" key={id}>

                                    </div>
                                ))}
                            </div>}

                    </section>

                    {/* Recommended Jobs */}
                    <section className="lg:col-span-2" aria-labelledby="recommended-jobs-heading">
                        <div className="flex items-center justify-between mb-4">
                            <h2 id="recommended-jobs-heading" className="text-lg font-semibold">
                                Recommended Jobs
                            </h2>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/match-results">
                                    View All
                                    <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                                </Link>
                            </Button>
                        </div>
                        {!initialLoad ? <div className="space-y-4">
                            {jobs?.map((job, index) => (
                                <JobCard
                                    key={job.id}
                                    id={job.id}
                                    title={job.title}
                                    company={job.recruiter || "Unknown"}
                                    location={job.location}
                                    salary={job.minSalary + " - " + job.maxSalary}
                                    type={job.jobType}
                                    posted={new Date(job.createdAt).toISOString().split("T")[0]}
                                    tags={job.requirements}
                                    matchScore={95 - index * 5}
                                />
                            ))}
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
