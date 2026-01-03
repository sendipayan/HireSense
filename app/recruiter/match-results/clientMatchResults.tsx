"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { mockMatchResults } from "@/lib/mock-data"
import {
    Target,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Briefcase,
    MapPin,
    DollarSign,
    GraduationCap,
    Star,
    MessageSquare,
    Calendar,
    IndianRupee
} from "lucide-react"
import { useEffect, useState } from "react"
import { useRecruiterApplicationsStore } from "@/store/recruiterApplication"
import { useJobStore } from "@/store/jobStore"
import axios from "axios"
import type { Job } from "@/store/jobStore"

type ApplicationJob = {
    title: string;
    id: string;
};

type Candidate = {
    id: string;
    institution: string;
    experienceLevel: string;
    degree: string;
    primarySkills: string[];
    secondarySkills: string[];
    user: {
        name: string;
    };
};

type Application = {
    candidate: Candidate;
    createdAt: string;
    id: string;
    score: number;
    status: string;
    job: ApplicationJob;
};




export default function MatchResultsClientPage({ candidateId, jobId }: { candidateId: string, jobId: string }) {
    const { breakdown, strengths, gaps, recommendation } = mockMatchResults
    const { applications, setApplications } = useRecruiterApplicationsStore()
    const { jobs, setJobs } = useJobStore()
    const [initialLoad, setInitialLoad] = useState(true)
    const [uniqueJob, setUniqueJob] = useState<Job>({
        id: "",
        recruiterId: "",
        title: "",
        description: "",
        location: "",
        minSalary: 0,
        maxSalary: "",
        department: "",
        jobType: "",
        experienceRequired: "",
        requirements: [],
        optional: [],
        benifits: [],
        createdAt: "",
        updatedAt: "",
        recruiter: "",
        status: "",
    })
    const [uniqueApplication, setUniqueApplication] = useState<Application>({
        candidate: {
            id: "",
            institution: "",
            experienceLevel: "",
            degree: "",
            primarySkills: [],
            secondarySkills: [],
            user: {
                name: "",
            },
        },
        createdAt: "",
        id: "",
        score: 0,
        status: "",
        job: {
            title: "",
            id: "",
        },
    })


    useEffect(() => {
        const fetch = async () => {
            const res = await axios.get("/api/getjob")
            const data = await res.data
            setJobs(data.job)
            const res1 = await axios.get("/api/recruiter/get_applications")
            const data1 = await res1.data
            setApplications(data1.applications)

        }
        fetch()
    }, [setJobs])



    useEffect(() => {
        if (!jobs || !applications) {
            return
        }
        const uniqueJob = jobs.find((job) => job.id === jobId)
        console.log("uniqueJob: ", uniqueJob)
        if (uniqueJob) {
            setUniqueJob({ ...uniqueJob })
        }
        const uniqueApplication = applications.find((application) => application.job.id === jobId && application.candidate.id === candidateId)
        console.log("uniqueApplication: ", uniqueApplication)
        if (uniqueApplication) {
            setUniqueApplication({ ...uniqueApplication })
        }
        setInitialLoad(false);
    }, [applications, jobs])

    return (
        <main className="py-8 sm:py-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <Breadcrumbs items={[{ href: "/recruiter/dashboard", label: "Recruiter" }, { label: "Match Results" }]} />

                {/* Page Header */}
                <PageHeader
                    title="Match Analysis"
                    description="AI-powered compatibility analysis between candidate and job opportunity."
                />

                {/* Overall Score Hero */}
                <section className="mt-8" aria-labelledby="score-heading">
                    {!initialLoad ? <div className="rounded-2xl border border-border bg-card p-8 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                            <Target className="h-4 w-4" aria-hidden="true" />
                            AI Match Score
                        </div>
                        <h2 id="score-heading" className="sr-only">
                            Overall Match Score
                        </h2>
                        <div className="text-7xl font-bold tracking-tight text-primary">{uniqueApplication.score}%</div>
                        <p className="mt-2 text-lg text-muted-foreground">Excellent Match</p>
                        <div className="mt-6 flex justify-center gap-4 flex-col md:flex-row ">
                            <Button size="lg">
                                <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
                                Contact Candidate
                            </Button>
                            <Button size="lg" variant="outline" className="bg-transparent">
                                <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                                Schedule Interview
                            </Button>
                        </div>
                    </div> :
                        <div className="rounded-2xl bg-muted-foreground/50 border border-border p-6 mb-8 animate-pulse h-[40vh]"></div>}
                </section>

                {/* Match Details Grid */}
                {!initialLoad ? <div className="mt-8 grid gap-8 lg:grid-cols-2">
                    {/* Candidate Summary */}
                    <section aria-labelledby="candidate-heading">
                        <h2 id="candidate-heading" className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">
                                C
                            </span>
                            Candidate Profile
                        </h2>
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
                                    {uniqueApplication?.candidate.user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{uniqueApplication?.candidate.user.name}</h3>
                                    <p className="text-muted-foreground"><strong>For Role: </strong>{uniqueApplication?.job.title}</p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <span>{uniqueApplication?.candidate.degree}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <span>{uniqueApplication?.candidate.experienceLevel}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <span>{uniqueApplication?.candidate.institution}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Star className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <span>{uniqueApplication?.candidate.primarySkills.length + uniqueApplication?.candidate.secondarySkills.length} Skills</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <p className="text-sm font-medium mb-2">Top Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueApplication?.candidate.primarySkills.map((skill) => (
                                        <Badge key={skill} variant="secondary">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Job Summary */}
                    <section aria-labelledby="job-heading">
                        <h2 id="job-heading" className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground text-xs font-bold">
                                J
                            </span>
                            Job Details
                        </h2>
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h3 className="text-xl font-semibold">{uniqueJob?.title}</h3>
                            <p className="text-muted-foreground">{uniqueJob?.recruiter}</p>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <span>{uniqueJob?.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <IndianRupee className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <span>{uniqueJob?.minSalary}-{uniqueJob?.maxSalary}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <span>{uniqueJob?.jobType}</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <p className="text-sm font-medium mb-2">Required Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueJob?.requirements.map((tag) => (
                                        <Badge key={tag} variant="outline">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">{uniqueJob?.description}</p>
                        </div>
                    </section>
                </div> :

                    <div className="mt-8 grid gap-8 lg:grid-cols-2">
                        <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-[40vh]">

                        </div>

                        <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-[40vh]">

                        </div>

                    </div>}

                {/* Score Breakdown */}
                <section className="mt-8" aria-labelledby="breakdown-heading">
                    <h2 id="breakdown-heading" className="text-lg font-semibold mb-4">
                        Score Breakdown
                    </h2>
                    {!initialLoad ? <div className="rounded-xl border border-border bg-card p-6">
                        <div className="space-y-6">
                            {breakdown.map((item) => (
                                <div key={item.category}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium">{item.category}</span>
                                            <span className="text-xs text-muted-foreground">({item.weight}% weight)</span>
                                        </div>
                                        <span className="font-semibold text-primary">{item.score}%</span>
                                    </div>
                                    <Progress value={item.score} className="h-2" aria-label={`${item.category} score: ${item.score}%`} />
                                </div>
                            ))}
                        </div>
                    </div> :
                        <div className="bg-muted-foreground/50 border border-border rounded-xl p-6 mb-8 animate-pulse h-[50vh]">

                        </div>}
                </section>

                {/* Strengths & Gaps */}
                {!initialLoad ? <div className="mt-8 grid gap-8 lg:grid-cols-2">
                    {/* Strengths */}
                    <section aria-labelledby="strengths-heading">
                        <h2 id="strengths-heading" className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                            Strengths
                        </h2>
                        <div className="rounded-xl border border-border bg-card p-6">
                            <ul className="space-y-3">
                                {strengths.map((strength, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                                        <span className="text-sm">{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Gaps */}
                    <section aria-labelledby="gaps-heading">
                        <h2 id="gaps-heading" className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-warning" aria-hidden="true" />
                            Areas to Explore
                        </h2>
                        <div className="rounded-xl border border-border bg-card p-6">
                            <ul className="space-y-3">
                                {gaps.map((gap, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                                        <span className="text-sm">{gap}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div> :

                    <div className="mt-8 grid gap-8 lg:grid-cols-2">
                        <div className="bg-muted-foreground/50 border border-border rounded-xl p-6 mb-8 animate-pulse h-[20vh]">

                        </div>
                        <div className="bg-muted-foreground/50 border border-border rounded-xl p-6 mb-8 animate-pulse h-[20vh]">

                        </div>
                    </div>}

                {/* AI Recommendation */}
                <section className="mt-8" aria-labelledby="recommendation-heading">
                    <h2 id="recommendation-heading" className="text-lg font-semibold mb-4">
                        AI Recommendation
                    </h2>
                    {!initialLoad ? <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                        <p className="leading-relaxed">{recommendation}</p>
                    </div> :
                        <div className="bg-muted-foreground/50 border border-border rounded-xl p-6 mb-8 animate-pulse h-25">

                        </div>}
                </section>

                {/* Actions */}

            </div>
        </main>
    )
}
