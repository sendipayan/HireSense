"use client"

import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, DollarSign, Building2, Globe, Calendar, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { mockJobs } from "@/lib/mock-data"

import { useState } from "react"
import { useParams } from "next/navigation"



export default function JobDetailsPage() {
    const params = useParams()
    const id = params.id as string
    const job = mockJobs.find((j) => j.id === id)
    const [applyingJob, setApplyingJob] = useState<(typeof mockJobs)[0] | null>(null)

    if (!job) {
        notFound()
    }

    return (
        <main className="min-h-screen bg-background py-8 sm:py-12">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <Link
                    href="/candidate/browse-jobs"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to all jobs
                </Link>

                <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted border border-border">
                                <Building2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{job.title}</h1>
                                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                                    <span className="font-medium text-foreground">{job.company}</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {job.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" />
                                        {job.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-sm font-medium uppercase tracking-wider">Salary Range</span>
                            </div>
                            <p className="text-lg font-semibold">{job.salary}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-medium uppercase tracking-wider">Date Posted</span>
                            </div>
                            <p className="text-lg font-semibold">{job.posted}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Globe className="h-4 w-4" />
                                <span className="text-sm font-medium uppercase tracking-wider">Work Type</span>
                            </div>
                            <p className="text-lg font-semibold">Remote Friendly</p>
                        </div>
                    </div>

                    <div className="mt-10 space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold mb-4">Description</h2>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                                <p>{job.description}</p>
                                <p className="mt-4">
                                    We are looking for a highly motivated individual to join our growing team. The ideal candidate will
                                    have a strong background in the required technologies and a passion for building high-quality
                                    software. You will work closely with other engineers and product managers to define and implement
                                    features that provide value to our users.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-4">Required Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {job.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm">
                                        {tag}
                                    </Badge>
                                ))}
                                <Badge variant="outline" className="px-3 py-1 text-sm">
                                    Problem Solving
                                </Badge>
                                <Badge variant="outline" className="px-3 py-1 text-sm">
                                    Teamwork
                                </Badge>
                                <Badge variant="outline" className="px-3 py-1 text-sm">
                                    Communication
                                </Badge>
                            </div>
                        </section>

                        <Separator />

                        <section>
                            <h2 className="text-xl font-semibold mb-4">Benefits</h2>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground">
                                <li className="flex items-center gap-2 italic">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Health, dental, and vision insurance
                                </li>
                                <li className="flex items-center gap-2 italic">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Unlimited PTO and flexible working hours
                                </li>
                                <li className="flex items-center gap-2 italic">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Home office stipend and equipment
                                </li>
                                <li className="flex items-center gap-2 italic">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    401(k) with company matching
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>

            </div>
        </main>
    )
}
