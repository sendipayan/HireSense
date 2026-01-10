"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { InterviewStatusBadge, type InterviewStatus } from "./interview-status-badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, LinkIcon, FileText, User, History, CalendarIcon, MessageSquare } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { Input } from "../ui/input"

export interface InterviewDetail {
    id: string
    candidateName: string
    recruiterName: string
    jobTitle: string
    date: string
    time: string
    duration: string
    type: string
    status: InterviewStatus
    location?: string
    meetingLink?: string
    instructions?: string
    notes?: string
}

interface InterviewDetailModalProps {
    interview: InterviewDetail | null
    open: boolean
    onOpenChange: (open: boolean) => void
    isRecruiter?: boolean
}

export function InterviewDetailModal({
    interview,
    open,
    onOpenChange,
    isRecruiter = false,
}: InterviewDetailModalProps) {
    if (!interview) return null

    const [editMode, setEditMode] = useState(false)
    const [date, setDate] = useState(interview.date)
    const [time, setTime] = useState(interview.time)
    const [duration, setDuration] = useState(interview.duration)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] p-0 overflow-auto max-h-[95vh] flex flex-col">
                <DialogHeader className="p-6 pb-4 bg-muted/20">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl">{interview.jobTitle}</DialogTitle>
                            <DialogDescription className="flex items-center gap-2">
                                <InterviewStatusBadge status={interview.status} />
                                <span>•</span>
                                <span className="capitalize">{interview.type.replace("-", " ")} Interview</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6">
                    <div className="space-y-6 pb-6">
                        {/* Core Info */}
                        <div className="grid lg:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <CalendarIcon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Date</p>
                                        {!editMode ? <p className="text-sm font-medium">{interview.date}</p> : <Input type="date" value={interview.date} onChange={(e) => setDate(e.target.value)} />}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <Clock className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                                            Time & Duration
                                        </p>
                                        {!editMode ? <p className="text-sm font-medium">
                                            {interview.time} ({interview.duration}m)
                                        </p> : <Input type="time" value={interview.time} onChange={(e) => setTime(e.target.value)} />}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-500/10">
                                        <User className="h-4 w-4 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                                            {isRecruiter ? "Candidate" : "Interviewer"}
                                        </p>
                                        <p className="text-sm font-medium">
                                            {isRecruiter ? interview.candidateName : interview.recruiterName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                        <MapPin className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Location</p>
                                        <p className="text-sm font-medium truncate max-w-[180px]">
                                            {interview.meetingLink ? "Online Meeting" : interview.location || "TBD"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Links/Actions */}
                        {interview.meetingLink && (
                            <div className="space-y-3">
                                <p className="text-sm font-semibold flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4" />
                                    Meeting Information
                                </p>
                                <div className="flex items-center justify-center lg:justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
                                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[300px] hidden lg:block">
                                        {interview.meetingLink}
                                    </span>
                                    <Button size="sm" variant="outline" className="h-8 bg-transparent" asChild>
                                        <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                                            Join Now
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="space-y-3">
                            <p className="text-sm font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Instructions
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {interview.instructions ||
                                    "Please ensure you have a stable internet connection and are in a quiet environment. Have your resume ready for reference."}
                            </p>
                        </div>

                        {/* Recruiter Private Notes */}
                        {isRecruiter && interview.notes && (
                            <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border">
                                <p className="text-sm font-semibold flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Private Recruiter Notes
                                </p>
                                <p className="text-sm text-muted-foreground italic leading-relaxed">"{interview.notes}"</p>
                            </div>
                        )}

                        {/* Timeline */}
                        {/*<div className="space-y-4">
                            <p className="text-sm font-semibold flex items-center gap-2">
                                <History className="h-4 w-4" />
                                Activity Timeline
                            </p>
                            <div className="space-y-4 pl-2 border-l border-border ml-2">
                                {interview.activityLog.map((log, i) => (
                                    <div key={i} className="relative pl-6">
                                        <div className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-border" />
                                        <p className="text-xs font-medium">{log.action}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            By {log.user} • {log.timestamp}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>*/}
                    </div>
                </ScrollArea>

                <Separator />

                <div className="p-4 flex flex-col lg:flex-row justify-between gap-3 bg-muted/10">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <div className="flex flex-col lg:flex-row gap-2">
                        {isRecruiter ? (
                            <>
                                <Button variant="outline" onClick={() => setEditMode(true)}>Reschedule</Button>
                                {!editMode ? <Button>Mark as Completed</Button> : <Button onClick={() => setEditMode(false)}>Save Changes</Button>}
                            </>
                        ) : (
                            <>
                                <Button variant="outline">Add to Calendar</Button>
                                <Button>Confirm Attendance</Button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
