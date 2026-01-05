"use client"

import { useState, useMemo } from "react"
import { Search, Filter, Calendar, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface WaitingListProps {
    candidates: any[]
    jobs: any[]
    onScheduleBatch: (ids: string[]) => void
}

export function WaitingList({ candidates, jobs, onScheduleBatch }: WaitingListProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [jobFilter, setJobFilter] = useState("all")
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const filteredCandidates = useMemo(() => {
        return candidates.filter((c) => {
            const matchesSearch =
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.title.toLowerCase().includes(searchQuery.toLowerCase())
            // In this mock, we'll just show all candidates as "waiting" if they aren't in the interview list
            return matchesSearch
        })
    }, [candidates, searchQuery])

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
    }

    const allSelected = filteredCandidates.length > 0 && selectedIds.length === filteredCandidates.length

    const selectAll = () => {
        if (allSelected) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredCandidates.map((c) => c.id))
        }
    }

    return (
        <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            Candidate Waiting List
                            <Badge
                                variant="secondary"
                                className="rounded-full h-5 px-1.5 text-[10px] font-medium bg-primary/10 text-primary border-primary/20"
                            >
                                {filteredCandidates.length}
                            </Badge>
                        </CardTitle>
                        <CardDescription>Qualified candidates waiting to be scheduled for interviews.</CardDescription>
                    </div>
                    {selectedIds.length > 0 && (
                        <div className="flex flex-col lg:flex-row items-center gap-2">
                            <Button
                                size="sm"
                                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 animate-in fade-in zoom-in duration-200"
                                onClick={() => onScheduleBatch(selectedIds)}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                Schedule {selectedIds.length} Selected
                            </Button>
                            <Button
                                size="sm"
                                className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20 animate-in fade-in zoom-in duration-200"

                            >
                                Remove {selectedIds.length} from Waiting List
                            </Button>
                        </div>


                    )}
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:flex lg:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search candidates..."
                            className="pl-9 bg-background h-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={jobFilter} onValueChange={setJobFilter}>
                            <SelectTrigger className="w-full md:w-[200px] bg-background h-10 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="All Jobs" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Jobs</SelectItem>
                                {jobs.map((job) => (
                                    <SelectItem key={job.id} value={job.id}>
                                        {job.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={selectAll}
                            className={cn("h-10 px-3 shrink-0", allSelected && "bg-primary/5 border-primary/30 text-primary")}
                        >
                            {allSelected ? "Deselect All" : "Select All"}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                    {filteredCandidates.length > 0 ? (
                        filteredCandidates.map((candidate) => (
                            <div
                                key={candidate.id}
                                className={`flex items-center gap-4 p-4 transition-colors hover:bg-muted/20 ${selectedIds.includes(candidate.id) ? "bg-primary/5" : ""}`}
                            >
                                <div className="flex items-center px-1">
                                    <Checkbox
                                        checked={selectedIds.includes(candidate.id)}
                                        onCheckedChange={() => toggleSelect(candidate.id)}
                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                </div>

                                <Avatar className="h-10 w-10 border border-border/50">
                                    <AvatarImage src={`/.jpg?height=40&width=40&query=${candidate.name}`} />
                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                                        {candidate.name
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                            {candidate.name}
                                        </p>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="text-xs font-bold text-primary">{candidate.matchScore}%</span>
                                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                                                <div className="h-full bg-primary" style={{ width: `${candidate.matchScore}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{candidate.title}</p>
                                </div>

                                <div className="hidden sm:flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] py-0 h-5 font-normal border-border/60">
                                        {candidate.experience} Exp
                                    </Badge>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    onClick={() => onScheduleBatch([candidate.id])}
                                >
                                    <UserPlus className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-sm text-muted-foreground">No candidates found in the waiting list.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
