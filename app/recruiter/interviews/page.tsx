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
import { Badge } from "@/components/ui/badge"
import { isWithinInterval, parseISO, format } from "date-fns"
import type { DateRange } from "react-day-picker" // Import DateRange
import { useRecruiterApplicationsStore } from "@/store/recruiterApplication"
import { useInterviewStore } from "@/store/useInterviewStore"
import { useJobStore } from "@/store/jobStore"
import axios from "axios"


interface ApplicationList {
    CId: string;
    Cname: string;
    JId: string[];
    Jname: string[];
}
// Mock interviews data for the recruiter


export default function RecruiterInterviewsPage() {
    //const [interviews, setInterviews] = useState(mockInterviews)
    const [activeTab, setActiveTab] = useState("interviews")
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
    const [selectedInterview, setSelectedInterview] = useState<InterviewDetail | null>(null)
    const { setApplications } = useRecruiterApplicationsStore()
    const { setInterviews, interviews } = useInterviewStore()
    const [trigger, setTrigger] = useState(false)
    const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([])
    const [applicationList, setApplicationList] = useState<ApplicationList[]>([])
    const [response, setResponse] = useState(false)
    const { jobs, setJobs } = useJobStore()
    const [loading, setLoading] = useState(false)
    const [intialLoading, setIntialLoading] = useState(true)
    // Filter states
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [jobFilter, setJobFilter] = useState("all")
    const [dateRange, setDateRange] = useState<DateRange | undefined>()

    useEffect(() => {
        const fetch = async () => {
            const res = await axios.get("/api/recruiter/get_waitlist", { withCredentials: true })
            const res2 = await axios.get("/api/recruiter/get_interview", { withCredentials: true })
            const res3 = await axios.get("/api/getjob", { withCredentials: true })
            console.log(res.data)
            console.log(res2.data)
            console.log(res3.data)
            setInterviews(res2.data.interviews)
            setApplications(res.data.applications)
            setJobs(res3.data.job)
            setIntialLoading(false)
        }

        fetch()
    }, [trigger])

    const completeInterview = async (id: string) => {
        try {
            setLoading(true)
            const response = await axios.post(`/api/recruiter/complete_interview`, {
                interviewId: id,
                status: "COMPLETED"
            }, { withCredentials: true });
            console.log(response.data);
            if (response.status === 200) {
                setTrigger(!trigger);
            }

        } catch (error) {
            console.error("Error completing interview:", error);
        } finally {
            setLoading(false);
        }
    };

    const cancelInterview = async (id: string) => {
        try {
            setLoading(true)
            const response = await axios.delete(`/api/recruiter/cancel_interview/${id}`, { withCredentials: true });
            console.log(response.data);
            if (response.status === 200) {
                setTrigger(!trigger);
            }

        } catch (error) {
            console.error("Error completing interview:", error);
        } finally {
            setLoading(false);
        }
    };

    const hireInterview = async (id: string) => {
        try {
            setLoading(true)
            const response = await axios.post(`/api/recruiter/complete_interview`, {
                interviewId: id,
                status: "CONFIRMED"
            }, { withCredentials: true });
            console.log(response.data);
            if (response.status === 200) {
                setTrigger(!trigger);
            }

        } catch (error) {
            console.error("Error completing interview:", error);
        } finally {
            setLoading(false);
        }
    };

    const rejectInterview = async (id: string) => {
        try {
            setLoading(true)
            const response = await axios.post(`/api/recruiter/complete_interview`, {
                interviewId: id,
                status: "CANCELLED"
            }, { withCredentials: true });
            console.log(response.data);
            if (response.status === 200) {
                setTrigger(!trigger);
            }

        } catch (error) {
            console.error("Error completing interview:", error);
        } finally {
            setLoading(false);
        }
    };





    const filteredInterviews = useMemo(() => {
        if (interviews.length === 0) return []
        return interviews.filter((int) => {
            const matchesSearch = int.application.candidate.user.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === "all" || int.status.toLowerCase() === statusFilter.toLowerCase()
            const matchesJob = jobFilter === "all" || jobs.find((j) => j.title === int.application.job.title)?.id === jobFilter

            let matchesDate = true
            if (dateRange?.from) {
                const interviewDate = parseISO(new Date(int.startAt).toISOString())
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
            value: interviews.filter((i) => i.status === "CONFIRMED" || i.status === "SCHEDULED").length,
            icon: Calendar,
        },
        { title: "Today", value: 1, icon: Clock, description: "Oct 24, 2025" },
        { title: "Completed", value: interviews.filter((i) => i.status === "COMPLETED").length, icon: CheckCircle2 },
        { title: "Canceled", value: interviews.filter((i) => i.status === "CANCELLED").length, icon: XCircle },
    ]

    const handleSchedule = (values: any) => {
        if (values) {
            setResponse(true)
        }
    }

    const openScheduleModal = (applicationIds: string[] = []) => {

        setSelectedApplicationIds(applicationIds)
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
                {!intialLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
                        {stats.map((stat) => (
                            <StatCard key={stat.title} {...stat} />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
                        {[1, 2, 3, 4].map((val) => (
                            <div className="bg-muted-foreground/50 border border-border rounded-lg animate-pulse h-35" key={val}>

                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <Tabs defaultValue="interviews" className="mt-12" onValueChange={setActiveTab}>
                    <div className="flex items-center justify-between mb-6">
                        {!intialLoading ? <TabsList className="grid w-[400px] grid-cols-2">
                            <TabsTrigger value="interviews" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Interviews
                            </TabsTrigger>
                            <TabsTrigger value="waiting-list" className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Waiting List
                            </TabsTrigger>
                        </TabsList> : <div className="w-[400px] h-10 bg-muted-foreground/50 border border-border rounded-lg animate-pulse">

                        </div>}
                    </div>

                    <TabsContent value="waiting-list" className="mt-0 border-none p-0">
                        <WaitingList
                            setTrigger={setTrigger}
                            trigger={trigger}
                            response={response}
                            setApplicationsList={setApplicationList}
                            onScheduleBatch={(props: ScheduleBatchProps) => {
                                openScheduleModal(props.applicationIds)
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="interviews" className="mt-0 border-none p-0">
                        {/* Filters */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold tracking-tight">Upcoming Interviews</h2>
                                {!intialLoading && <Badge variant="outline" className="font-medium">
                                    {filteredInterviews.length} Scheduled
                                </Badge>}
                            </div>
                            {!intialLoading ? <InterviewFilters
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                statusFilter={statusFilter}
                                onStatusChange={setStatusFilter}
                                jobFilter={jobFilter}
                                onJobChange={setJobFilter}
                                dateRange={dateRange}
                                onDateRangeChange={setDateRange}
                                jobs={jobs.map((j) => ({ id: j.id, title: j.title }))}
                                onClear={() => {
                                    setSearchQuery("")
                                    setStatusFilter("all")
                                    setJobFilter("all")
                                    setDateRange(undefined)
                                }}
                            /> : <div className="w-full h-15 bg-muted-foreground/50 border border-border rounded-lg animate-pulse">

                            </div>}
                        </div>

                        {/* Table */}
                        <div className="mt-6">
                            {!intialLoading ? <InterviewTable
                                interviews={filteredInterviews.map((int) => {
                                    return {
                                        id: int.id,
                                        candidateName: int.application.candidate.user.name,
                                        jobTitle: int.application.job.title,
                                        type: int.type.split("_").join(" ").toUpperCase(),
                                        date: new Date(int.startAt).toLocaleString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        }),
                                        status: int.status
                                    }
                                })}
                                onViewDetails={(id) => {
                                    const int = interviews.find((i) => i.id === id);
                                    if (int) {
                                        setSelectedInterview({
                                            id: int.id,
                                            candidateName: int.application.candidate.user.name,
                                            jobTitle: int.application.job.title,
                                            type: int.type.split("_").join(" ").toUpperCase(),
                                            date: new Date(int.startAt).toLocaleDateString("en-IN", {
                                                timeZone: "Asia/Kolkata",
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            }),
                                            time: new Date(int.startAt).toLocaleTimeString("en-IN", {
                                                timeZone: "Asia/Kolkata",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            }),
                                            status: int.status,
                                            duration: int.duration.toString(),
                                            location: int.location || "",
                                            meetingLink: int.meetingLink || "",
                                            phno: int.phno || "",
                                            notes: int.notes || "",
                                            recruiterName: ""
                                        })
                                    }
                                }}
                                loading={loading}
                                onHire={(int) => {
                                    hireInterview(int.id)
                                }}
                                onReject={(int) => {
                                    rejectInterview(int.id)
                                }}
                                onCancel={(int) => {
                                    cancelInterview(int.id)
                                }}
                                onMarkCompleted={(int) => {
                                    completeInterview(int.id)
                                }}
                            /> : <div className="w-full h-50 bg-muted-foreground/50 border border-border rounded-lg animate-pulse">

                            </div>}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Modals */}
                <ScheduleInterviewModal
                    open={isScheduleModalOpen}
                    onOpenChange={setIsScheduleModalOpen}
                    onSchedule={handleSchedule}
                    setTrigger={setTrigger}
                    applications={applicationList}
                    selectedApplicationIds={selectedApplicationIds}
                />

                {selectedInterview && <InterviewDetailModal
                    interview={selectedInterview}
                    open={!!selectedInterview}
                    trigger={trigger}
                    setTrigger={setTrigger}
                    onOpenChange={(open) => !open && setSelectedInterview(null)}
                    isRecruiter={true}
                />}
            </div>
        </main>
    )
}
