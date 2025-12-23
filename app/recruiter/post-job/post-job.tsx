"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { FormField } from "@/components/form-field"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, Eye, Save, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"




export default function PostJob() {
    const router = useRouter()
    const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Remote"]
    const experienceLevels = ["Entry Level", "Mid Level", "Senior", "Lead", "Executive"]
    const departments = ["Engineering", "Product", "Design", "Marketing", "Sales", "Operations", "HR", "Finance"]

    const benefits = [
        "Health Insurance",
        "401(k) Matching",
        "Remote Work",
        "Flexible Hours",
        "Stock Options",
        "Professional Development",
        "Paid Time Off",
        "Parental Leave",
    ]

    return (
        <main className="py-8 sm:py-12">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <Breadcrumbs items={[{ label: "Recruiter", href: "/recruiter/dashboard" }, { label: "Post a Job" }]} />

                {/* Page Header */}
                <PageHeader
                    title="Post a New Job"
                    description="Create a compelling job posting to attract top talent. Our AI will help match you with the best candidates."
                />

                {/* Job Posting Form */}
                <form className="mt-8 space-y-8" action="#" method="POST">
                    {/* Basic Information */}
                    <section aria-labelledby="basic-info-heading">
                        <h2 id="basic-info-heading" className="text-lg font-semibold mb-4">
                            Basic Information
                        </h2>
                        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                            <FormField
                                label="Job Title"
                                name="title"
                                placeholder="e.g., Senior Frontend Engineer"
                                required
                                description="Be specific to attract the right candidates"
                            />

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Select name="department">
                                        <SelectTrigger id="department" aria-label="Select department">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept.toLowerCase()}>
                                                    {dept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="job-type">Job Type</Label>
                                    <Select name="jobType">
                                        <SelectTrigger id="job-type" aria-label="Select job type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {jobTypes.map((type) => (
                                                <SelectItem key={type} value={type.toLowerCase()}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField label="Location" name="location" placeholder="e.g., San Francisco, CA or Remote" required />

                                <div className="space-y-2">
                                    <Label htmlFor="experience">Experience Level</Label>
                                    <Select name="experience">
                                        <SelectTrigger id="experience" aria-label="Select experience level">
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {experienceLevels.map((level) => (
                                                <SelectItem key={level} value={level.toLowerCase().replace(" ", "-")}>
                                                    {level}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Compensation */}
                    <section aria-labelledby="compensation-heading">
                        <h2 id="compensation-heading" className="text-lg font-semibold mb-4">
                            Compensation
                        </h2>
                        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="salary-min">Minimum Salary</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                        <Input
                                            id="salary-min"
                                            name="salaryMin"
                                            type="number"
                                            placeholder="100,000"
                                            className="pl-7"
                                            aria-describedby="salary-hint"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="salary-max">Maximum Salary</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                        <Input id="salary-max" name="salaryMax" type="number" placeholder="150,000" className="pl-7" />
                                    </div>
                                </div>
                            </div>
                            <p id="salary-hint" className="text-sm text-muted-foreground">
                                Showing salary ranges can increase applications by up to 30%.
                            </p>
                        </div>
                    </section>

                    {/* Job Description */}
                    <section aria-labelledby="description-heading">
                        <h2 id="description-heading" className="text-lg font-semibold mb-4">
                            Job Description
                        </h2>
                        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                            <FormField
                                label="Job Description"
                                name="description"
                                as="textarea"
                                rows={6}
                                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                                required
                                description="Be detailed - this helps our AI find better matches"
                            />

                            <FormField
                                label="Requirements"
                                name="requirements"
                                as="textarea"
                                rows={4}
                                placeholder="List the required skills, experience, and qualifications..."
                                required
                            />

                            <FormField
                                label="Nice to Have"
                                name="niceToHave"
                                as="textarea"
                                rows={3}
                                placeholder="Optional skills or experience that would be a plus..."
                            />
                        </div>
                    </section>

                    {/* Benefits */}
                    <section aria-labelledby="benefits-heading">
                        <h2 id="benefits-heading" className="text-lg font-semibold mb-4">
                            Benefits & Perks
                        </h2>
                        <div className="rounded-xl border border-border bg-card p-6">
                            <fieldset>
                                <legend className="sr-only">Select benefits offered</legend>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {benefits.map((benefit) => (
                                        <div key={benefit} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`benefit-${benefit.toLowerCase().replace(" ", "-")}`}
                                                name="benefits"
                                                value={benefit}
                                            />
                                            <Label
                                                htmlFor={`benefit-${benefit.toLowerCase().replace(" ", "-")}`}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {benefit}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </fieldset>
                        </div>
                    </section>

                    {/* AI Enhancement */}
                    <section className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                        <div className="flex items-start gap-4">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
                            </div>
                            <div className="flex-1">
                                <h2 className="font-semibold">AI-Powered Matching</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Our AI will analyze your job posting and automatically match it with qualified candidates in our
                                    database. You&apos;ll receive instant notifications when great matches are found.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Form Actions */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                        <Button type="button" variant="outline" size="lg" className="bg-transparent" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                            Back to Dashboard
                        </Button>
                        <div className="flex flex-col gap-3 sm:flex-row">

                            <Button type="submit" size="lg">
                                Publish Job
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    )
}
