"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { mockFeedback } from "@/lib/mock-data"
import {
    Sparkles,
    FileText,
    CheckCircle2,
    AlertCircle,
    Lightbulb,
    ArrowRight,
    Download,
    RefreshCw,
    Tag,
    Delete,
    Trash2,
    Eye
} from "lucide-react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useEffect, useState } from "react"

interface Resume {
    id: string;
    resumeName: string;
    createdAt: Date;
    isActive: boolean;
    resumeUrl: string;
}


export default function AIFeedbackClientPage({ resumeId }: { resumeId: string }) {

    const router = useRouter()
    const { overall, sections, keywords } = mockFeedback
    const [loading, setLoading] = useState(false)
    const [trigger, setTrigger] = useState(false)
    const [resume, setResume] = useState<Resume>({
        id: "",
        resumeName: "",
        createdAt: new Date(),
        isActive: false,
        resumeUrl: ""
    })

    useEffect(() => {

        if (resumeId.trim() === "") return
        const getResume = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`/api/candidate/get_resumes/${resumeId}`)
                console.log(response.data)
                if (response.status === 200) {
                    setResume(response.data.resumes)
                }
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }
        }
        getResume()
    }, [trigger])

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-success"
        if (score >= 75) return "text-warning"
        return "text-destructive"
    }

    const getScoreLabel = (score: number) => {
        if (score >= 90) return "Excellent"
        if (score >= 80) return "Good"
        if (score >= 70) return "Fair"
        return "Needs Work"
    }

    const primaryResume = async () => {
        if (resumeId.trim() === "") return
        if (resume?.isActive) return
        try {
            setLoading(true)
            const response = await axios.post(`/api/candidate/set_resume`, { id: resumeId })
            console.log(response.data)
            if (response.status === 200) {
                setTrigger(!trigger)
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const deleteResume = async () => {
        if (resumeId.trim() === "") return
        try {
            setLoading(true)
            const response = await axios.delete(`/api/candidate/delete_resume/${resumeId}`)
            console.log(response.data)
            if (response.status === 200) {
                router.back()
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="py-8 sm:py-12">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <Breadcrumbs items={[{ label: "Candidate", href: "/candidate/dashboard" }, { label: "AI Feedback" }]} />

                {/* Page Header */}
                <PageHeader
                    title="AI Resume Feedback"
                    description="Detailed analysis of your resume with actionable suggestions to improve your chances."
                >
                    <Button variant="outline" className="bg-transparent cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                        View Resume
                    </Button>
                </PageHeader>

                {/* Overall Score */}
                <section className="mt-8" aria-labelledby="overall-score-heading">
                    <div className="rounded-2xl border border-border bg-card p-8">
                        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-6">
                            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
                                <span className={`text-4xl font-bold ${getScoreColor(overall.score)}`}>{overall.score}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                    <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                                    <h2 id="overall-score-heading" className="text-lg font-semibold">
                                        Overall Resume Score
                                    </h2>
                                    <Badge variant="secondary">{getScoreLabel(overall.score)}</Badge>
                                </div>
                                <p className="mt-3 text-muted-foreground leading-relaxed">{overall.summary}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section-by-Section Analysis */}
                <section className="mt-8" aria-labelledby="sections-heading">
                    <h2 id="sections-heading" className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                        Section Analysis
                    </h2>
                    <div className="space-y-4">
                        {sections.map((section) => (
                            <article key={section.title} className="rounded-xl border border-border bg-card overflow-hidden">
                                {/* Section Header */}
                                <div className="p-6 border-b border-border">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-lg">{section.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-2xl font-bold ${getScoreColor(section.score)}`}>{section.score}%</span>
                                        </div>
                                    </div>
                                    <Progress
                                        value={section.score}
                                        className="h-2"
                                        aria-label={`${section.title} score: ${section.score}%`}
                                    />
                                </div>

                                {/* Feedback */}
                                <div className="p-6">
                                    <p className="text-muted-foreground leading-relaxed">{section.feedback}</p>

                                    {/* Suggestions */}
                                    <div className="mt-6">
                                        <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                                            <Lightbulb className="h-4 w-4 text-warning" aria-hidden="true" />
                                            Suggestions
                                        </h4>
                                        <ul className="space-y-2">
                                            {section.suggestions.map((suggestion, index) => (
                                                <li key={index} className="flex items-start gap-3 text-sm">
                                                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
                                                    <span className="text-muted-foreground">{suggestion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Keyword Analysis */}
                <section className="mt-8" aria-labelledby="keywords-heading">
                    <h2 id="keywords-heading" className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Tag className="h-5 w-5 text-primary" aria-hidden="true" />
                        Keyword Analysis
                    </h2>
                    <div className="rounded-xl border border-border bg-card p-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            {/* Found Keywords */}
                            <div>
                                <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                                    <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                                    Keywords Found
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {keywords.found.map((keyword) => (
                                        <Badge key={keyword} variant="secondary" className="bg-success/10 text-success border-success/20">
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Missing Keywords */}
                            <div>
                                <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                                    <AlertCircle className="h-4 w-4 text-warning" aria-hidden="true" />
                                    Missing Keywords
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {keywords.missing.map((keyword) => (
                                        <Badge key={keyword} variant="outline" className="border-warning/20 text-warning">
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-sm text-muted-foreground leading-relaxed">{keywords.recommendation}</p>
                        </div>
                    </div>
                </section>

                {/* Quick Tips */}
                <section className="mt-8" aria-labelledby="tips-heading">
                    <h2 id="tips-heading" className="text-lg font-semibold mb-4">
                        Quick Improvement Tips
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            {
                                title: "Quantify Achievements",
                                description: "Add numbers and metrics to demonstrate impact (e.g., 'Increased sales by 25%')",
                            },
                            {
                                title: "Use Action Verbs",
                                description: "Start bullet points with strong verbs like 'Led', 'Developed', 'Implemented'",
                            },
                            {
                                title: "Tailor to Job",
                                description: "Customize your resume for each application using keywords from job descriptions",
                            },
                            {
                                title: "Keep it Concise",
                                description: "Aim for 1-2 pages max. Remove outdated or irrelevant experience",
                            },
                        ].map((tip) => (
                            <article key={tip.title} className="rounded-xl border border-border bg-card p-4">
                                <h3 className="font-medium">{tip.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{tip.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Actions */}
                <section className="mt-8 rounded-xl border border-border bg-card p-6" aria-labelledby="actions-heading">
                    <h2 id="actions-heading" className="font-semibold mb-4">
                        Next Steps
                    </h2>
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Button className={`flex-1 ${resume?.isActive ? "cursor-not-allowed" : "cursor-pointer"}`} onClick={primaryResume} disabled={loading || resume?.isActive}>

                            {!resume?.isActive && <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />}
                            {resume?.isActive ? "Primary Resume" : "Set as Primary Resume"}

                        </Button>
                        <Button variant="destructive" className="flex-1 cursor-pointer" onClick={deleteResume} disabled={loading}>
                            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                            Delete Resume
                        </Button>
                        <Button variant="outline" asChild className="flex-1 bg-transparent" disabled={loading}>
                            <Link href="/match-results">
                                View Job Matches
                                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                            </Link>
                        </Button>
                    </div>
                </section>
            </div>
        </main>
    )
}