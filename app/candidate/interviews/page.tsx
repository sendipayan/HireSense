"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { InterviewCard } from "@/components/interview/interview-card"
import { InterviewDetailModal, type InterviewDetail } from "@/components/interview/interview-detail-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InterviewStatusBadge } from "@/components/interview/interview-status-badge"
import { InterviewHistoryFilters } from "@/components/interview/interview-history-filters"
import { Calendar, History, Briefcase, User, Info } from "lucide-react"
import axios from "axios"
import { useCandidateInterviewStore, type CandidateInterview } from "@/store/useCandidateInterviewStore"
import { useCursorStore, type Cursor } from "@/store/nextCursorStore"
import { Spinner } from "@/components/ui/spinner"

export default function CandidateInterviewsPage() {
    const [selectedInterview, setSelectedInterview] = useState<InterviewDetail | null>(null)
    const { interviews, setInterviews } = useCandidateInterviewStore()
    const [trigger, setTrigger] = useState(false)
    const [tab, setTab] = useState("upcoming")
    const [intialLoading, setIntialLoading] = useState(true)
    const { cursor, setPage, hasMore } = useCursorStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [typeFilter, setTypeFilter] = useState("all")
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef(false);
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("")
    const [type, setType] = useState("")
    const [completedInterviews, setCompletedInterviews] = useState<CandidateInterview[]>([])
    const [upcomingInterviews, setUpcomingInterviews] = useState<CandidateInterview[]>([])
    const [upcomingCursor, setUpcomingCursor] = useState<Cursor | null>(null)
    const [completedCursor, setCompletedCursor] = useState<Cursor | null>(null)
    const [completedHasMore, setCompletedHasMore] = useState(false)
    const [upcomingHasMore, setUpcomingHasMore] = useState(false)
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false)

    // dependent on these local states instead of global store
    const fetchMore = async () => {
        // 1. Determine which cursor/hasMore to use based on current tab
        const currentCursor = tab === "upcoming" ? upcomingCursor : completedCursor;
        const currentHasMore = tab === "upcoming" ? upcomingHasMore : completedHasMore;

        // 2. Use local checks directly
        if (loadingRef.current || !currentHasMore || !currentCursor) return;

        loadingRef.current = true;
        setLoading(true);

        try {
            if (tab === "upcoming") {
                const response = await axios.post('/api/candidate/next_interviews',
                    { cursor: currentCursor }, // Use local cursor
                    { withCredentials: true }
                );
                const data = await response.data;
                // 3. functional update
                setUpcomingInterviews(prev => [...prev, ...data.interviews]);
                setUpcomingCursor(data.cursor);
                setUpcomingHasMore(data.hasMore);
            } else if (tab === "history") {
                const payload = { status, type, search, cursor: currentCursor }
                console.log(payload)
                try {
                    setHistoryLoading(true)
                    const response = await axios.post('/api/candidate/get_interviews/completed', payload, { withCredentials: true })
                    const data = await response.data
                    const interviews = data.interviews
                    setCompletedInterviews(prev => [...prev, ...interviews])
                    setCompletedCursor(data.cursor)
                    setCompletedHasMore(data.hasMore)
                    console.log(data)

                } catch (err) {
                    console.log(err)
                } finally {
                    setHistoryLoading(false)

                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    };

    // 4. Wrap in useCallback to prevent recreating observer on every render
    const setLoaderRef = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    fetchMore();
                }
            },
            { rootMargin: "100px" }
        );

        observerRef.current.observe(node);
    }, [tab, upcomingCursor, completedCursor, upcomingHasMore, completedHasMore]); // Add dependencies needed for fetchMore closure if fetchMore isn't stable



    useEffect(() => {
        const fetchInterviews = async () => {

            try {
                const payload = { search: "", cursor: null }
                const res = await axios.post("/api/candidate/get_interviews/completed", payload, { withCredentials: true })
                const data = await res.data
                setCompletedInterviews(data.interviews)
                setCompletedCursor(data.cursor)
                setCompletedHasMore(data.hasMore)
                console.log(data)

            } catch (err) {
                console.log(err)
            }


            try {

                const response = await axios.get('/api/candidate/get_interviews', { withCredentials: true })
                const data = await response.data
                const interviews = data.interviews
                setUpcomingInterviews(interviews)
                setUpcomingCursor(data.cursor)
                setUpcomingHasMore(data.hasMore)
                console.log(data)

            } catch (err) {
                console.log(err)
            } finally {
                setIntialLoading(false)
            }


        }
        fetchInterviews()
    }, [tab])

    const prevSearchQueryRef = useRef("")

    useEffect(() => {
        const currentTrimmed = searchQuery.trim()
        const prevTrimmed = prevSearchQueryRef.current.trim()

        if (currentTrimmed === prevTrimmed) {
            prevSearchQueryRef.current = searchQuery
            return
        }

        const timeoutId = setTimeout(async () => {
            console.log("Search:", currentTrimmed);
            setSearch(currentTrimmed)
            prevSearchQueryRef.current = searchQuery;
            const payload = { status, type, search: currentTrimmed, cursor: null }
            console.log(payload)
            try {
                setHistoryLoading(true)
                const response = await axios.post('/api/candidate/get_interviews/completed', payload, { withCredentials: true })
                const data = await response.data
                const interviews = data.interviews
                setCompletedInterviews(interviews)
                setCompletedCursor(data.cursor)
                setCompletedHasMore(data.hasMore)
                console.log(data)

            } catch (err) {
                console.log(err)
            } finally {
                setHistoryLoading(false)

            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);


    useEffect(() => {
        if (intialLoading) return

        if (typeFilter === "all") {
            setTypeFilter("")
        }
        else {
            setType(typeFilter)
        }
        if (statusFilter === "all") {
            setStatusFilter("")
        }
        else {
            setStatus(statusFilter)
        }

    }, [statusFilter, typeFilter])

    useEffect(() => {
        if (intialLoading) return

        const fetch = async () => {
            const payload = { status, type, search, cursor: null }
            console.log(payload)
            try {
                setHistoryLoading(true)
                const response = await axios.post('/api/candidate/get_interviews/completed', payload, { withCredentials: true })
                const data = await response.data
                const interviews = data.interviews
                setCompletedInterviews(interviews)
                setCompletedCursor(data.cursor)
                setCompletedHasMore(data.hasMore)
                console.log(data)

            } catch (err) {
                console.log(err)
            } finally {
                setHistoryLoading(false)

            }
        }
        fetch()
    }, [status, type])

    useEffect(() => {

        if (intialLoading || loading || historyLoading) return

        if (tab === "upcoming") {
            setInterviews(upcomingInterviews)
            setPage({ cursor: upcomingCursor, hasMore: upcomingHasMore })
        } else if (tab === "history") {
            setInterviews(completedInterviews)
            setPage({ cursor: completedCursor, hasMore: completedHasMore })
        }
    }, [tab, intialLoading, loading, historyLoading])

    useEffect(() => {
        if (cursor)
            console.log(cursor)
    }, [cursor])

    const handleViewDetails = (interview: any) => {
        // Map CandidateInterview to InterviewDetail structure for the modal
        const detail: InterviewDetail = {
            id: interview.id,
            candidateName: "", // Current user
            recruiterName: interview.recruiterName,
            jobTitle: interview.jobTitle,
            date: interview.date,
            time: interview.time,
            duration: interview.duration,
            type: interview.meetingLink ? "online" : "in-person",
            status: interview.status,
            meetingLink: interview.meetingLink,
            location: interview.location,
            resumeName: interview.resumeName,
            resumeId: interview.application.resume.id,
            resumeUrl: interview.resumeUrl,
            resumeType: interview.resumeType,
            instructions: interview.instructions,
        }
        setSelectedInterview(detail)
    }

    return (
        <main className="py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Breadcrumbs items={[{ label: "Candidate", href: "/candidate/dashboard" }, { label: "Interviews" }]} />

                <PageHeader title="Interviews" description="Track and prepare for your upcoming and past job interviews." />

                <Tabs defaultValue="upcoming" className="mt-8" onValueChange={(value) => { setTab(value) }}>
                    {!intialLoading ? <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
                        <TabsTrigger value="upcoming" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            Scheduled
                        </TabsTrigger>
                        <TabsTrigger value="history" className="gap-2">
                            <History className="h-4 w-4" />
                            History
                        </TabsTrigger>
                    </TabsList> : <div className="lg:w-[400px] w-full h-10 bg-muted-foreground/50 border border-border rounded-lg animate-pulse mb-8">
                    </div>}

                    <TabsContent value="upcoming" className="space-y-6">
                        {/* Preparation Tips Card */}

                        {!intialLoading ? <> <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {interviews?.length > 0 ? (
                                interviews?.map((interview) => (
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
                                            resumeName: interview.application.resume.resumeName || "",
                                            //resumeId: interview.application.resume.id,
                                            resumeUrl: interview.application.resume.resumeUrl || "",
                                            resumeType: interview.application.resume.resumeMimeType || "",
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
                            {hasMore && <div ref={setLoaderRef} className="w-full flex justify-center items-center mt-5">
                                <Spinner className="w-10 h-10" />
                            </div>}
                        </> :
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="w-full h-120 bg-muted-foreground/50 border border-border rounded-lg animate-pulse">
                                    </div>
                                ))}
                            </div>}

                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 ">
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
                        <InterviewHistoryFilters
                            onSearchChange={setSearchQuery}
                            onStatusChange={setStatusFilter}
                            onTypeChange={setTypeFilter}
                        />
                        {!historyLoading ? <div className="rounded-xl border border-border bg-card overflow-hidden">
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
                                                        resumeName: interview.application.resume.resumeName || "",
                                                        resumeId: interview.application.resume.id,
                                                        resumeUrl: interview.application.resume.resumeUrl || "",
                                                        resumeType: interview.application.resume.resumeMimeType || "",

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
                            {hasMore && <div ref={setLoaderRef} className="w-full flex justify-center items-center mt-5">
                                <Spinner className="w-10 h-10" />
                            </div>}
                        </div> : <div className="w-full h-80 bg-muted-foreground/50 border border-border rounded-xl animate-pulse">
                        </div>}
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
