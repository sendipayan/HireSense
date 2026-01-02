"use client"

import { useState, useMemo } from "react"
import { Search, Target, Sparkles, Filter, BrainCircuit, Trophy, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { CandidateCard } from "@/components/candidate-card"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { mockCandidates, mockJobs } from "@/lib/mock-data"

export function TopMatchesClient() {
    const [selectedJob, setSelectedJob] = useState(mockJobs[0].id)
    const [searchQuery, setSearchQuery] = useState("")
    const [minScore, setMinScore] = useState("80")

    const currentJob = mockJobs.find((j) => j.id === selectedJob) || mockJobs

    const filteredCandidates = useMemo(() => {
        return mockCandidates
            .filter((c) => {
                const matchesSearch =
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.title.toLowerCase().includes(searchQuery.toLowerCase())
                const matchesScore = c.matchScore >= Number.parseInt(minScore)
                return matchesSearch && matchesScore
            })
            .sort((a, b) => b.matchScore - a.matchScore)
    }, [searchQuery, minScore])

    return (
        <main className="min-h-screen bg-background text-foreground py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Breadcrumbs items={[{ label: "Recruiter", href: "/recruiter/dashboard" }, { label: "Top Matches" }]} />

                {/* Hero Section with AI Accent */}
                <div className="relative mt-8 overflow-hidden rounded-3xl bg-linear-to-br from-primary/10 via-background to-background border border-border/50 p-8 sm:p-12">
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 border border-primary/20">
                                <Sparkles className="h-4 w-4" />
                                AI-Powered Talent Discovery
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                                Discover your <span className="text-primary italic">Perfect Match.</span>
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Our advanced LLM algorithms analyze candidate experience, technical prowess, and cultural alignment to
                                surface the top 1% of talent for your specific roles.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 min-w-[320px]">
                            <div className="bg-card/50 backdrop-blur-xl border border-border p-6 rounded-2xl shadow-sm">
                                <p className="text-sm font-medium text-muted-foreground mb-3">Analyzing for Position:</p>
                                <Select value={selectedJob} onValueChange={setSelectedJob}>
                                    <SelectTrigger className="w-full bg-background border-primary/30 h-12 text-lg">
                                        <SelectValue placeholder="Select a job..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockJobs.map((job) => (
                                            <SelectItem key={job.id} value={job.id}>
                                                {job.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Target className="h-3 w-3 text-primary" /> {filteredCandidates.length} Total Matches
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <BrainCircuit className="h-3 w-3 text-primary" /> High Confidence
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
                </div>

                {/* Filters & Actions Bar */}
                <div className="mt-12 flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-md p-4 rounded-2xl border border-border shadow-sm">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by name or skills..."
                            className="pl-10 bg-background border-border focus:border-primary/50 h-11"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-background/50 border border-border rounded-lg px-3 h-11">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Min Match:</span>
                            <Select value={minScore} onValueChange={setMinScore}>
                                <SelectTrigger className="w-20 border-0 bg-transparent h-8 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="70">70%</SelectItem>
                                    <SelectItem value="80">80%</SelectItem>
                                    <SelectItem value="90">90%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center border border-border rounded-lg p-1 bg-background/50">
                            <Button variant="ghost" size="icon" className="h-9 w-9 bg-primary/10 text-primary">
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="mt-8 grid gap-6 lg:grid-cols-1">
                    {filteredCandidates.length > 0 ? (
                        <div className="space-y-4">
                            {filteredCandidates.map((candidate, index) => (
                                <div key={candidate.id} className="relative group">
                                    {index === 0 && (
                                        <div className="absolute -top-3 left-6 z-20">
                                            <Badge className="bg-primary text-primary-foreground flex items-center gap-1.5 px-3 py-1 border-2 border-background">
                                                <Trophy className="h-3.5 w-3.5" /> Best Match
                                            </Badge>
                                        </div>
                                    )}
                                    <CandidateCard {...candidate} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed bg-transparent py-20">
                            <CardContent className="flex flex-col items-center text-center">
                                <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                                    <Target className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold">No high-tier matches found</h3>
                                <p className="text-muted-foreground mt-2 max-w-sm">
                                    Try adjusting your minimum match score or searching for broader terms.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-6 bg-transparent"
                                    onClick={() => {
                                        setSearchQuery("")
                                        setMinScore("80")
                                    }}
                                >
                                    Reset Filters
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </main>
    )
}
