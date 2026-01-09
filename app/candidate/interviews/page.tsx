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
// Mock candidate interview data
const mockCandidateInterviews: CandidateInterview[] = [
    {
        id: "int-1",
        companyName: "TechCorp Inc.",
        recruiterName: "Alex Rivera",
        jobTitle: "Senior Frontend Engineer",
        date: "Oct 24, 2025",
        time: "10:00 AM",
        meetingLink: "https://zoom.us/j/123456789",
        status: "confirmed",
        instructions: "Technical round focusing on React and System Design.",
    },
    {
        id: "int-2",
        companyName: "Innovate Solutions",
        recruiterName: "Sarah Miller",
        jobTitle: "UI Designer",
        date: "Oct 28, 2025",
        time: "02:00 PM",
        location: "One Market St, San Francisco",
        status: "scheduled",
    },
]

const mockInterviewHistory: (InterviewDetail & { companyName: string })[] = [
    {
        id: "int-3",
        candidateName: "Sarah Chen",
        companyName: "GreenFuture",
        recruiterName: "Mark Wilson",
        jobTitle: "Frontend Developer",
        date: "Oct 15, 2025",
        time: "11:00 AM",
        duration: "45",
        type: "online",
        status: "completed",
        activityLog: [{ action: "Interview Completed", user: "Mark Wilson", timestamp: "Oct 15, 11:45 AM" }],
    },
    {
        id: "int-4",
        candidateName: "Sarah Chen",
        companyName: "CloudScale",
        recruiterName: "Jessica Lee",
        jobTitle: "React Engineer",
        date: "Oct 10, 2025",
        time: "09:30 AM",
        duration: "30",
        type: "phone",
        status: "completed",
        activityLog: [{ action: "Interview Completed", user: "Jessica Lee", timestamp: "Oct 10, 10:00 AM" }],
    },
]

export default function CandidateInterviewsPage() {
    const [selectedInterview, setSelectedInterview] = useState<InterviewDetail | null>(null)

    useEffect(() => {
        const fetchInterviews = async () => {
            const response = await axios.get('/api/candidate/get_interviews', { withCredentials: true })
            const data = await response.data
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
            activityLog: [
                { action: "Interview Scheduled", user: interview.recruiterName, timestamp: "2 days ago" },
                ...(interview.status === "confirmed"
                    ? [{ action: "Attendance Confirmed", user: "Sarah Chen", timestamp: "Yesterday" }]
                    : []),
            ],
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
                            Upcoming
                        </TabsTrigger>
                        <TabsTrigger value="history" className="gap-2">
                            <History className="h-4 w-4" />
                            History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {mockCandidateInterviews.length > 0 ? (
                                mockCandidateInterviews.map((interview) => (
                                    <InterviewCard
                                        key={interview.id}
                                        interview={interview}
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
                                    {mockInterviewHistory.length > 0 ? (
                                        mockInterviewHistory.map((interview) => (
                                            <TableRow key={interview.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{interview.companyName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{interview.jobTitle}</TableCell>
                                                <TableCell className="text-muted-foreground">{interview.date}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">{interview.recruiterName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <InterviewStatusBadge status={interview.status} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedInterview(interview)}>
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

                <InterviewDetailModal
                    interview={selectedInterview}
                    open={!!selectedInterview}
                    onOpenChange={(open) => !open && setSelectedInterview(null)}
                    isRecruiter={false}
                />
            </div>
        </main>
    )
}
