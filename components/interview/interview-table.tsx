"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InterviewStatusBadge, type InterviewStatus } from "./interview-status-badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Calendar, XCircle, CheckCircle2, UserPlus } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Interview {
    id: string
    candidateName: string
    jobTitle: string
    type: string
    date: string
    status: InterviewStatus
}

interface InterviewTableProps {
    interviews: Interview[]
    onViewDetails: (id: string) => void
    onHire: (interview: Interview) => void
    onReject: (interview: Interview) => void
    onCancel: (interview: Interview) => void
    loading: boolean
    onMarkCompleted: (interview: Interview) => void
}

export function InterviewTable({
    interviews,
    onViewDetails,
    loading,
    onHire,
    onReject,
    onCancel,
    onMarkCompleted,
}: InterviewTableProps) {
    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30">
                        <TableHead>Candidate</TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {interviews.length > 0 ? (
                        interviews.map((interview) => (
                            <TableRow key={interview.id} className="group transition-colors hover:bg-muted/20">
                                <TableCell className="font-medium">{interview.candidateName}</TableCell>
                                <TableCell className="text-muted-foreground">{interview.jobTitle}</TableCell>
                                <TableCell className="capitalize text-muted-foreground">{interview.type.replace("-", " ")}</TableCell>
                                <TableCell className="text-muted-foreground">{interview.date}</TableCell>
                                <TableCell>
                                    <InterviewStatusBadge status={interview?.status} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 transition-opacity">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48" >
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => onViewDetails(interview.id)} disabled={loading}>
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </DropdownMenuItem>
                                            {(interview.status === "SCHEDULED" || interview.status === "COMPLETED") && <DropdownMenuSeparator />}
                                            {interview.status === "COMPLETED" && <DropdownMenuItem disabled={loading} onClick={() => onHire(interview)}>
                                                <UserPlus className="mr-2 h-4 w-4" /> Hire
                                            </DropdownMenuItem>}
                                            {interview.status === "SCHEDULED" && <DropdownMenuItem onClick={() => onMarkCompleted(interview)} disabled={loading}>
                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Completed
                                            </DropdownMenuItem>}
                                            {(interview.status === "SCHEDULED" || interview.status === "COMPLETED") && <DropdownMenuSeparator />}
                                            {interview.status === "COMPLETED" && <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled={loading} onClick={() => onReject(interview)}>
                                                <XCircle className="mr-2 h-4 w-4 text-destructive" /> Reject
                                            </DropdownMenuItem>}
                                            {interview.status === "SCHEDULED" && <DropdownMenuItem
                                                onClick={() => onCancel(interview)}
                                                className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled={loading}
                                            >
                                                <XCircle className="mr-2 h-4 w-4 text-destructive" /> Cancel Interview
                                            </DropdownMenuItem>}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No interviews found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
