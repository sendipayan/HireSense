"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { InterviewCard, type CandidateInterview } from "@/components/interview/interview-card"
import { InterviewDetailModal, type InterviewDetail } from "@/components/interview/interview-detail-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InterviewStatusBadge } from "@/components/interview/interview-status-badge"
import { Calendar, History, Briefcase, User, Info } from "lucide-react"
import axios from "axios"
import { useCandidateInterviewStore } from "@/store/useCandidateInterviewStore"

export default function CandidateInterviewsPage() {
    const [selectedInterview, setSelectedInterview] = useState<InterviewDetail | null>(null)
    const { interviews, setInterviews } = useCandidateInterviewStore()
    const [trigger, setTrigger] = useState(false)

    useEffect(() => {
        const fetchInterviews = async () => {
            const response = await axios.get('/api/candidate/get_interviews', { withCredentials: true })
            const data = await response.data
            const interviews = data.interviews
            setInterviews(interviews)
            console.log(data)
        }
        fetchInterviews()
    }, [])

    const handleViewDetails = (interview: any) => {
        // Map CandidateInterview to InterviewDetail structure for the modal
        const detail: InterviewDetail = {
            id: interview.id,
            candidateName: "Sarah Chen", // Current user
            recruiterName: interview.recruiterName,
            jobTitle: interview.jobTitle,
            date: interview.date,
            time: interview.time,
            duration: "45", // Mock duration
            type: interview.meetingLink ? "online" : "in-person",
            status: interview.status,
            meetingLink: interview.meetingLink,
            location: interview.location,
            instructions: interview.instructions,
        }
        setSelectedInterview(detail)
    }

    return (
        <main className="py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Breadcrumbs items={[{ label: "Candidate", href: "/candidate/dashboard" }, { label: "Interviews" }]} />

                <PageHeader title="Interviews" description="Track and prepare for your upcoming and past job interviews." />

                <Tabs defaultValue="upcoming" className="mt-8">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
                        <TabsTrigger value="upcoming" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            Scheduled
                        </TabsTrigger>
                        <TabsTrigger value="history" className="gap-2">
                            <History className="h-4 w-4" />
                            History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {interviews?.length > 0 ? (
                                interviews?.filter((interview) => interview.status === "SCHEDULED")?.map((interview) => (
                                    <InterviewCard
                                        key={interview.id}
                                        interview={{
                                            id: interview.id,
                                            companyName: interview.recruiter.companyName,
                                            recruiterName: interview.recruiter.user.name,
                                            jobTitle: interview.application.job.title,
                                            date: new Date(interview.startAt).toLocaleDateString("en-IN", {
                                                timeZone: "Asia/Kolkata",
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            }),
                                            time: new Date(interview.startAt).toLocaleTimeString("en-IN", {
                                                timeZone: "Asia/Kolkata",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            }),
                                            location: interview.location || "",
                                            phno: interview.phno || "",
                                            status: interview.status,
                                            meetingLink: interview.meetingLink || "",
                                            instructions: interview.notes || "",
                                        }}
                                        onConfirm={() => console.log("Confirmed", interview.id)}
                                        onReschedule={() => handleViewDetails(interview)}
                                        onAddToCalendar={() => console.log("Added to calendar", interview.id)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <Calendar className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium">No upcoming interviews</h3>
                                    <p className="text-muted-foreground mt-1">
                                        When recruiters schedule interviews, they will appear here.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Preparation Tips Card */}
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 mt-12">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Info className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Interview Preparation Tips</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Make sure to research the company and the interviewers. Prepare 3-5 questions to ask at the end of
                                        the session. Check your technology and environment at least 15 minutes before any online interview.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        <div className="rounded-xl border border-border bg-card overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead>Company</TableHead>
                                        <TableHead>Job Title</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Recruiter</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {interviews?.length > 0 ? (
                                        interviews?.map((interview) => (
                                            <TableRow key={interview.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{interview.recruiter.companyName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{interview.application.job.title}</TableCell>
                                                <TableCell className="text-muted-foreground">{new Date(interview.startAt).toLocaleString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">{interview.recruiter.user.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <InterviewStatusBadge status={interview.status} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedInterview({
                                                        id: interview.id,
                                                        candidateName: "",
                                                        recruiterName: interview.recruiter.user.name,
                                                        jobTitle: interview.application.job.title,
                                                        date: new Date(interview.startAt).toLocaleDateString("en-IN", {
                                                            timeZone: "Asia/Kolkata",
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        }),
                                                        time: new Date(interview.startAt).toLocaleTimeString("en-IN", {
                                                            timeZone: "Asia/Kolkata",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: true,
                                                        }),
                                                        location: interview.location || "",
                                                        type: interview.type.split("_").join(" ").toUpperCase(),
                                                        status: interview.status,
                                                        meetingLink: interview.meetingLink || "",
                                                        phno: interview.phno || "",
                                                        instructions: interview.notes || "",
                                                        duration: interview.duration.toString() || "",
                                                    })}>
                                                        View Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                No interview history found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>

                {selectedInterview && <InterviewDetailModal
                    interview={selectedInterview}
                    trigger={trigger}
                    setTrigger={setTrigger}
                    open={!!selectedInterview}
                    onOpenChange={(open) => !open && setSelectedInterview(null)}
                    isRecruiter={false}
                />}
            </div>
        </main>
    )
}
