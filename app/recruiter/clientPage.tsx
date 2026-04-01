"use client"


import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { CandidateCard } from "@/components/candidate-card"
import { useRecruiterStore } from "@/store/RecuiterStore"
import { useRouter } from "next/navigation";
import { Users, Briefcase, Target, TrendingUp, Plus, ArrowRight, Eye, Clock, CheckCircle2, SearchX, Inbox, CircleAlert } from "lucide-react"
import { useEffect, useState } from "react"
import { useJobStore } from "@/store/jobStore"
import axios from "axios"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRecruiterApplicationsStore } from "@/store/recruiterApplication"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/store/authStore"
import { InterviewStatusBadge } from "@/components/interview/interview-status-badge"
import { useInterviewStore } from "@/store/useInterviewStore"
import toast from "react-hot-toast"

interface stats {
    jobs: number;
    applications: number;
    interviews: number;
    scheduled: number;
}


export default function RecruiterDashboardPage() {

    const [verfiy, setVerfiy] = useState(false)
    const router = useRouter()
    const [initialLoad, setInitialLoad] = useState(true);
    const { RecuiterProfile } = useRecruiterStore()
    const { jobs, setJobs } = useJobStore()
    const { user } = useAuthStore()
    const [stat, setStat] = useState<stats>({
        jobs: 0,
        applications: 0,
        interviews: 0,
        scheduled: 0,
    })
    const { interviews, setInterviews } = useInterviewStore()
    const { applications, setApplications } = useRecruiterApplicationsStore()

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
        const fetchDashboardData = async () => {
            // Fetch jobs
            try {
                const res = await axios.post("/api/recruiter/getjob", {
                    status: "ACTIVE",
                    search: "",
                    cursor: null,
                })
                const data = await res.data
                console.log(data)
                setJobs(data.job || [])
            } catch (error) {
                console.error("Error fetching jobs:", error)
                toast.error("Failed to load jobs")
                setJobs([]) // Set empty array on error
            }

            // Fetch applications
            try {
                const res1 = await axios.get("/api/recruiter/get_applications")
                const data1 = await res1.data
                setApplications(data1.applications || [])
            } catch (error) {
                console.error("Error fetching applications:", error)
                toast.error("Failed to load applications")
                setApplications([]) // Set empty array on error
            }

            // Fetch interviews
            try {
                const res2 = await axios.get("/api/recruiter/get_interview/scheduled", { withCredentials: true })
                const data2 = await res2.data
                setInterviews(data2.interviews || [])
            } catch (error) {
                console.error("Error fetching interviews:", error)
                toast.error("Failed to load interviews")
                setInterviews([]) // Set empty array on error
            }

            // Fetch stats
            try {
                const res3 = await axios.get("/api/recruiter/stats/dashboard")
                const data3 = await res3.data
                setStat({
                    jobs: data3.jobs || 0,
                    applications: data3.applications || 0,
                    interviews: data3.interviews || 0,
                    scheduled: data3.scheduled || 0,
                })
                console.log(data3)
            } catch (error) {
                console.error("Error fetching stats:", error)
                setStat({
                    jobs: 0,
                    applications: 0,
                    interviews: 0,
                    scheduled: 0,
                })
            }

            // Always set loading to false, even if all requests fail
            setInitialLoad(false)
        }
        fetchDashboardData()
    }, [setJobs, setApplications, setInterviews])



    const stats = [
        { title: "Active Jobs", value: `${stat.jobs}`, icon: Briefcase, description: "Currently hiring" },
        {
            title: "Total Candidates",
            value: `${stat.applications}`,
            icon: Users,
            description: "Total candidates applied"
        },
        { title: "Avg. Match Score", value: `${stat.interviews}%`, icon: Target, description: "AI matching accuracy" },
        { title: "Scheduled Interviews", value: `${stat.scheduled}`, icon: Clock },
    ]

    // Mock active jobs with stats




    return (
        <main className="py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <Breadcrumbs items={[{ label: "Recruiter", href: "/recruiter/dashboard" }, { label: "Dashboard" }]} />

                {/* Page Header */}
                <section aria-labelledby="dashboard-heading">
                    <PageHeader
                        title={`${user?.name + "'s"} Dashboard`}
                        description="Manage your hiring pipeline and discover top talent with AI."
                    >
                        <Button disabled={!verfiy} onClick={() => router.push("/recruiter/jobs/post-job")}>

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
                    {!initialLoad ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <StatCard key={stat.title} {...stat} />
                        ))}
                    </div> :
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((id) => (
                                <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-35" key={id}>

                                </div>
                            ))}
                        </div>}
                </section>

                {/* Two Column Layout */}
                <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:grid-rows-5">
                    {/* Active Jobs */}
                    <section className="lg:col-span-1 lg:row-span-3 " aria-labelledby="active-jobs-heading">
                        <div className="flex items-center justify-between mb-4">
                            <h2 id="active-jobs-heading" className="text-lg font-semibold">
                                Active Jobs
                            </h2>
                            {jobs?.length > 0 && <Button variant="ghost" size="sm" asChild>
                                <Link href="/recruiter/jobs">View all <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" /></Link>
                            </Button>}
                        </div>
                        {!initialLoad ? <div className="space-y-3">
                            {jobs?.length > 0 ? (jobs?.slice(0, 3).map((job) => (
                                <article
                                    key={job.id}
                                    className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
                                >
                                    <Link href={`/recruiter/jobs/edit-job?job=${job.id}`} className="hover:text-primary transition-colors">
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
                            ))) : (
                                <Card className="border-dashed bg-transparent py-4">
                                    <CardContent className="flex flex-col items-center text-center">
                                        <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                                            <Inbox className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-xl font-semibold">No Job posted</h3>
                                        <p className="text-muted-foreground mt-2 max-w-sm">
                                            Try posting a job to get started.
                                        </p>
                                    </CardContent>
                                </Card>
                            )
                            }
                        </div> :
                            <div className="space-y-3">
                                {[1, 2, 3].map((id) => (
                                    <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-25" key={id}>

                                    </div>
                                ))}
                            </div>}

                        <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                            <Link href="/recruiter/jobs/post-job">
                                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                                Post New Job
                            </Link>
                        </Button>
                    </section>

                    {/* Top Candidates */}
                    <section className="lg:col-span-2 lg:row-span-5 " aria-labelledby="top-candidates-heading">
                        <div className="flex items-center justify-between mb-4">
                            <h2 id="top-candidates-heading" className="text-lg font-semibold">
                                Top Matched Candidates
                            </h2>
                            {applications.length > 0 && <Button variant="ghost" size="sm" asChild>
                                <Link href="/recruiter/top-matches">
                                    View All
                                    <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                                </Link>
                            </Button>}
                        </div>
                        {!initialLoad ? <div className="space-y-4">
                            {applications?.length > 0 ? (applications?.map((candidate) => (
                                <CandidateCard key={candidate.id}
                                    id={candidate.id}
                                    Jid={candidate.job.id}
                                    Cid={candidate.candidate.id}
                                    name={candidate.candidate.user.name}
                                    title={candidate.job.title}
                                    location={candidate.candidate.institution}
                                    experience={candidate.candidate.experienceLevel}
                                    status={candidate.status}
                                    education={candidate.candidate.degree}
                                    
                                    resumeId={candidate.resume.id}
                                    resumeUrl={candidate.resume.resumeUrl}
                                    resumeMimeType={candidate.resume.resumeMimeType}
                                    matchScore={candidate.score}
                                    avatar={candidate.candidate.user.profilePic ? candidate.candidate.user.profilePic : ""}
                                />
                            ))) : (
                                (
                                    <Card className="border-dashed bg-transparent py-4">
                                        <CardContent className="flex flex-col items-center text-center">
                                            <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                                                <SearchX className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-xl font-semibold">No matches found</h3>
                                            <p className="text-muted-foreground mt-2 max-w-sm">
                                                No candidates matched your job requirements.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )
                            )}
                        </div> :
                            <div className="space-y-4">
                                {[1, 2, 3].map((id) => (
                                    <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-50" key={id}>

                                    </div>
                                ))}
                            </div>}
                    </section>


                    <section aria-labelledby="upcoming-interviews-heading" className="lg:col-span-1 lg:row-span-2 ">
                        <div className="flex items-center justify-between mb-4">
                            <h2 id="upcoming-interviews-heading" className="text-lg font-semibold">
                                Upcoming Interviews
                            </h2>
                            {interviews.length > 0 && <Button variant="ghost" size="sm" asChild>
                                <Link href="/recruiter/interviews">
                                    View Schedule
                                    <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                                </Link>
                            </Button>}
                        </div>
                        {!initialLoad ? <div className="rounded-xl border border-border bg-card overflow-hidden">
                            {interviews.length > 0 ? <div className="divide-y divide-border">
                                {interviews?.filter((interview) => interview.status === "SCHEDULED")?.slice(0, 2)?.map((interview, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10 border border-border/50">
                                                <AvatarImage src={interview.application.candidate.user.profilePic ? interview.application.candidate.user.profilePic : ""} />
                                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                                                    {interview.application.candidate.user.name
                                                        .split(" ")
                                                        .map((n: string) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{interview.application.candidate.user.name}</p>
                                                <p className="text-sm text-muted-foreground">{interview.application.job.title}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{new Date(interview.startAt).toLocaleString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            })}</p>
                                            <InterviewStatusBadge status={interview.status} />
                                        </div>
                                    </div>
                                ))}
                            </div> : (
                                <Card className="border-dashed bg-transparent py-4">
                                    <CardContent className="flex flex-col items-center text-center">
                                        <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                                            <CircleAlert className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-xl font-semibold">No Upcoming Interviews</h3>
                                        <p className="text-muted-foreground mt-2 max-w-sm">
                                            Try scheduling an interview to get started.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div> : <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-25">

                        </div>}
                    </section>


                </div>

                {/* Recent Activity */}
                {/*<section className="mt-8" aria-labelledby="activity-heading">
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
                </section>*/}
            </div>
        </main>
    )
}
