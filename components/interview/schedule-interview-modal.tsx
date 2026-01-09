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
import { CalendarIcon, Clock, LinkIcon, MapPin, Phone } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import axios from "axios"

const formSchema = z.object({

    applicationIds: z.array(z.string()).min(1, "At least one application is required"),

    type: z.enum(["ONLINE", "PHONE", "IN_PERSON"], { required_error: "Interview type is required" }),
    date: z.date({ required_error: "Date is required" }),
    time: z.string({ required_error: "Time is required" }),
    duration: z.string({ required_error: "Duration is required" }),
    location: z.string().optional(),
    phno: z.string().optional(),
    meetingLink: z.string().url("Invalid meeting link").optional().or(z.literal("")),
    notes: z.string().optional(),
})

interface ScheduleInterviewModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSchedule: (values: any) => void
    setTrigger: (trigger: boolean) => void;
    applications: { CId: string, Cname: string, JId: string[], Jname: string[] }[]
    selectedApplicationIds: string[]
}

export function ScheduleInterviewModal({
    open,
    onOpenChange,
    onSchedule,
    setTrigger,
    applications = [],
    selectedApplicationIds = [],
}: ScheduleInterviewModalProps) {
    const [showAllCandidates, setShowAllCandidates] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            applicationIds: selectedApplicationIds,
            type: "ONLINE",
            duration: "30",
            location: "",
            phno: "",
            time: "",
            meetingLink: "",
            notes: "",
        },
    })

    useEffect(() => {
        if (selectedApplicationIds.length > 0) {
            form.setValue("applicationIds", selectedApplicationIds)
        }
    }, [selectedApplicationIds])

    useEffect(() => {
        console.log("form errors", form.formState.errors)
    }, [form.formState.errors])


    useEffect(() => {
        if (applications.length > 0) {
            console.log("applications modal: ", applications)
        }
    }, [applications])

    function toISO(date: Date, time: string): string {
        const [hours, minutes] = time.split(":").map(Number);

        const combined = new Date(date);
        combined.setHours(hours, minutes, 0, 0);

        return combined.toISOString();
    }



    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            values.date = new Date(toISO(values.date, values.time))
            const durations = Number(values.duration)
            const payload = {
                ...values,
                durations,
            }
            console.log(values.date)
            const res = await axios.post("/api/recruiter/add_interview", payload, { withCredentials: true })
            if (res.status === 201) {
                onSchedule(res.data)
                setTrigger(true)
                onOpenChange(false)
                form.reset()
            }
        } catch (err) {
            console.log(err)
        }
    }
    const remainingCandidates = Math.max(0, applications.length - 3)
    let displayedApplications = showAllCandidates ? applications : applications.slice(0, 3)


    const interviewType = form.watch("type")

    const renderCandidateJobPairs = () => {


        return (
            <div className="space-y-3">
                {displayedApplications?.map((app) => (
                    <div key={app.CId} className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{app.Cname}</p>
                                <p className="text-xs text-muted-foreground">Candidate</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {app.Jname.slice(0, 3).map((j) => (
                                    <Badge
                                        key={j}
                                        variant="secondary"
                                        className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm"
                                    >
                                        {j}
                                    </Badge>
                                ))}
                                {app.Jname.length > 3 && (
                                    <Badge variant="outline" className="bg-background text-xs sm:text-sm">
                                        +{app.Jname.length - 3}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                )
                )}
                {remainingCandidates > 0 && !showAllCandidates && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllCandidates(true)}
                        className="w-full text-muted-foreground hover:text-foreground"
                    >
                        +{remainingCandidates} more candidate{remainingCandidates > 1 ? "s" : ""}
                    </Button>
                )}
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                    <DialogDescription>
                        Scheduling for {applications?.length} candidate{applications?.length > 1 ? "s" : ""} across{" "}
                        {applications.length === 0 ? 0 : applications.map((app) => app.Jname.length)?.reduce((a, b) => Math.max(a, b))} position{applications.length === 0 ? 0 : applications.map((app) => app.Jname.length)?.reduce((a, b) => Math.max(a, b)) > 1 ? "s" : ""}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        {renderCandidateJobPairs()}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                                <SelectItem value="ONLINE">Online Meeting</SelectItem>
                                                <SelectItem value="PHONE">Phone Call</SelectItem>
                                                <SelectItem value="IN_PERSON">In-Person</SelectItem>
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
                                                <SelectItem value="15">15 Minutes</SelectItem>
                                                <SelectItem value="30">30 Minutes</SelectItem>
                                                <SelectItem value="45">45 Minutes</SelectItem>
                                                <SelectItem value="60">60 Minutes</SelectItem>
                                                <SelectItem value="90">90 Minutes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                                        className={cn("pl-3 text-left font-normal w-full", !field.value && "text-muted-foreground")}
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
                                                <Input type="time" className="pl-9" {...field} value={field.value || ""} onChange={field.onChange} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {interviewType === "ONLINE" && (
                            <FormField
                                control={form.control}
                                name="meetingLink"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meeting Link</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="https://zoom.us/j/..." className="pl-9" {...field} value={field.value || ""} onChange={field.onChange} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        {interviewType === "IN_PERSON" && (
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Office address / Room"
                                                    className="pl-9"
                                                    {...field}
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />)}
                        {interviewType === "PHONE" && (
                            <FormField
                                control={form.control}
                                name="phno"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="tel"
                                                    placeholder="+1 (555) 000-0000"
                                                    className="pl-9"

                                                    {...field}
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
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
                                    <FormLabel>Private Notes (optional)</FormLabel>
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

                        <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => { onOpenChange(false); form.reset() }} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button type="submit" className="w-full sm:w-auto" >
                                Schedule Interview
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
