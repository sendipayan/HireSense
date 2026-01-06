"use client"
import { useState, useMemo, useEffect } from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Clock, CheckCircle2, XCircle } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { InterviewTable } from "@/components/interview/interview-table"
import { InterviewFilters } from "@/components/interview/interview-filters"
import { WaitingList, type ScheduleBatchProps } from "@/components/interview/waiting-list"
import { ScheduleInterviewModal } from "@/components/interview/schedule-interview-modal"
import { InterviewDetailModal, type InterviewDetail } from "@/components/interview/interview-detail-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockJobs, mockCandidates } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { isWithinInterval, parseISO, format } from "date-fns"
import type { DateRange } from "react-day-picker" // Import DateRange
import { useRecruiterApplicationsStore } from "@/store/recruiterApplication"
import axios from "axios"
// Mock interviews data for the recruiter
const mockInterviews: InterviewDetail[] = [
    {
        id: "int-1",
        candidateName: "Sarah Chen",
        candidateEmail: "sarah.chen@example.com",
        recruiterName: "Alex Rivera",
        jobTitle: "Senior Frontend Engineer",
        date: "Oct 24, 2025",
        time: "10:00 AM",
        duration: "45",
        type: "online",
        status: "confirmed",
        meetingLink: "https://zoom.us/j/123456789",
        instructions: "Please be ready to discuss your recent React projects and architectural decisions.",
        notes: "Strong technical background, especially in performance optimization.",
        activityLog: [
            { action: "Interview Scheduled", user: "Alex Rivera", timestamp: "Oct 20, 11:30 AM" },
            { action: "Attendance Confirmed", user: "Sarah Chen", timestamp: "Oct 21, 09:15 AM" },
        ],
    },
    {
        id: "int-2",
        candidateName: "Michael Rodriguez",
        candidateEmail: "m.rodriguez@example.com",
        recruiterName: "Alex Rivera",
        jobTitle: "Product Designer",
        date: "Oct 25, 2025",
        time: "02:30 PM",
        duration: "60",
        type: "in-person",
        status: "scheduled",
        location: "Conference Room B, 4th Floor",
        instructions: "Please bring your portfolio on a tablet or laptop. We will have a screen available.",
        notes: "Excellent UI polish in portfolio. Need to assess UX research skills.",
        activityLog: [{ action: "Interview Scheduled", user: "Alex Rivera", timestamp: "Oct 22, 03:45 PM" }],
    },
    {
        id: "int-3",
        candidateName: "Emily Watson",
        candidateEmail: "emily.w@example.com",
        recruiterName: "Alex Rivera",
        jobTitle: "Senior Frontend Engineer",
        date: "Oct 22, 2025",
        time: "09:00 AM",
        duration: "30",
        type: "online",
        status: "completed",
        meetingLink: "https://meet.google.com/abc-defg-hij",
        notes: "Good candidate. Moving to the final round.",
        activityLog: [
            { action: "Interview Scheduled", user: "Alex Rivera", timestamp: "Oct 18, 10:00 AM" },
            { action: "Interview Completed", user: "Alex Rivera", timestamp: "Oct 22, 09:35 AM" },
        ],
    },
    {
        id: "int-4",
        candidateName: "James Wilson",
        candidateEmail: "j.wilson@example.com",
        recruiterName: "Alex Rivera",
        jobTitle: "Backend Developer",
        date: "Oct 26, 2025",
        time: "11:00 AM",
        duration: "45",
        type: "phone",
        status: "canceled",
        location: "+1 (555) 123-4567",
        activityLog: [
            { action: "Interview Scheduled", user: "Alex Rivera", timestamp: "Oct 21, 01:20 PM" },
            { action: "Interview Canceled", user: "James Wilson", timestamp: "Oct 23, 08:45 AM" },
        ],
    },
]

export default function RecruiterInterviewsPage() {
    const [interviews, setInterviews] = useState(mockInterviews)
    const [activeTab, setActiveTab] = useState("interviews")
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
    const [selectedInterview, setSelectedInterview] = useState<InterviewDetail | null>(null)
    const { applications, setApplications } = useRecruiterApplicationsStore()
    const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([])
    const [selectedJobId, setSelectedJobId] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [jobFilter, setJobFilter] = useState("all")
    const [dateRange, setDateRange] = useState<DateRange | undefined>()

    useEffect(() => {
        const fetch = async () => {
            const res = await axios.get("/api/recruiter/get_waitlist", { withCredentials: true })
            console.log(res.data)
            setApplications(res.data.applications)
        }

        fetch()
    }, [])

    const filteredInterviews = useMemo(() => {
        return interviews.filter((int) => {
            const matchesSearch = int.candidateName.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === "all" || int.status === statusFilter
            const matchesJob = jobFilter === "all" || mockJobs.find((j) => j.title === int.jobTitle)?.id === jobFilter

            let matchesDate = true
            if (dateRange?.from) {
                const interviewDate = parseISO(new Date(int.date).toISOString())
                if (dateRange.to) {
                    matchesDate = isWithinInterval(interviewDate, { start: dateRange.from, end: dateRange.to })
                } else {
                    matchesDate = interviewDate.getTime() >= dateRange.from.getTime()
                }
            }

            return matchesSearch && matchesStatus && matchesJob && matchesDate
        })
    }, [interviews, searchQuery, statusFilter, jobFilter, dateRange])

    const stats = [
        {
            title: "Upcoming",
            value: interviews.filter((i) => i.status === "confirmed" || i.status === "scheduled").length,
            icon: Calendar,
        },
        { title: "Today", value: 1, icon: Clock, description: "Oct 24, 2025" },
        { title: "Completed", value: interviews.filter((i) => i.status === "completed").length, icon: CheckCircle2 },
        { title: "Canceled", value: interviews.filter((i) => i.status === "canceled").length, icon: XCircle },
    ]

    const handleSchedule = (values: any) => {
        const newInterviews = values.candidateIds.map((cid: string) => {
            const candidate = mockCandidates.find((c) => c.id === cid)
            const job = mockJobs.find((j) => j.id === values.jobId)

            return {
                id: `int-${cid}-${Date.now()}`,
                candidateName: candidate?.name || "Unknown Candidate",
                recruiterName: "Alex Rivera",
                jobTitle: job?.title || "Unknown Position",
                date: format(values.date, "MMM dd, yyyy"),
                time: values.time,
                duration: values.duration,
                type: values.type,
                status: "scheduled",
                meetingLink: values.meetingLink,
                location: values.location,
                notes: values.notes,
                activityLog: [
                    { action: "Interview Scheduled", user: "Alex Rivera", timestamp: format(new Date(), "MMM dd, hh:mm a") },
                ],
            }
        })

        setInterviews([...newInterviews, ...interviews])
        setSelectedCandidateIds([])
        setSelectedJobId([])
    }

    const openScheduleModal = (candidateIds: string[] = [], jobId: string[] = []) => {
        setSelectedCandidateIds(candidateIds)
        setSelectedJobId(jobId)
        setIsScheduleModalOpen(true)
    }

    return (
        <main className="py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Breadcrumbs items={[{ label: "Recruiter", href: "/recruiter/dashboard" }, { label: "Interviews" }]} />

                <PageHeader
                    title="Interview Management"
                    description="Schedule and manage your candidate interviews in one place."
                >
                    {/* <Button onClick={() => openScheduleModal()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule Interview
                    </Button> */}
                </PageHeader>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
                    {stats.map((stat) => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="interviews" className="mt-12" onValueChange={setActiveTab}>
                    <div className="flex items-center justify-between mb-6">
                        <TabsList className="grid w-[400px] grid-cols-2">
                            <TabsTrigger value="interviews" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Interviews
                            </TabsTrigger>
                            <TabsTrigger value="waiting-list" className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Waiting List
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="waiting-list" className="mt-0 border-none p-0">
                        <WaitingList

                            onScheduleBatch={(props: ScheduleBatchProps) => {
                                openScheduleModal(props.candidateIds, props.jobId)
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="interviews" className="mt-0 border-none p-0">
                        {/* Filters */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold tracking-tight">Upcoming Interviews</h2>
                                <Badge variant="outline" className="font-medium">
                                    {filteredInterviews.length} Scheduled
                                </Badge>
                            </div>
                            <InterviewFilters
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                statusFilter={statusFilter}
                                onStatusChange={setStatusFilter}
                                jobFilter={jobFilter}
                                onJobChange={setJobFilter}
                                dateRange={dateRange}
                                onDateRangeChange={setDateRange}
                                jobs={mockJobs.map((j) => ({ id: j.id, title: j.title }))}
                                onClear={() => {
                                    setSearchQuery("")
                                    setStatusFilter("all")
                                    setJobFilter("all")
                                    setDateRange(undefined)
                                }}
                            />
                        </div>

                        {/* Table */}
                        <div className="mt-6">
                            <InterviewTable
                                interviews={filteredInterviews}
                                onViewDetails={(int) => setSelectedInterview(int as InterviewDetail)}
                                onReschedule={(int) => setSelectedInterview(int as InterviewDetail)}
                                onCancel={(int) => {
                                    setInterviews(interviews.map((i) => (i.id === int.id ? { ...i, status: "canceled" } : i)))
                                }}
                                onMarkCompleted={(int) => {
                                    setInterviews(interviews.map((i) => (i.id === int.id ? { ...i, status: "completed" } : i)))
                                }}
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Modals */}
                <ScheduleInterviewModal
                    open={isScheduleModalOpen}
                    onOpenChange={setIsScheduleModalOpen}
                    onSchedule={handleSchedule}
                    candidates={applications.map((c) => ({ id: c.candidate.id, name: c.candidate.user.name }))}
                    jobs={applications.map((j) => ({ id: j.job.id, title: j.job.title }))}
                    selectedCandidateIds={selectedCandidateIds}
                    selectedJobIds={selectedJobId}
                />

                <InterviewDetailModal
                    interview={selectedInterview}
                    open={!!selectedInterview}
                    onOpenChange={(open) => !open && setSelectedInterview(null)}
                    isRecruiter={true}
                />
            </div>
        </main>
    )
}
