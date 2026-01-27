"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/page-header";
import { FormField } from "@/components/form-field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/multi-select";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Eye, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useRecruiterStore } from "@/store/RecuiterStore";
import { Spinner } from "@/components/ui/spinner";

type Department =
    | "ENGINEERING"
    | "DESIGN"
    | "MARKETING"
    | "SALES"
    | "SUPPORT"
    | "HR"
    | "FINANCE"
    | "OPERATIONS";
type JobType = "FULL_TIME" | "INTERNSHIP" | "BOTH";
type ExperienceRequired =
    | "ENTRY_LEVEL"
    | "MID_LEVEL"
    | "SENIOR_LEVEL"
    | "LEAD"
    | "EXECUTIVE";

type formType = {
    id: string;
    title: string | "";
    description: string | "";
    location: string | "";
    minSalary: number;
    maxSalary: number;
    department: Department | string;
    jobType: JobType | string;
    experienceRequired: ExperienceRequired | string;
    requirements: string[];
    optional?: string[];
    benifits: string[];
};

export default function PostJob() {
    const [loading, setLoading] = useState(false);
    const { RecuiterProfile } = useRecruiterStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [skills, setSkills] = useState([])
    const [roles, setRoles] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [form, setForm] = useState<formType>({
        id: "",
        title: "",
        description: "",
        location: "",
        jobType: "NONE",
        experienceRequired: "NONE",
        department: "NONE",
        requirements: [],
        optional: [],
        benifits: [],
        minSalary: 0,
        maxSalary: 0,
    });
    const router = useRouter();
    const SKILLS_OPTIONS = [
        { value: "NONE", label: "NONE" },
        { value: "react", label: "React" },
        { value: "react-native", label: "React Native" },
        { value: "typescript", label: "TypeScript" },
        { value: "nodejs", label: "Node.js" },
        { value: "python", label: "Python" },
        { value: "aws", label: "AWS" },
        { value: "sql", label: "SQL" },
        { value: "design", label: "UI/UX Design" },
        { value: "product", label: "Product Management" },
    ]
    const jobTypes = ["FULL_TIME", "INTERNSHIP", "BOTH", "NONE"];
    const experienceLevels = [
        "ENTRY_LEVEL",
        "MID_LEVEL",
        "SENIOR_LEVEL",
        "LEAD",
        "EXECUTIVE",
        "NONE",
    ];
    const departments = [
        "ENGINEERING",
        "DESIGN",
        "MARKETING",
        "SALES",
        "SUPPORT",
        "HR",
        "FINANCE",
        "OPERATIONS",
        "NONE",
    ];

    const benefits = [
        "Health Insurance",
        "401(k) Matching",
        "Remote Work",
        "Flexible Hours",
        "Stock Options",
        "Professional Development",
        "Paid Time Off",
        "Parental Leave",
    ];

    useEffect(() => {

        if (RecuiterProfile) {
            setForm({ ...form, id: RecuiterProfile.id })
        }
    }, [RecuiterProfile])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log(form);

        if (form.id.trim() === "") {
            return
        }

        if (form.title.trim() === "" ||
            form.description.trim() === "" ||
            form.location.trim() === "" ||
            form.minSalary < 0 ||
            form.requirements.length <= 0 ||
            form.maxSalary <= 0) {
            alert("Please fill all the fields");
            return;
        }

        try {
            setLoading(true)
            const res = await axios.post("/api/recruiter/post_job", form, { withCredentials: true });
            if (res.status === 201) {
                console.log("Form submitted: ", res.data);
                router.push("/recruiter/dashboard");
            }

        } catch (err) {
            console.error("Form submission error: ", err);
        } finally {
            setLoading(false)
        }
    };


    const prevSearchQueryRef = useRef("")

    useEffect(() => {
        const currentTrimmed = searchQuery.trim()
        const prevTrimmed = prevSearchQueryRef.current.trim()

        if (currentTrimmed === "") {
            setSkills([])
            return
        }

        if (currentTrimmed === prevTrimmed) {
            prevSearchQueryRef.current = searchQuery
            return
        }

        const timeoutId = setTimeout(async () => {
            console.log("Search:", currentTrimmed);
            prevSearchQueryRef.current = searchQuery;

            try {
                setSearchLoading(true)
                const res = await axios.get(`/api/search/skills?query=${currentTrimmed}`, { withCredentials: true })
                console.log(res.data)
                setSkills(res.data.result)
            } catch (err) {
                console.log(err)
            } finally {
                setSearchLoading(false)
            }


        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <main className="py-8 sm:py-12">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <Breadcrumbs
                    items={[
                        { label: "Recruiter", href: "/recruiter/dashboard" },
                        { label: "Post a Job" },
                    ]}
                />

                {/* Page Header */}
                <PageHeader
                    title="Post a New Job"
                    description="Create a compelling job posting to attract top talent. Our AI will help match you with the best candidates."
                />

                {/* Job Posting Form */}
                <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
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
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Select
                                        name="department"
                                        value={form.department || "NONE"}
                                        onValueChange={(value) => {
                                            setForm({ ...form, department: value });
                                        }}
                                        required
                                    >
                                        <SelectTrigger
                                            id="department"
                                            aria-label="Select department"
                                        >
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>
                                                    {dept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="job-type">Job Type</Label>
                                    <Select
                                        name="jobType"
                                        value={form.jobType || "NONE"}
                                        onValueChange={(value) => {
                                            setForm({ ...form, jobType: value });
                                        }}
                                        required
                                    >
                                        <SelectTrigger id="job-type" aria-label="Select job type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {jobTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    label="Location"
                                    name="location"
                                    placeholder="e.g., San Francisco, CA or Remote"
                                    required
                                    value={form.location}
                                    onChange={(e) =>
                                        setForm({ ...form, location: e.target.value })
                                    }
                                />

                                <div className="space-y-2">
                                    <Label htmlFor="experience">Experience Level</Label>
                                    <Select
                                        name="experience"
                                        value={form.experienceRequired || "NONE"}
                                        onValueChange={(value) => {
                                            setForm({ ...form, experienceRequired: value });
                                        }}
                                        required
                                    >
                                        <SelectTrigger
                                            id="experience"
                                            aria-label="Select experience level"
                                        >
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {experienceLevels.map((level) => (
                                                <SelectItem key={level} value={level}>
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
                        <h2
                            id="compensation-heading"
                            className="text-lg font-semibold mb-4"
                        >
                            Compensation
                        </h2>
                        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="salary-min">Minimum Salary</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            ₹
                                        </span>
                                        <Input
                                            id="salary-min"
                                            name="salaryMin"
                                            type="number"
                                            placeholder="100,000"
                                            className="pl-7"
                                            aria-describedby="salary-hint"
                                            value={form.minSalary}
                                            onChange={(e) =>
                                                setForm({ ...form, minSalary: Number(e.target.value) })
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="salary-max">Maximum Salary</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            ₹
                                        </span>
                                        <Input
                                            id="salary-max"
                                            name="salaryMax"
                                            type="number"
                                            placeholder="150,000"
                                            className="pl-7"
                                            value={form.maxSalary}
                                            onChange={(e) =>
                                                setForm({ ...form, maxSalary: Number(e.target.value) })
                                            }
                                            required
                                        />
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
                                value={form.description}
                                onChange={(e) =>
                                    setForm({ ...form, description: e.target.value })
                                }
                            />

                            <MultiSelect
                                label="Primary Skills"
                                name="primarySkills"
                                options={skills}
                                selected={form.requirements || []}
                                onChange={(selected) => setForm({ ...form, requirements: selected })}
                                placeholder="Select your primary skills"
                                query={searchQuery}
                                setQuery={setSearchQuery}
                                required
                            />

                            <MultiSelect
                                label="Nice to Have"
                                name="niceToHave"
                                options={skills}
                                selected={form.optional || []}
                                onChange={(selected) => setForm({ ...form, optional: selected })}
                                placeholder="Select your nice to have skills"
                                query={searchQuery}
                                setQuery={setSearchQuery}
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
                                                id={`benefit-${benefit
                                                    .toLowerCase()
                                                    .replace(" ", "-")}`}
                                                name="benefits"
                                                value={benefit}
                                                checked={form.benifits.includes(benefit)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setForm({
                                                            ...form,
                                                            benifits: [...form.benifits, benefit],
                                                        });
                                                    } else {
                                                        setForm({
                                                            ...form,
                                                            benifits: form.benifits.filter(
                                                                (b) => b !== benefit
                                                            ),
                                                        });
                                                    }
                                                }}
                                            />
                                            <Label
                                                htmlFor={`benefit-${benefit
                                                    .toLowerCase()
                                                    .replace(" ", "-")}`}
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
                                    Our AI will analyze your job posting and automatically match
                                    it with qualified candidates in our database. You&apos;ll
                                    receive instant notifications when great matches are found.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Form Actions */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="bg-transparent"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                            Back to Dashboard
                        </Button>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button type="submit" size="lg">
                                {loading ? <Spinner className="w-4 h-4" /> : "Publish Job"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}
