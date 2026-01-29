"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { FileText } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import toast from "react-hot-toast"

interface Resume {
    id: string;
    resumeName: string;
    createdAt: Date;
    isActive: boolean;
    resumeUrl: string;
    resumeMimeType: string;
}

export default function AIFeedbackClientPage() {
    const router = useRouter()
    const [selectedResumeId, setSelectedResumeId] = useState<string>("")
    const [allResumes, setAllResumes] = useState<Resume[]>([])

    // Fetch all resumes on mount
    useEffect(() => {
        const getAllResumes = async () => {
            try {
                const response = await axios.get('/api/candidate/get_resumes')
                console.log(response.data)
                if (response.status === 200) {
                    setAllResumes(response.data.resumes)
                }
            } catch (err) {
                console.log(err)
                toast.error("Failed to load resumes.")
            }
        }
        getAllResumes()
    }, [])

    // Redirect when a resume is selected
    useEffect(() => {
        if (selectedResumeId && selectedResumeId !== "no-resumes") {
            router.push(`/candidate/ai-feedback/${selectedResumeId}`)
        }
    }, [selectedResumeId, router])

    return (
        <main className="py-8 sm:py-12">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <Breadcrumbs items={[{ label: "Candidate", href: "/candidate/dashboard" }, { label: "AI Feedback" }]} />

                {/* Page Header */}
                <div className="mt-8">
                    <h1 className="text-3xl font-bold tracking-tight">AI Resume Feedback</h1>
                    <p className="mt-2 text-muted-foreground">
                        Select a resume to view detailed AI-powered feedback and analysis.
                    </p>
                </div>

                {/* Resume Selector */}
                <div className="mt-8">
                    <label htmlFor="resume-select" className="block text-sm font-medium mb-2">
                        Select Resume
                    </label>
                    <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                        <SelectTrigger id="resume-select" className="w-full">
                            <SelectValue placeholder="Choose a resume to analyze" />
                        </SelectTrigger>
                        <SelectContent>
                            {allResumes.length === 0 ? (
                                <SelectItem value="no-resumes" disabled>
                                    No Resumes uploaded
                                </SelectItem>
                            ) : (
                                allResumes.map((resume) => (
                                    <SelectItem key={resume.id} value={resume.id}>
                                        {resume.resumeName} {resume.isActive && "(Primary)"}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Info Card */}
                <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
                    <h2 className="text-lg font-semibold mb-2">Ready to Improve Your Resume?</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Select a resume from the dropdown above to receive comprehensive AI-powered feedback, including section analysis, keyword optimization, and actionable improvement suggestions.
                    </p>
                </div>
            </div>
        </main>
    )
}