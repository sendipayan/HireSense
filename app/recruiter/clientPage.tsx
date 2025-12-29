"use client"


import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { CandidateCard } from "@/components/candidate-card"
import { Badge } from "@/components/ui/badge"
import { mockCandidates, mockJobs } from "@/lib/mock-data"
import { useAuthStore } from "@/store/authStore"
import { useRecruiterStore } from "@/store/RecuiterStore"
import { useRouter } from "next/navigation";
import { Users, Briefcase, Target, TrendingUp, Plus, ArrowRight, Eye, Clock, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useJobStore } from "@/store/jobStore"
import axios from "axios"




export default function RecruiterDashboardPage() {

    const [verfiy, setVerfiy] = useState(false)
    const router = useRouter()
    const { RecuiterProfile } = useRecruiterStore()
    const { isLoggedIn } = useAuthStore()
    const { jobs, setJobs } = useJobStore()

    useEffect(() => {

        if (RecuiterProfile) {
            console.log(RecuiterProfile.isVerified)
            if (RecuiterProfile.isVerified === "APPROVED") {
                setVerfiy(true)
            }
            else {
                setVerfiy(false)
            }
        }
    }, [RecuiterProfile])

    useEffect(() => {
        console.log(verfiy)
    }, [verfiy])

    useEffect(() => {
        const fetch = async () => {
            const res = await axios.get("/api/getjob")
            const data = await res.data
            console.log(data)
            setJobs(data.job)
        }
        fetch()
    }, [setJobs])



    useEffect(() => {
        if (jobs) {
            console.log(jobs)
        }
    }, [jobs])
    // Mock company data
    const company = {
        name: "TechCorp Inc.",
        activeJobs: 8,
        totalCandidates: 234,
    }

    const stats = [
        { title: "Active Jobs", value: company.activeJobs, icon: Briefcase, description: "Currently hiring" },
        {
            title: "Total Candidates",
            value: company.totalCandidates,
            icon: Users,
            trend: { value: 12, positive: true },
        },
        { title: "Avg. Match Score", value: "87%", icon: Target, description: "AI matching accuracy" },
        { title: "Time to Hire", value: "18 days", icon: TrendingUp, trend: { value: 25, positive: true } },
    ]

    // Mock active jobs with stats
    const activeJobs = mockJobs.slice(0, 4).map((job, index) => ({
        ...job,
        applicants: 15 + index * 8,
        newApplicants: 3 + index,
        status: index === 0 ? "Active" : index === 1 ? "Reviewing" : "Active",
    }))




    return (
        <main className="py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <Breadcrumbs items={[{ label: "Recruiter", href: "/recruiter/dashboard" }, { label: "Dashboard" }]} />

                {/* Page Header */}
                <section aria-labelledby="dashboard-heading">
                    <PageHeader
                        title={`${company.name} Dashboard`}
                        description="Manage your hiring pipeline and discover top talent with AI."
                    >
                        <Button disabled={!verfiy} onClick={() => router.push("/recruiter/post-job")}>

                            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                            Post New Job

                        </Button>
                    </PageHeader>
                </section>

                {/* Stats Grid */}
                <section className="mt-8" aria-labelledby="stats-heading">
                    <h2 id="stats-heading" className="sr-only">
                        Hiring Statistics
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <StatCard key={stat.title} {...stat} />
                        ))}
                    </div>
                </section>

                {/* Two Column Layout */}
                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                    {/* Active Jobs */}
                    <section className="lg:col-span-1" aria-labelledby="active-jobs-heading">
                        <div className="flex items-center justify-between mb-4">
                            <h2 id="active-jobs-heading" className="text-lg font-semibold">
                                Active Jobs
                            </h2>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/recruiter/post-job">View all <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" /></Link>
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {jobs?.map((job) => (
                                <article
                                    key={job.id}
                                    className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
                                >
                                    <Link href={`/recruiter/edit-job?job=${job.id}`} className="hover:text-primary transition-colors">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="font-medium truncate">

                                                    {job.title}

                                                </h3>
                                                <p className="text-sm text-muted-foreground">{job.location}</p>
                                            </div>

                                        </div>
                                        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-4 w-4" aria-hidden="true" />
                                                15 applicants
                                            </span>

                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                            <Link href="/recruiter/post-job">
                                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                                Post New Job
                            </Link>
                        </Button>
                    </section>

                    {/* Top Candidates */}
                    <section className="lg:col-span-2" aria-labelledby="top-candidates-heading">
                        <div className="flex items-center justify-between mb-4">
                            <h2 id="top-candidates-heading" className="text-lg font-semibold">
                                Top Matched Candidates
                            </h2>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/match-results">
                                    View All
                                    <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                                </Link>
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {mockCandidates.slice(0, 3).map((candidate) => (
                                <CandidateCard key={candidate.id} {...candidate} />
                            ))}
                        </div>
                    </section>
                </div>

                {/* Recent Activity */}
                <section className="mt-8" aria-labelledby="activity-heading">
                    <h2 id="activity-heading" className="text-lg font-semibold mb-4">
                        Recent Activity
                    </h2>
                    <div className="rounded-xl border border-border bg-card divide-y divide-border">
                        {[
                            {
                                icon: Users,
                                text: "New application from Sarah Chen for Senior Frontend Engineer",
                                time: "2 hours ago",
                            },
                            { icon: Eye, text: "Michael Rodriguez viewed your job posting", time: "4 hours ago" },
                            { icon: CheckCircle2, text: "Interview scheduled with Emily Watson", time: "Yesterday" },
                            { icon: Clock, text: "Backend Developer posting expires in 3 days", time: "System" },
                        ].map((activity, index) => (
                            <div key={index} className="flex items-center gap-4 p-4">
                                <div className="rounded-lg bg-muted p-2">
                                    <activity.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{activity.text}</p>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}
