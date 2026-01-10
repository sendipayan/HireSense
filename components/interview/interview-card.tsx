"use client"

import { InterviewStatusBadge, type InterviewStatus } from "./interview-status-badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, LinkIcon, ExternalLink, Clock, Phone } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export interface CandidateInterview {
    id: string
    companyName: string
    recruiterName: string
    jobTitle: string
    date: string
    time: string
    location?: string
    phno?: string
    meetingLink?: string
    status: InterviewStatus
    instructions?: string
}

interface InterviewCardProps {
    interview: CandidateInterview
    onConfirm?: (interview: CandidateInterview) => void
    onReschedule?: (interview: CandidateInterview) => void
    onAddToCalendar?: (interview: CandidateInterview) => void
}

export function InterviewCard({ interview, onConfirm, onReschedule, onAddToCalendar }: InterviewCardProps) {
    return (
        <Card className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg leading-tight">{interview.jobTitle}</h3>
                        <p className="text-sm text-muted-foreground font-medium">{interview.companyName}</p>
                    </div>
                    <InterviewStatusBadge status={interview.status} />
                </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Date & Time</p>
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>{interview.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pl-6">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{interview.time}</span>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{
                            interview.location ? "Location" : "Phone"
                        }</p>
                        {interview.meetingLink ? (
                            <div className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
                                <LinkIcon className="h-4 w-4" />
                                <span className="truncate">Online Meeting</span>
                            </div>
                        ) :
                            <div className="flex items-center gap-2 text-sm">
                                {interview.location ? <MapPin className="h-4 w-4 text-muted-foreground" /> : <Phone className="h-4 w-4 text-muted-foreground" />}
                                <span className="truncate">{interview.location ? interview.location : interview.phno}</span>
                            </div>
                        }
                    </div>
                </div>

                {interview.meetingLink && (
                    <Button
                        variant="outline"
                        className="w-full bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 h-9"
                        asChild
                    >
                        <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Join Interview
                        </a>
                    </Button>
                )}
            </CardContent>
            <CardFooter className="pt-2 pb-5 flex flex-wrap gap-2 justify-between">
                <div className="flex flex-col lg:flex-row gap-2 justify-between  w-full">
                    {interview.status === "SCHEDULED" && onConfirm && (
                        <Button size="sm" onClick={() => onConfirm(interview)} className="w-full">
                            Confirm
                        </Button>
                    )}

                </div>
                <Button size="sm" variant="outline" className="h-9 px-2 w-full" onClick={() => onAddToCalendar?.(interview)}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Add to Calendar
                </Button>
            </CardFooter>
        </Card>
    )
}
