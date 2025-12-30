"use client"

import type React from "react"

import { useState } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Upload, FileText } from "lucide-react"

interface Job {
    id: string
    title: string
    company: string
}

interface ApplyJobModalProps {
    job: Job
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ApplyJobModal({ job, open, onOpenChange }: ApplyJobModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setIsSuccess(true)

        toast({
            title: "Application Sent!",
            description: `Your application for ${job.title} at ${job.company} has been submitted successfully.`,
        })
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Apply to {job.company}</DialogTitle>
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
                            <Input id="full-name" defaultValue="Sarah Chen" required />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </label>
                            <Input id="email" type="email" defaultValue="sarah.chen@email.com" required />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Resume</label>
                            <div className="flex items-center gap-4 rounded-lg border border-dashed border-border p-4 bg-muted/50">
                                <FileText className="h-8 w-8 text-primary" />
                                <div className="flex-1 text-sm">
                                    <p className="font-medium">sarah_chen_resume.pdf</p>
                                    <p className="text-muted-foreground text-xs">Uploaded 2 days ago</p>
                                </div>
                                <Button variant="ghost" size="sm" type="button" className="text-primary hover:text-primary/80">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Change
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="cover-letter" className="text-sm font-medium">
                                Cover Letter (Optional)
                            </label>
                            <Textarea
                                id="cover-letter"
                                placeholder="Why are you a good fit for this role?"
                                className="min-h-[120px]"
                            />
                        </div>
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
