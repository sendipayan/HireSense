"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Search, Filter, Calendar, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import axios from "axios"
import { Spinner } from "../ui/spinner"
import { useCursorStore, type Cursor } from "@/store/nextCursorStore"
import { useRecruiterApplicationsStore, type ApplicationJob } from "@/store/recruiterApplication"


interface ApplicationList {
    CId: string;
    Cname: string;
    resumeMimeType: string;
    resumeUrl: string;
    JId: string[];
    Jname: string[];
}

export interface ScheduleBatchProps {
    applicationIds: string[];
}

interface WaitingListProps {
    onScheduleBatch: (props: ScheduleBatchProps) => void;
    response: boolean;
    setApplicationsList: (applicationList: ApplicationList[]) => void;
    setTrigger: (trigger: boolean) => void;
    trigger: boolean;
}

export function WaitingList({ onScheduleBatch, response, setApplicationsList, setTrigger, trigger }: WaitingListProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [jobFilter, setJobFilter] = useState("all")
    const [loading, setLoading] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [job, setJob] = useState<ApplicationJob[]>([])
    const { applications, setApplications } = useRecruiterApplicationsStore()
    const [filter, setFilter] = useState("")
    const [search, setSearch] = useState("")
    const [selectApplications, setSelectApplications] = useState<string[]>([])
    const [applicationList, setApplicationList] = useState<ApplicationList[]>([])
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef(false);
    const { cursor, setPage, hasMore } = useCursorStore()

    useEffect(() => {
        if (!cursor) return
        console.log(cursor)
    }, [cursor])

    const fetchMore = async () => {
        if (loadingRef.current || !hasMore || !cursor) return;

        const payload = {
            search: search,
            filter: filter,
            cursor: cursor
        }

        try {
            loadingRef.current = true;
            console.log("fetching more");
            const res = await axios.post("/api/recruiter/get_waitlist", payload, { withCredentials: true })
            console.log(res.data)
            setApplications([...applications, ...res.data.applications])
            setPage({ cursor: res.data.cursor, hasMore: res.data.hasMore })

        } catch (error) {
            console.log(error)
        } finally {
            loadingRef.current = false;
        }
    };

    const setLoaderRef = (node: HTMLDivElement | null) => {
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
    };


    useEffect(() => {

        if (applications.length === 0) {
            setJob([])
            return;
        }
        setJob([...new Map(applications.map((job) => [job.job.id, job.job])).values()])
    }, [])

    useEffect(() => {
        if (response) {
            setSelectedIds([])
            setSelectApplications([])
            setApplicationList([])
        }
    }, [response])



    const toggleSelect = (id: string, Aid: string) => {
        const app = applications.find(a => a.id === Aid);
        if (!app) return;

        if (!selectApplications.includes(Aid)) {
            setApplicationList(prev => {
                const existing = prev.find(a => a.CId === id);

                if (existing) {
                    return prev.map(a =>
                        a.CId === id
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
                        CId: id,
                        Cname: app.candidate.user.name,
                        resumeMimeType: app.resume.resumeMimeType,
                        resumeUrl: app.resume.resumeUrl,
                        JId: [app.job.id],
                        Jname: [app.job.title],
                    },
                ];
            });

            setSelectedIds(prev => [...prev, id]);
            setSelectApplications(prev => [...prev, Aid]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
            setSelectApplications(prev => prev.filter(i => i !== Aid));

            setApplicationList(prev => {
                return prev
                    .map(a =>
                        a.CId === id
                            ? {
                                ...a,
                                JId: a.JId.filter(j => j !== app.job.id),
                                Jname: a.Jname.filter(j => j !== app.job.title),
                            }
                            : a
                    )
                    .filter(a => a.CId !== id || a.JId.length > 0);
            });
        }
    };


    const allSelected = applications.length > 0 && selectedIds.length === applications.length

    const selectAll = () => {
        if (allSelected) {
            setSelectedIds([])
            setSelectApplications([])
            setApplicationList([])
        } else {
            const select = Array.from(new Set(applications.map((c) => c.candidate.id)))
            const application = select.map((id) => {
                return {
                    CId: id,
                    Cname: applications.find((c) => c.candidate.id === id)?.candidate.user.name || "",
                    resumeMimeType: applications.find((c) => c.candidate.id === id)?.resume.resumeMimeType || "",
                    resumeUrl: applications.find((c) => c.candidate.id === id)?.resume.resumeUrl || "",
                    JId: applications.filter((c) => c.candidate.id === id)?.map((c) => c.job.id),
                    Jname: applications.filter((c) => c.candidate.id === id)?.map((c) => c.job.title)
                }
            })
            setApplicationList(application)
            setSelectedIds(applications.map((c) => c.candidate.id))
            setSelectApplications(applications.map((c) => c.id))
        }
    }

    useEffect(() => {
        setApplicationsList(applicationList)
    }, [applicationList])

    const removeFromWaitingList = async () => {
        if (selectApplications.length === 0 || !Array.isArray(selectApplications)) {
            console.log("No applications selected")
            return;
        }
        console.log(selectApplications)
        try {
            const response = await axios.post("/api/recruiter/remove_waitlist", { ids: selectApplications }, { withCredentials: true })
            if (response.status === 200) {
                setTrigger(!trigger)
                setSelectedIds([])
                setSelectApplications([])
                setApplicationList([])
            }
        } catch (error) {
            console.log(error)
        }
    }

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
            const payload = { filter, search: currentTrimmed, cursor: null }
            console.log(payload)
            try {
                setLoading(true)
                const res = await axios.post("/api/recruiter/get_waitlist", payload, { withCredentials: true })
                console.log(res.data)
                if (res.status === 200) {
                    setApplications(res.data.applications)
                    setPage({ cursor: res.data.cursor, hasMore: res.data.hasMore })
                }
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }


        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    useEffect(() => {

        if (jobFilter === "all") {
            setFilter("")
        }
        else {
            setFilter(jobFilter)
        }
    }, [jobFilter])

    useEffect(() => {
        const payload = {
            search: search,
            filter: filter,
            cursor: null
        }

        const fetch = async () => {
            try {
                setLoading(true)
                const res = await axios.post("/api/recruiter/get_waitlist", payload, { withCredentials: true })
                console.log(res.data)
                if (res.status === 200) {
                    setApplications(res.data.applications)
                    setPage({ cursor: res.data.cursor, hasMore: res.data.hasMore })
                }
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }
        }

        fetch()

        console.log(payload)
    }, [filter])


    return (
        <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            Candidate Waiting List
                            <Badge
                                variant="secondary"
                                className="rounded-full h-5 px-1.5 text-[10px] font-medium bg-primary/10 text-primary border-primary/20"
                            >
                                {applications.length}
                            </Badge>
                        </CardTitle>
                        <CardDescription>Qualified candidates waiting to be scheduled for interviews.</CardDescription>
                    </div>
                    {selectApplications.length > 0 && (
                        <div className="flex flex-col lg:flex-row items-center gap-2">
                            <Button
                                size="sm"
                                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 animate-in fade-in zoom-in duration-200"
                                onClick={() => onScheduleBatch({
                                    applicationIds: selectApplications,
                                })}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                Schedule {selectApplications.length} Selected
                            </Button>
                            <Button
                                size="sm"
                                className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20 animate-in fade-in zoom-in duration-200"
                                onClick={removeFromWaitingList}
                            >
                                Remove {selectApplications.length} from Waiting List
                            </Button>
                        </div>


                    )}
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:flex lg:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search candidates..."
                            className="pl-9 bg-background h-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col lg:flex-row items-center gap-3">
                        <Select value={jobFilter} onValueChange={setJobFilter}>
                            <SelectTrigger className="w-full md:w-[200px] bg-background h-10 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="All Jobs" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Jobs</SelectItem>
                                {job?.map((job) => (
                                    <SelectItem key={job.id} value={job.id}>
                                        {job.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={selectAll}
                            className={cn("h-10 px-3 shrink-0", allSelected && "bg-primary/5 border-primary/30 text-primary")}
                        >
                            {allSelected ? "Deselect All" : "Select All"}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {!loading ? <div className="divide-y divide-border/40">
                    {applications.length > 0 ? (
                        applications.map((candidate) => (
                            <div
                                key={candidate.id}
                                className={`flex items-center gap-4 p-4 transition-colors hover:bg-muted/20 ${selectApplications.includes(candidate.id) ? "bg-primary/5" : ""}`}
                            >
                                <div className="flex items-center px-1">
                                    <Checkbox
                                        checked={selectApplications.includes(candidate.id)}
                                        onCheckedChange={() => toggleSelect(candidate.candidate.id, candidate.id)}
                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                </div>

                                <Avatar className="h-10 w-10 border border-border/50">
                                    <AvatarImage src={candidate.candidate.user.profilePic ? candidate.candidate.user.profilePic : ""} />
                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                                        {candidate.candidate.user.name
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                            {candidate.candidate.user.name}
                                        </p>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="text-xs font-bold text-primary">{candidate.score}%</span>
                                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                                                <div className="h-full bg-primary" style={{ width: `${candidate.score}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{candidate.job.title}</p>
                                </div>

                                <div className="hidden sm:flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] py-0 h-5 font-normal border-border/60">
                                        {candidate.candidate.experienceLevel?.split(" ")[0]}
                                    </Badge>
                                </div>


                            </div>
                        ))

                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-sm text-muted-foreground">No candidates found in the waiting list.</p>
                        </div>
                    )}
                    {hasMore && <div ref={setLoaderRef} className="w-full flex justify-center items-center mt-5">
                        <Spinner className="w-10 h-10" />
                    </div>}
                </div> :
                    <div className="divide-y divide-border/40">
                        {[1, 2].map((item) => (
                            <div key={item} className="w-full h-15 bg-muted-foreground/50 border border-border rounded-lg animate-pulse">

                            </div>
                        ))}
                    </div>
                }
            </CardContent>
        </Card>
    )
}
