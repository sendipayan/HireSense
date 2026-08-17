"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import toast from "react-hot-toast"
import { CheckCircle2, Upload, FileText, XCircle } from "lucide-react"
import axios, { AxiosError } from "axios"

interface Job {
    id: string
    title: string
    recruiter: string
}
interface User {
    id: string;
    name: string
    email: string
    resumeId: string
    resumeName: string
    resumeUrl: string
    createdAt: string | Date
}

interface ApplyJobModalProps {
    job: Job
    user: User | null
    open: boolean
    trigger: boolean
    setTrigger: (trigger: boolean) => void
    onOpenChange: (open: boolean) => void
}

export function ApplyJobModal({ job, user, open, trigger, setTrigger, onOpenChange }: ApplyJobModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isError, setIsError] = useState(false)
    const [errormessg, setErrormessg] = useState("")
    const [isPreviewLoading, setIsPreviewLoading] = useState(false)

    useEffect(() => {
        if (!user) return
        if (user.resumeUrl.trim() === "") {
            setIsError(true)
            setErrormessg("Please upload your resume to apply for this job")
        }
    }, [user])

    const previewResume = async () => {
        if (!user?.resumeId || isPreviewLoading) return

        try {
            setIsPreviewLoading(true)
            const response = await axios.get("/api/show_resume", {
                params: { resumeId: user.resumeId, disposition: "inline" },
            })
            window.open(response.data.pdfUrl, "_blank", "noopener,noreferrer")
        } catch (error) {
            console.error(error)
            toast.error("Failed to load resume preview")
        } finally {
            setIsPreviewLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !job) return;


        console.log(user)
        console.log(job)

        try {
            setIsSubmitting(true)
            const response = await axios.post("/api/candidate/apply-job", {
                jobId: job.id,
                candidateId: user.id,
                resumeId: user.resumeId,
            }, { withCredentials: true })
            console.log(response.data)
            if (response.status === 201) {
                setIsSuccess(true)
                setTrigger(!trigger)
            }
        } catch (error: any) {
            console.log(error.response.data.error)
            if (error.response?.status === 500) {
                setErrormessg(`We were unable to process your application for ${job.title} at ${job.recruiter}. Please try again later.`)
            }
            setErrormessg(error.response.data.error)
            setIsError(true)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md text-center py-10">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4">
                        <CheckCircle2 className="h-10 w-10 text-success" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl">Application Submitted!</DialogTitle>
                        <DialogDescription className="text-center text-base pt-2">
                            Good luck! You can track the status of your application for <strong>{job.title}</strong> in your
                            dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center mt-6">
                        <Button onClick={() => onOpenChange(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    if (isError) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md text-center py-10 bg-destructive-foreground">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/30 mb-4">
                        <XCircle className="h-10 w-10 text-destructive" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl text-destructive">Submission Failed!</DialogTitle>
                        <DialogDescription className="text-center text-base pt-2 text-destructive">
                            {errormessg}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center mt-6">
                        <Button variant="destructive" onClick={() => onOpenChange(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Apply to {job.recruiter}</DialogTitle>
                    <DialogDescription>
                        Position: <strong>{job.title}</strong>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label htmlFor="full-name" className="text-sm font-medium">
                                Full Name
                            </label>
                            <Input id="full-name" disabled value={user?.name} required />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </label>
                            <Input id="email" disabled type="email" value={user?.email} required />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Resume</label>
                            <div className="flex items-center gap-4 rounded-lg border border-dashed border-border p-4 bg-muted/50 cursor-pointer hover:bg-primary/10"
                                onClick={previewResume}
                            >
                                <FileText className="h-8 w-8 text-primary" />
                                <div className="flex-1 text-sm">
                                    <p className="font-medium">{user?.resumeName}</p>
                                    {user?.createdAt && <p className="text-muted-foreground text-xs">Uploaded on {new Date(user.createdAt).toISOString().split("T")[0]}</p>}
                                    {isPreviewLoading && <p className="text-muted-foreground text-xs">Loading preview...</p>}
                                </div>
                                {/*<Button variant="ghost" size="sm" type="button" className="text-primary hover:text-primary/80">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Change
                                </Button>*/}
                            </div>
                        </div>

                        {/*<div className="grid gap-2">
                            <label htmlFor="cover-letter" className="text-sm font-medium">
                                Cover Letter (Optional)
                            </label>
                            <Textarea
                                id="cover-letter"
                                placeholder="Why are you a good fit for this role?"
                                className="min-h-[120px]"
                            />
                        </div>*/}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit Application"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
