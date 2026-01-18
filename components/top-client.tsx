"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Target, Sparkles, Filter, BrainCircuit, Trophy, LayoutGrid, List, Calendar, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { CandidateCard } from "@/components/candidate-card"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { useRecruiterApplicationsStore } from "@/store/recruiterApplication"
import { useJobStore } from "@/store/jobStore"
import axios from "axios"
import { Checkbox } from "@/components/ui/checkbox"
import { ScheduleInterviewModal } from "./interview/schedule-interview-modal"

interface ApplicationList {
    CId: string;
    Cname: string;
    resumeUrl: string;
    resumeMimeType: string;
    JId: string[];
    Jname: string[];
}

export function TopMatchesClient() {
    const { jobs, setJobs } = useJobStore()
    const [selectedJob, setSelectedJob] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedIds, setSelectedIds] = useState<string[]>([]) // added state for multi-selection
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false) // added state for schedule modal
    const [minScore, setMinScore] = useState("0")
    const [trigger, setTrigger] = useState(false)
    const { applications, setApplications } = useRecruiterApplicationsStore()
    const [loading, setLoading] = useState(true)
    const [jobload, setJobload] = useState(true)
    const [applicationList, setApplicationList] = useState<ApplicationList[]>([])


    useEffect(() => {
        const fetch = async () => {
            const res = await axios.get("/api/getjob")
            const data = await res.data
            setJobs(data.job.job)
            if (data.job.job.length > 0) {
                setSelectedJob(data.job.job[0]?.id)
            }
            setJobload(false)
            console.log(data.job)
        }
        fetch()

    }, [setJobs, trigger])


    useEffect(() => {
        console.log("working: ", selectedJob)
        const fetchApplications = async () => {
            if (selectedJob?.trim() === "") {
                setLoading(false)
                return
            }

            setLoading(true)
            const response = await axios.get(`/api/recruiter/get_applications/${selectedJob}`)
            console.log(response.data)
            setApplications(response.data.applications)
            setLoading(false)
        }
        fetchApplications()
    }, [selectedJob, trigger])


    const filteredCandidates = useMemo(() => {
        if (!applications || !Array.isArray(applications)) {
            return []
        }
        return applications
            .filter((c) => {
                const matchesSearch =
                    c.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.job.title.toLowerCase().includes(searchQuery.toLowerCase())
                const matchesScore = c.score >= Number.parseInt(minScore)
                return matchesSearch && matchesScore
            })
            .sort((a, b) => b.score - a.score)
    }, [searchQuery, minScore, applications])

    const toggleSelect = (id: string, Aid: string) => {
        const app = applications.find(a => a.id === id);
        if (!app) return;

        if (!selectedIds.includes(id)) {
            setApplicationList(prev => {
                const existing = prev.find(a => a.CId === Aid);

                if (existing) {
                    return prev.map(a =>
                        a.CId === Aid
                            ? {
                                ...a,
                                JId: [...a.JId, app.job.id],
                                Jname: [...a.Jname, app.job.title],
                            }
                            : a
                    );
                }

                return [
                    ...prev,
                    {
                        CId: Aid,
                        Cname: app.candidate.user.name,
                        resumeMimeType: app.resume.resumeMimeType,
                        resumeUrl: app.resume.resumeUrl,
                        JId: [app.job.id],
                        Jname: [app.job.title],
                    },
                ];
            });

            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));

            setApplicationList(prev => {
                return prev
                    .map(a =>
                        a.CId === Aid
                            ? {
                                ...a,
                                JId: a.JId.filter(j => j !== app.job.id),
                                Jname: a.Jname.filter(j => j !== app.job.title),
                            }
                            : a
                    )
                    .filter(a => a.CId !== Aid || a.JId.length > 0);
            });
        }
    };


    const selectAll = () => {
        if (selectedIds.length === filteredCandidates.length) {
            setSelectedIds([])
            setApplicationList([])
        } else {
            const select = Array.from(new Set(filteredCandidates.map((c) => c.candidate.id)))
            const application = select.map((id) => {
                return {
                    CId: id,
                    Cname: filteredCandidates.find((c) => c.candidate.id === id)?.candidate.user.name || "",
                    resumeMimeType: filteredCandidates.find((c) => c.candidate.id === id)?.resume.resumeMimeType || "",
                    resumeUrl: filteredCandidates.find((c) => c.candidate.id === id)?.resume.resumeUrl || "",
                    JId: filteredCandidates.filter((c) => c.candidate.id === id)?.map((c) => c.job.id),
                    Jname: filteredCandidates.filter((c) => c.candidate.id === id)?.map((c) => c.job.title)
                }
            })
            setApplicationList(application)
            setSelectedIds(filteredCandidates.map((c) => c.id))
        }
    }

    const handleBulkSchedule = () => {
        setIsScheduleModalOpen(true)
    }

    const handleBulkWaitlist = async () => {
        if (selectedIds.length === 0) {
            return
        }
        console.log("[v0] Adding candidates to waitlist:", selectedIds)

        try {
            const response = await axios.post("/api/recruiter/add_waitlist", { ids: selectedIds }, { withCredentials: true })
            console.log("Response:", response.data)
            if (response.status === 200) {
                setTrigger(!trigger)
            }
        } catch (err) {
            console.log("Error adding candidates to waitlist:", err)
        }
        setApplicationList([])
        setSelectedIds([])
    }

    return (
        <main className="min-h-screen bg-background text-foreground py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Breadcrumbs items={[{ label: "Recruiter", href: "/recruiter/dashboard" }, { label: "Top Matches" }]} />

                {/* Hero Section with AI Accent */}
                {!jobload ? <div className="relative mt-8 overflow-hidden rounded-3xl bg-linear-to-br from-primary/10 via-background to-background border border-border/50 p-4 lg:p-8">
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 border border-primary/20">
                                <Sparkles className="h-4 w-4" />
                                AI-Powered Talent Discovery
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                                Discover your <span className="text-primary italic">Perfect Match.</span>
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Our advanced LLM algorithms analyze candidate experience, technical prowess, and cultural alignment to
                                surface the top 1% of talent for your specific roles.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 w-full">
                            <div className="bg-card/50 backdrop-blur-xl border border-border w-full p-2 rounded-2xl shadow-sm">
                                <p className="text-sm font-medium text-muted-foreground mb-3">Analyzing for Position:</p>
                                <Select value={selectedJob} onValueChange={(value) => { setSelectedJob(value); setApplicationList([]); setSelectedIds([]); }}>
                                    <SelectTrigger className="w-full bg-background border-primary/30 h-12 text-lg">
                                        <SelectValue placeholder="Select a job..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobs?.map((job) => (
                                            <SelectItem key={job.id} value={job.id} >
                                                {job.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="mt-4 flex flex-col lg:flex-row items-center justify-between  text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1 ">
                                        <Target className="h-3 w-3 text-primary" /> {filteredCandidates.length} Total Matches
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <BrainCircuit className="h-3 w-3 text-primary" /> High Confidence
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
                </div> : <div className="bg-muted-foreground/50 border border-border rounded-3xl p-6 mb-8 animate-pulse h-70"></div>}

                {/* Filters & Actions Bar */}
                {!jobload ? <div className="mt-12 flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-md p-4 rounded-2xl border border-border shadow-sm">
                    <div className="flex flex-col lg:flex-row items-center gap-4 w-full md:max-w-md">
                        <div className="flex items-center gap-2 px-2 lg:border-r border-border mr-2">
                            <Checkbox
                                checked={selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0}
                                onCheckedChange={selectAll}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                                {selectedIds.length === 0 ? "Select All" : `${selectedIds.length} Selected`}
                            </span>
                        </div>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Filter by name or skills..."
                                className="pl-10 bg-background border-border focus:border-primary/50 h-11"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-3 w-full md:w-auto">
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                                <Button size="sm" onClick={handleBulkSchedule} className="h-11 px-4">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Schedule
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleBulkWaitlist} className="h-11 px-4 bg-transparent">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Waitlist
                                </Button>
                            </div>
                        )}

                        <div className="flex items-center gap-2 bg-background/50 border border-border rounded-lg px-3 h-11">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Min Match:</span>
                            <Select value={minScore} onValueChange={setMinScore}>
                                <SelectTrigger className="w-20 border-0 bg-transparent h-8 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="70">70%</SelectItem>
                                    <SelectItem value="80">80%</SelectItem>
                                    <SelectItem value="90">90%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                    </div>
                </div> : <div className="bg-muted-foreground/50 border border-border rounded-2xl p-6 mb-8 animate-pulse h-20"></div>}

                {/* Results Section */}
                {!loading ? <div className="mt-8 grid gap-6 lg:grid-cols-1">
                    {filteredCandidates.length > 0 ? (
                        <div className="space-y-4">
                            {filteredCandidates.map((candidate, index) => (
                                <div key={candidate.id} className="relative group flex items-center gap-4">
                                    <div className="shrink-0 pt-2">
                                        <Checkbox
                                            checked={selectedIds.includes(candidate.id)}
                                            onCheckedChange={() => toggleSelect(candidate.id, candidate.candidate.id)}
                                            className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                    </div>
                                    <div className="relative flex-1">
                                        {index === 0 && (
                                            <div className="absolute -top-3 left-6 z-20">
                                                <Badge className="bg-primary text-primary-foreground flex items-center gap-1.5 px-3 py-1 border-2 border-background">
                                                    <Trophy className="h-3.5 w-3.5" /> Best Match
                                                </Badge>
                                            </div>
                                        )}
                                        <CandidateCard key={candidate.id}
                                            id={candidate.id}
                                            Jid={candidate.job.id}
                                            Cid={candidate.candidate.id}
                                            name={candidate.candidate.user.name}
                                            title={candidate.job.title}
                                            location={candidate.candidate.institution}
                                            experience={candidate.candidate.experienceLevel}
                                            resumeId={candidate.resume.id}
                                            resumeMimeType={candidate.resume.resumeMimeType}
                                            resumeUrl={candidate.resume.resumeUrl}
                                            education={candidate.candidate.degree}
                                            status={candidate.status}
                                            skills={candidate.candidate.primarySkills}
                                            matchScore={candidate.score}
                                            avatar=""
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed bg-transparent py-20">
                            <CardContent className="flex flex-col items-center text-center">
                                <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                                    <Target className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold">No high-tier matches found</h3>
                                <p className="text-muted-foreground mt-2 max-w-sm">
                                    Try adjusting your minimum match score or searching for broader terms.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-6 bg-transparent"
                                    onClick={() => {
                                        setSearchQuery("")
                                        setMinScore("80")
                                    }}
                                >
                                    Reset Filters
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div> : <div className="mt-8 grid gap-6 lg:grid-cols-1">
                    {[1, 2, 3].map((id) => (
                        <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-50" key={id}></div>
                    ))}
                </div>}
            </div>
            <ScheduleInterviewModal
                open={isScheduleModalOpen}
                onOpenChange={setIsScheduleModalOpen}
                onSchedule={(values) => {
                    console.log("[v0] Scheduling interviews for:", selectedIds, values)
                    setApplicationList([])
                    setSelectedIds([])
                }}
                applications={applicationList}
                selectedApplicationIds={applications.filter((a) => selectedIds.includes(a.id)).map((a) => a.id)}
                setTrigger={setTrigger}
            />
        </main>
    )
}
