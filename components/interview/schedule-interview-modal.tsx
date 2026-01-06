"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock, LinkIcon, MapPin } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"

const formSchema = z.object({
    candidateIds: z.array(z.string()).min(1, "At least one candidate is required"),
    jobIds: z.array(z.string()).min(1, "At least one job is required"),
    type: z.enum(["online", "phone", "in-person"], { required_error: "Interview type is required" }),
    date: z.date({ required_error: "Date is required" }),
    time: z.string({ required_error: "Time is required" }),
    duration: z.string({ required_error: "Duration is required" }),
    location: z.string().optional(),
    meetingLink: z.string().url("Invalid meeting link").optional().or(z.literal("")),
    notes: z.string().optional(),
})

interface ScheduleInterviewModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSchedule: (values: any) => void
    candidates: { id: string; name: string }[]
    jobs: { id: string; title: string }[]
    selectedCandidateIds?: string[]
    selectedJobIds?: string[]
}

export function ScheduleInterviewModal({
    open,
    onOpenChange,
    onSchedule,
    candidates,
    jobs,
    selectedCandidateIds = [],
    selectedJobIds = [],
}: ScheduleInterviewModalProps) {
    const isMultiSelectLocked = selectedCandidateIds.length > 0
    const isJobLocked = selectedJobIds.length > 0

    const uniqueCandidateIds = Array.from([...new Map(candidates.map((c) => [c.id, c])).values()])
    const uniqueJobIds = Array.from([...new Map(jobs.map((j) => [j.id, j])).values()])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            candidateIds: selectedCandidateIds,
            jobIds: selectedJobIds,
            type: "online",
            duration: "30",
            location: "",
            meetingLink: "",
            notes: "",
        },
    })


    useEffect(() => {
        if (open) {
            form.setValue("candidateIds", selectedCandidateIds)
            form.setValue("jobIds", selectedJobIds)
        }
    }, [open, selectedCandidateIds, selectedJobIds, form])

    function onSubmit(values: z.infer<typeof formSchema>) {
        onSchedule(values)
        onOpenChange(false)
        form.reset()
    }

    const interviewType = form.watch("type")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                    <DialogDescription>
                        {isMultiSelectLocked
                            ? `Scheduling interviews for ${selectedCandidateIds.length} pre-selected candidates.`
                            : "Select candidates and job details to schedule a new interview."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="candidateIds"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Candidates</FormLabel>
                                        {isMultiSelectLocked ? (
                                            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/50 min-h-[40px]">
                                                {uniqueCandidateIds
                                                    .filter((c) => selectedCandidateIds.includes(c.id)).slice(0, 3)
                                                    .map((c) => (
                                                        <Badge
                                                            key={c.id}
                                                            variant="secondary"
                                                            className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
                                                        >
                                                            {c.name}
                                                        </Badge>
                                                    ))}
                                                {uniqueCandidateIds.filter((c) => selectedCandidateIds.includes(c.id)).length > 3 && (
                                                    <Badge variant="outline" className="bg-background">
                                                        +{uniqueCandidateIds.filter((c) => selectedCandidateIds.includes(c.id)).length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <Select
                                                onValueChange={(value) => field.onChange([...field.value, value])}
                                                value={field.value[field.value.length - 1] || ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Add candidate..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {candidates
                                                        .filter((c) => !field.value.includes(c.id))
                                                        .map((c) => (
                                                            <SelectItem key={c.id} value={c.id}>
                                                                {c.name}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {!isMultiSelectLocked && field.value.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {field.value.map((id) => {
                                                    const candidate = candidates.find((c) => c.id === id)
                                                    return (
                                                        <Badge key={id} variant="secondary" className="pr-1">
                                                            {candidate?.name}
                                                            <button
                                                                type="button"
                                                                onClick={() => field.onChange(field.value.filter((i: string) => i !== id))}
                                                                className="ml-1 hover:text-destructive transition-colors"
                                                            >
                                                                <Badge className="p-0 h-3 w-3 inline-flex items-center justify-center bg-transparent text-current border-0 hover:bg-transparent">
                                                                    ×
                                                                </Badge>
                                                            </button>
                                                        </Badge>
                                                    )
                                                })}
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="jobIds"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Positions</FormLabel>
                                        {isJobLocked ? (
                                            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/50 min-h-[40px]">
                                                {uniqueJobIds
                                                    .filter((j) => selectedJobIds.includes(j.id)).slice(0, 3)
                                                    .map((j) => (
                                                        <Badge
                                                            key={j.id}
                                                            variant="secondary"
                                                            className="bg-primary/10 text-primary border-primary/20"
                                                        >
                                                            {j.title}
                                                        </Badge>
                                                    ))}
                                                {uniqueJobIds.filter((j) => selectedJobIds.includes(j.id)).length > 3 && (
                                                    <Badge variant="outline" className="bg-background">
                                                        +{uniqueJobIds.filter((j) => selectedJobIds.includes(j.id)).length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <Select
                                                onValueChange={(value) => field.onChange([...field.value, value])}
                                                value={field.value[field.value.length - 1] || ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Add job position..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {jobs
                                                        .filter((j) => !field.value.includes(j.id))
                                                        .map((j) => (
                                                            <SelectItem key={j.id} value={j.id}>
                                                                {j.title}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {!isJobLocked && field.value.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {field.value.map((id) => {
                                                    const job = jobs.find((j) => j.id === id)
                                                    return (
                                                        <Badge key={id} variant="secondary" className="pr-1">
                                                            {job?.title}
                                                            <button
                                                                type="button"
                                                                onClick={() => field.onChange(field.value.filter((i: string) => i !== id))}
                                                                className="ml-1 hover:text-destructive transition-colors"
                                                            >
                                                                <Badge className="p-0 h-3 w-3 inline-flex items-center justify-center bg-transparent text-current border-0 hover:bg-transparent">
                                                                    ×
                                                                </Badge>
                                                            </button>
                                                        </Badge>
                                                    )
                                                })}
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Interview Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="online">Online</SelectItem>
                                                <SelectItem value="phone">Phone Call</SelectItem>
                                                <SelectItem value="in-person">In-Person</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select duration" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="15">15 min</SelectItem>
                                                <SelectItem value="30">30 min</SelectItem>
                                                <SelectItem value="45">45 min</SelectItem>
                                                <SelectItem value="60">60 min</SelectItem>
                                                <SelectItem value="90">90 min</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                    >
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input type="time" className="pl-9" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {interviewType === "online" ? (
                            <FormField
                                control={form.control}
                                name="meetingLink"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meeting Link</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="https://zoom.us/j/..." className="pl-9" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{interviewType === "phone" ? "Phone Number" : "Location"}</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder={interviewType === "phone" ? "+1 (555) 000-0000" : "Office address / Room"}
                                                    className="pl-9"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Private Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any internal notes for the interviewers..."
                                            className="resize-none min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Schedule Interview</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
