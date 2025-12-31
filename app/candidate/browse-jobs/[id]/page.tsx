"use client"

import { notFound } from "next/navigation"
import { ArrowLeft, MapPin, DollarSign, Building2, Globe, Calendar, Briefcase, Clock, IndianRupee } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { mockJobs } from "@/lib/mock-data"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import axios from "axios"
import type { Job } from "@/store/jobStore"


export default function JobDetailsPage() {
    const params = useParams()
    const id = params.id as string
    const router = useRouter()
    const [jobs, setJobs] = useState<Job | null>(null)
    const [intialLoading, setIntialLoading] = useState(true)
    const [error, setError] = useState(false)
    const [applyingJob, setApplyingJob] = useState<(typeof mockJobs)[0] | null>(null)

    useEffect(() => {

        const fetch = async () => {
            try {
                setIntialLoading(true)
                const res = await axios.get(`/api/getjob/${id}`, { withCredentials: true })
                const data = await res.data
                console.log(data)
                setJobs(data.job)
            } catch (err) {
                console.log(err)
                setError(true)
            } finally {
                setIntialLoading(false)
            }
        }
        fetch()
    }, [setJobs, id])

    useEffect(() => {
        console.log(jobs)
    }, [jobs])



    return (
        <main className="min-h-screen bg-background py-8 sm:py-12">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <Button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-transparent hover:bg-transparent hover:text-primary transition-colors cursor-pointer mb-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>

                {error ? <div className="rounded-xl flex items-center justify-center border border-border bg-destructive-foreground p-6 sm:p-8 shadow-sm h-[60vh]">
                    <h1 className="text-2xl sm:text-3xl font-bold text-destructive">Job Not Found</h1>
                </div> : (!intialLoading ? <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted border border-border">
                                <Building2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{jobs?.title}</h1>
                                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                                    <span className="font-medium text-foreground">{jobs?.recruiter}</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {jobs?.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {jobs?.jobType}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <IndianRupee className="h-4 w-4" />
                                <span className="text-sm font-medium uppercase tracking-wider">Salary Range</span>
                            </div>
                            <p className="text-lg font-semibold">{jobs?.minSalary}-{jobs?.maxSalary}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-medium uppercase tracking-wider">Date Posted</span>
                            </div>
                            <p className="text-lg font-semibold">{new Date(jobs?.createdAt ? jobs.createdAt : Date.now()).toISOString().split("T")[0]}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">

                                <Briefcase className="h-4 w-4" />
                                <span className="text-sm font-medium uppercase tracking-wider">Experience Required</span>
                            </div>
                            <p className="text-lg font-semibold">{jobs?.experienceRequired}</p>
                        </div>
                    </div>

                    <div className="mt-10 space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold mb-4">Description</h2>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                                <p>{jobs?.description}</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-4">Required Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {jobs?.requirements.map((tag) => (
                                    <Badge key={tag} variant="default" className="px-3 py-1 text-sm">
                                        {tag}
                                    </Badge>
                                ))}
                                {jobs?.optional.map((tag) => (<Badge key={tag} variant="outline" className="px-3 py-1 text-sm">
                                    {tag}
                                </Badge>))}
                            </div>
                        </section>

                        <Separator />

                        <section>
                            <h2 className="text-xl font-semibold mb-4">Benefits</h2>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground">
                                {jobs?.benifits.map((benefit) => (<li className="flex items-center gap-2 italic" key={benefit}>

                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <p>{benefit}</p>


                                </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div> :
                    <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-[70vh]">

                    </div>)}


            </div>
        </main>
    )
}
