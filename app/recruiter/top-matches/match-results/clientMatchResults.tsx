"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { mockMatchResults } from "@/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Target,
    CheckCircle2,
    AlertCircle,
    XCircle,
    ArrowRight,
    Briefcase,
    MapPin,
    DollarSign,
    University,
    GraduationCap,
    Star,
    MessageSquare,
    Calendar,
    IndianRupee,
    Clock
} from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"
import type { Job } from "@/store/jobStore"
import { ScheduleInterviewModal } from "@/components/interview/schedule-interview-modal"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
type ApplicationJob = {
    title: string;
    id: string;
};

type Candidate = {
    id: string;
    institution: string;
    experienceLevel: string;
    degree: string;
    primarySkills: { id: string, name: string }[];
    secondarySkills: { id: string, name: string }[];
    user: {
        name: string;
        profilePic?: string;
    };
};

type Resume = {
    id: string;
    resumeName: string;
    resumeUrl: string;
    resumeMimeType: string;
    resumeSize: number;
}

type Application = {
    candidate: Candidate;
    createdAt: string;
    id: string;
    score: number;
    status: string;
    job: ApplicationJob;
    resume: Resume;
};




export default function MatchResultsClientPage({ candidateId, jobId }: { candidateId: string, jobId: string }) {
    const { breakdown, strengths, gaps, recommendation } = mockMatchResults
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
    const [initialLoad, setInitialLoad] = useState(true)
    const [trigger, setTrigger] = useState(false)
    const router = useRouter()
    const [link, setLink] = useState<string>("")
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
                profilePic: "",
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
        resume: {
            id: "",
            resumeName: "",
            resumeUrl: "",
            resumeMimeType: "",
            resumeSize: 0,
        },

    })


    useEffect(() => {
        const fetch = async () => {
            const res = await axios.get(`/api/getjob/${jobId}`)
            const res1 = await axios.get(`/api/recruiter/get_applications/unique?jobId=${jobId}&candidateId=${candidateId}`)
            const data = await res.data
            setUniqueJob({ ...data.job })
            const data1 = await res1.data
            setUniqueApplication({ ...data1.applications })
            setInitialLoad(false)
        }
        fetch()
    }, [])

    useEffect(() => {

        if (uniqueApplication.resume.id?.trim() !== "") {

        }
    }, [uniqueApplication])


    const handleAddToWaitlist = async () => {
        if (uniqueApplication.id.trim() === "") return

        try {
            const res = await axios.post(`/api/recruiter/toogle_waitlist`, { id: uniqueApplication.id }, { withCredentials: true })
            const data = await res.data
            setUniqueApplication((prev) => ({ ...prev, status: data.status }))
            toast.success(data?.message || "Toggled waitlist")

        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("Form submission error:", err.response?.data?.error);
                toast.error(err.response?.data?.error || "Failed to toggle waitlist");
            } else {
                console.error("Unexpected error:", err);
                toast.error("An unexpected error occurred");
            }

        }

    }

    return (
        <main className="py-8 sm:py-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <Breadcrumbs items={[{ href: "/recruiter/dashboard", label: "Recruiter" }, { href: "/recruiter/top-matches", label: "Top Matches" }, { label: "Match Results" }]} />

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

                            <Button size="lg" onClick={() => setIsScheduleModalOpen(true)}>
                                <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                                Schedule Interview
                            </Button>
                            {(uniqueApplication.status === "WAITLIST" || uniqueApplication.status === "PENDING") && <Button size="lg" variant={uniqueApplication.status === "WAITLIST" ? "destructive" : "outline"} className="cursor-pointer" onClick={() => handleAddToWaitlist()}>
                                {uniqueApplication.status !== "WAITLIST" ? <Clock className="mr-2 h-4 w-4" aria-hidden="true" /> : <XCircle className="mr-2 h-4 w-4" aria-hidden="true" />}
                                {uniqueApplication.status === "WAITLIST" ? "Remove from Waitlist" : "Add to Waitlist"}
                            </Button>}
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
                                <Avatar className="h-10 w-10 border border-border/50">
                                    <AvatarImage src={uniqueApplication.candidate.user.profilePic ? uniqueApplication.candidate.user.profilePic : ""} />
                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                                        {uniqueApplication.candidate.user.name
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-semibold">{uniqueApplication?.candidate.user.name}</h3>

                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3 text-sm">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <span>{uniqueApplication?.candidate.degree}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <span>{uniqueApplication?.candidate.experienceLevel}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <University className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
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
                                        <Badge key={skill.id} variant="default">
                                            {skill.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6">
                                <p className="text-sm font-medium mb-2">Secondary Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueApplication?.candidate.secondarySkills.map((skill) => (
                                        <Badge key={skill.id} variant="secondary">
                                            {skill.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 justify-start items-center mt-6">
                                {uniqueApplication?.resume?.resumeMimeType === "application/pdf" && <Button size="sm" onClick={() => {
                                    window.open(`https://docs.google.com/gview?url=${encodeURIComponent(uniqueApplication?.resume?.resumeUrl)}&embedded=true`, "_blank", "noopener,noreferrer")
                                }} variant="default" className="cursor-pointer">
                                    View Resume
                                </Button>}
                                <Button size="sm" onClick={() => {
                                    window.open(uniqueApplication?.resume?.resumeUrl, "_blank", "noopener,noreferrer")
                                }} variant="secondary" className="cursor-pointer">
                                    Download Resume
                                </Button>
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
                                        <Badge key={tag.id} variant="outline">
                                            {tag.name}
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

                {uniqueApplication && <ScheduleInterviewModal
                    open={isScheduleModalOpen}
                    onOpenChange={setIsScheduleModalOpen}
                    onSchedule={() => router.back()}
                    selectedApplicationIds={[uniqueApplication.id]}
                    applications={[{
                        JId: [uniqueApplication.job.id],
                        Jname: [uniqueApplication.job.title],
                        CId: uniqueApplication.candidate.id,
                        Cname: uniqueApplication.candidate.user.name,
                        resumeUrl: uniqueApplication.resume.resumeUrl,
                        resumeMimeType: uniqueApplication.resume.resumeMimeType,
                    }]}
                    setTrigger={setTrigger}
                    trigger={trigger}
                />}

            </div>

        </main>
    )
}
