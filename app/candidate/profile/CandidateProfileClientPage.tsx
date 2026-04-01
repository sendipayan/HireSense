"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Save, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/form-field"
import { FormSection } from "@/components/form-section"
import { ProfileCompletionIndicator } from "@/components/profile-completion-indicator"
import { MultiSelect } from "@/components/multi-select"
import { PageHeader } from "@/components/page-header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { useCandidateStore } from "@/store/candidateStore"
import { useAuthStore } from "@/store/authStore"
import { useProjectStore } from "@/store/projectStore"
import axios from "axios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface CandidateFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  status: "STUDENT" | "GRADUATE" | "WORKING_PROFESSIONAL" | "NONE" | "";
  institution: string;
  graduationYear: string;
  degree: string;
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "NONE" | "";
  githubUrl: string;
  preferredRoles?: string[];
  linkedinName: string;
  portfolioUrl: string;
  jobTypePreference: "FULL_TIME" | "INTERNSHIP" | "BOTH" | "NONE" | "";
  isVerified: boolean;
  openToWork: boolean;
  availability: "IMMEDIATE" | "ONE_TO_THREE_MONTHS" | "THREE_TO_SIX_MONTHS" | "LATER" | "NONE" | "";
  projects: {
    id?: string;
    title: string;
    description: string;
    repoUrl: string;
    liveLink: string;
    language: string;
    stars: number;
    forks: number;
    githubRepoId: number;
    githubUpdatedAt: string;
  }[];
};

const CURRENT_STATUS_OPTIONS = [
  { label: "student", value: "STUDENT" },
  { label: "graduate", value: "GRADUATE" },
  { label: "working", value: "WORKING_PROFESSIONAL" },
]

const SKILLS_OPTIONS = [
  { value: "NONE", label: "NONE" },
  { value: "react", label: "React" },
  { value: "typescript", label: "TypeScript" },
  { value: "nodejs", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "aws", label: "AWS" },
  { value: "sql", label: "SQL" },
  { value: "design", label: "UI/UX Design" },
  { value: "product", label: "Product Management" },
]

const EXPERIENCE_LEVEL_OPTIONS = [
  { label: "beginner", value: "BEGINNER" },
  { label: "intermediate", value: "INTERMEDIATE" },
  { label: "advanced", value: "ADVANCED" },
]

const PREFERRED_ROLES_OPTIONS = [
  { value: "frontend", label: "Frontend Engineer" },
  { value: "backend", label: "Backend Engineer" },
  { value: "fullstack", label: "Full-Stack Engineer" },
  { value: "designer", label: "Product Designer" },
  { value: "devops", label: "DevOps Engineer" },
  { value: "qa", label: "QA Engineer" },
]

const JOB_TYPE_OPTIONS = [
  { label: "fulltime", value: "FULL_TIME" },
  { label: "internship", value: "INTERNSHIP" },
  { label: "both", value: "BOTH" },
]

const AVAILABILITY_OPTIONS = [
  { label: "immediate", value: "IMMEDIATE" },
  { label: "1-3months", value: "ONE_TO_THREE_MONTHS" },
  { label: "3-6months", value: "THREE_TO_SIX_MONTHS" },
]

export default function CandidateProfileClientPage() {
  const { candidateProfile, setCandidateProfile } = useCandidateStore()
  const { projects, clearProjects, setProjects } = useProjectStore()
  const router = useRouter()
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [rolesearch, setRoleSearch] = useState("")
  const [skills, setSkills] = useState<{ value: string; label: string }[]>([])
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([])
  const [selectedSkills, setSelectedSkills] = useState<{ value: string; label: string }[]>([])
  const [selectedSecondarySkills, setSelectedSecondarySkills] = useState<{ value: string; label: string }[]>([])
  const [selectedRoles, setSelectedRoles] = useState<{ value: string; label: string }[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CandidateFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    status: "",
    institution: "",
    degree: "",
    graduationYear: "",
    experienceLevel: "",
    githubUrl: "",
    preferredRoles: [],
    portfolioUrl: "",
    linkedinName: "",
    jobTypePreference: "",
    isVerified: false,
    openToWork: true,
    availability: "",
    projects: [],
  })

  useEffect(() => {
    if (candidateProfile) {
      console.log(candidateProfile)
      setFormData({
        fullName: user?.name || "",
        email: user?.email || "",
        phoneNumber: candidateProfile.phoneNumber || "",
        status: candidateProfile.status || "",
        institution: candidateProfile.institution || "",
        degree: candidateProfile.degree || "",
        graduationYear: candidateProfile.graduationYear || "",
        experienceLevel: candidateProfile.experienceLevel || "",
        preferredRoles: candidateProfile.preferredRoles,
        githubUrl: candidateProfile.githubUrl || "",
        portfolioUrl: candidateProfile.portfolioUrl || "",
        linkedinName: candidateProfile.linkedinName || "",
        jobTypePreference: candidateProfile.jobTypePreference || "",
        openToWork: candidateProfile.openToWork,
        isVerified: candidateProfile.isVerified,
        availability: candidateProfile.availability || "",
        projects: candidateProfile.projects?.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description || "",
          repoUrl: p.repoUrl || "",
          liveLink: p.liveLink || "",
          language: p.language || "",
          stars: p.stars || 0,
          forks: p.forks || 0,
          githubRepoId: p.githubRepoId || 0,
          githubUpdatedAt: p.githubUpdatedAt
            ? new Date(p.githubUpdatedAt).toISOString()
            : "",

        })) || [],
      })


      // Convert string arrays to objects for MultiSelect display
      
      
    }
  }, [candidateProfile])


  const [isSaved, setIsSaved] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (formData.fullName) {
      setInitialLoad(false)
    }
  }, [formData])

  // Calculate profile completion
  const totalFields = 12
  const completedFields = [
    formData.fullName,
    formData.email,
    formData.phoneNumber,
    formData.status,
    formData.institution,
    formData.degree,
    formData.graduationYear,
    formData.experienceLevel,
    formData.jobTypePreference,
    formData.availability,
    formData.preferredRoles,
  ].filter((value) => (Array.isArray(value) ? value.length > 0 : value?.trim() !== "")).length

  const handleChange = (field: keyof CandidateFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }

  const handleAddProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { title: "", description: "", repoUrl: "", liveLink: "", language: "", stars: 0, forks: 0, githubRepoId: 0, githubUpdatedAt: "" }]
    }))
  }

  const handleProjectChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const numericFields = new Set(["stars", "forks", "githubRepoId"])
      const nextValue = numericFields.has(field) ? Number(value) : value
      const newProjects = [...prev.projects]
      newProjects[index] = { ...newProjects[index], [field]: nextValue }
      return { ...prev, projects: newProjects }
    })
  }

  useEffect(() => {
    if (projects.length > 0) {
      console.log(projects)
      setFormData(prev => {
        const existingRepoIds = new Set(prev.projects.map(p => p.githubRepoId));
        console.log("existingRepoIds: ", existingRepoIds)
        const newProjectsToAdd = projects
          .filter(p => !existingRepoIds.has(p.githubRepoId))
          .map(p => ({
            title: p.title,
            description: p.description || "",
            repoUrl: p.repoUrl || "",
            liveLink: p.liveLink || "",
            language: p.language || "",
            stars: p.stars || 0,
            forks: p.forks || 0,
            githubRepoId: p.githubRepoId,
            githubUpdatedAt: p.githubUpdatedAt ? new Date(p.githubUpdatedAt).toISOString() : ""
          }));

        console.log("prev: ", prev)

        if (newProjectsToAdd.length === 0) return prev;

        return {
          ...prev,
          projects: [...prev.projects, ...newProjectsToAdd]
        };
      });
    }
  }, [projects]);

  const handleRemoveProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!candidateProfile) return

    let finalProjects = [...formData.projects];

    try {
      setLoading(true)

      // Auto-fetch logic removed to respect user intent.
      // Users should explicitly click "Import Projects" if they want to fetch.

      const payload = {
        ...formData,
        id: candidateProfile.userId,
        name: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
        status: formData.status || null,
        institution: formData.institution.trim() || null,
        degree: formData.degree.trim() || null,
        graduationYear: formData.graduationYear.trim() || null,
        experienceLevel: formData.experienceLevel || null,
        githubUrl: formData.githubUrl.trim() || null,
        portfolioUrl: formData.portfolioUrl.trim() || null,
        linkedinName: formData.linkedinName.trim() || null,
        jobTypePreference: formData.jobTypePreference || null,
        availability: formData.availability || null,
        projects: finalProjects,
      }

      console.log(payload)
      const res = await axios.patch("/api/candidate/update_profile", payload, { withCredentials: true })
      if (res.status === 200) {
        console.log(res.data)
        const res2 = await fetch("/api/auth/me")
        const data2 = await res2.json()
        setCandidateProfile(data2.user)
        toast.success("Profile saved successfully!")
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to save profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

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

  const prevRoleSearchQueryRef = useRef("")

  useEffect(() => {
    const currentTrimmed = rolesearch.trim()
    const prevTrimmed = prevRoleSearchQueryRef.current.trim()

    if (currentTrimmed === "") {
      setRoles([])
      return
    }

    if (currentTrimmed === prevTrimmed) {
      prevRoleSearchQueryRef.current = rolesearch
      return
    }

    const timeoutId = setTimeout(async () => {
      console.log("Search:", currentTrimmed);
      prevRoleSearchQueryRef.current = rolesearch;

      try {
        setSearchLoading(true)
        const res = await axios.get(`/api/search/roles?query=${currentTrimmed}`, { withCredentials: true })
        console.log(res.data)
        setRoles(res.data.result)
      } catch (err) {
        console.log(err)
      } finally {
        setSearchLoading(false)
      }


    }, 500);

    return () => clearTimeout(timeoutId);
  }, [rolesearch]);

  const handleFetchProjects = async () => {
    if (!formData.githubUrl) return
    try {
      setLoading(true)
      const res = await axios.get(`/api/candidate/fetch_projects?githubUrl=${formData.githubUrl}`, { withCredentials: true })
      if (res.status === 200) {
        setFormData(prev => ({ ...prev, projects: res.data.result }))
        toast.success("Projects fetched successfully!")
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to fetch projects. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/candidate/dashboard" },
    { label: "Profile", href: "/candidate/profile" },
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Breadcrumbs items={breadcrumbs} />

        <PageHeader title="Candidate Profile" description="Showcase your skills and unlock matching opportunities" />

        {/* Profile Completion Card */}
        {!initialLoad ? <div className="bg-card border border-border rounded-lg p-6 mb-8 mt-8">
          <ProfileCompletionIndicator completedFields={completedFields} totalFields={totalFields} />
        </div> :
          <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-20">

          </div>}

        {/* Missing Fields Alert */}
        {!formData.isVerified && !initialLoad && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Complete your profile</p>
              <p className="text-sm text-muted-foreground">
                Fill in all sections marked with <span className="text-red-700">*</span> to apply for jobs.
              </p>
            </div>
          </div>
        )}

        {/* Success message */}
        {isSaved && (
          <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-6 flex gap-3">
            <CheckCircle className="w-5 h-5 text-success " />
            <p className="text-sm font-medium text-foreground">Profile saved successfully!</p>
          </div>
        )}

        {/* Error message */}
        {isError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm font-medium text-foreground">Failed to save profile.</p>
          </div>
        )}

        {!initialLoad ? <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Basic Information Section */}
          <FormSection title="Basic Information" description="Your personal contact details">
            <FormField
              label="Full Name"
              name="fullName"
              placeholder="Enter your full name"
              required
              value={formData.fullName || ""}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              required
              description="Your email address (read-only)"
              disabled
              value={formData.email || ""}
            />
            <FormField
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+1 (555) 987-6543"
              description="For employer contact"
              value={formData.phoneNumber || ""}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
            />
          </FormSection>

          {/* Education Section */}
          <FormSection title="Education" description="Your educational background">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" aria-required={true}>Current Status</label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)} required={true}>
                <SelectTrigger>
                  <SelectValue placeholder="Select current status" />
                </SelectTrigger>
                <SelectContent >
                  {CURRENT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormField
              label="Institution Name"
              name="institution"
              placeholder="e.g., University of California, Berkeley"
              required
              value={formData.institution || ""}
              onChange={(e) => handleChange("institution", e.target.value)}
            />
            <FormField
              label="Degree"
              name="degree"
              placeholder="e.g., Bachelor of Science in Computer Science"
              required
              value={formData.degree || ""}
              onChange={(e) => handleChange("degree", e.target.value)}
            />
            <FormField
              label="Graduation Year"
              name="graduationYear"
              type="number"
              placeholder="2024"
              required
              value={formData.graduationYear || ""}
              onChange={(e) => handleChange("graduationYear", e.target.value)}
            />
          </FormSection>

          {/* Skills & Experience Section */}
          <FormSection title="Skills & Experience" description="Your technical skills and experience level">
            

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Experience Level</label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) => handleChange("experienceLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Preferred Roles</label>
              <div className="min-h-11 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                {selectedRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedRoles.map((role) => (
                      <span
                        key={role.value}
                        className="inline-flex items-center rounded-full bg-accent/60 px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        {role.label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">submit resume to get roles</span>
                )}
              </div>
            </div>
          </FormSection>

          {/* Work Links Section */}
          <FormSection title="Work Links" description="Links to your work and professional profiles">

            <FormField
              label="GitHub URL"
              name="github"
              type="url"
              placeholder="click below to import projects from github"
              description="Link to your GitHub profile to fetch your projects"
              value={formData.githubUrl || ""}
              disabled={true}
              onChange={(e) => handleChange("githubUrl", e.target.value)}
            />
            {!formData.githubUrl &&<Button
              asChild
              variant="default"
              size="sm"
              disabled={loading}
            >
              <Link href={`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=repo`}>
                Connect github
              </Link>
            </Button>}

            <FormField
              label="Portfolio URL"
              name="portfolio"
              type="url"
              placeholder="https://yourportfolio.com"
              description="Link to your portfolio website"
              value={formData.portfolioUrl || ""}
              onChange={(e) => handleChange("portfolioUrl", e.target.value)}
            />
            <FormField
              label="LinkedIn Name"
              name="linkedin"
              type="url"
              placeholder="Click below to verify Linkedin"
              description="Verify your LinkedIn profile"
              disabled={true}
              value={formData.linkedinName || ""}
              onChange={(e) => handleChange("linkedinName", e.target.value)}
            />
            {!formData.linkedinName && (
              <Button
                asChild
                variant="default"
                size="sm"
              >
                <a href="/api/auth/linkedin">
                  Connect Linkedin
                </a>
              </Button>
            )}

            {/*<div className="space-y-2">
              <label htmlFor="resume" className="text-sm font-medium text-foreground">
                Resume (PDF only)
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-accent/30 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">{formData.resumeFile || "No file uploaded"}</p>
                <p className="text-xs text-muted-foreground">Drag and drop your PDF or click to upload</p>
              </div>
              {formData.resumeFile && <p className="text-xs text-success">✓ Resume uploaded: {formData.resumeFile}</p>}
            </div>*/}
          </FormSection>

          {/* Projects Section */}
          <FormSection title="Projects" description="Showcase your best work">
            <div className="space-y-4">
              {formData?.projects?.map((project, index) => (
                <div key={index} className="p-4 border border-border rounded-lg space-y-4 relative">


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Project Title"
                      name={`projects[${index}].title`}
                      placeholder="e.g. E-commerce Platform"
                      value={project.title}
                      onChange={(e) => handleProjectChange(index, "title", e.target.value)}
                      required
                    />
                    <FormField
                      label="Main Language/Tech Stack"
                      name={`projects[${index}].language`}
                      placeholder="e.g. React, Node.js"
                      value={project.language}
                      onChange={(e) => handleProjectChange(index, "language", e.target.value)}
                    />
                  </div>

                  <FormField
                    label="Description"
                    name={`projects[${index}].description`}
                    placeholder="Brief description of the project..."
                    value={project.description}
                    onChange={(e) => handleProjectChange(index, "description", e.target.value)}
                    as="textarea"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Repository URL"
                      name={`projects[${index}].repoUrl`}
                      placeholder="https://github.com/..."
                      value={project.repoUrl}
                      onChange={(e) => handleProjectChange(index, "repoUrl", e.target.value)}
                    />
                    <FormField
                      label="Live Demo URL"
                      name={`projects[${index}].liveLink`}
                      placeholder="https://..."
                      value={project.liveLink}
                      onChange={(e) => handleProjectChange(index, "liveLink", e.target.value)}
                    />
                  </div>
                  {project.githubRepoId !== 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Stars"
                        name={`projects[${index}].stars`}
                        placeholder="0"
                        value={project.stars}
                        onChange={(e) => handleProjectChange(index, "stars", e.target.value)}
                        disabled={true}
                      />
                      <FormField
                        label="Forks"
                        name={`projects[${index}].forks`}
                        placeholder="0"
                        value={project.forks}
                        onChange={(e) => handleProjectChange(index, "forks", e.target.value)}
                        disabled={true}
                      />
                    </div>
                  )}
                  <div className="w-full flex justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveProject(index)}
                      className="w-full"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              {formData.githubUrl?.trim() !== "" && <Button
                asChild
                variant="default"
                size="sm"
                className="w-full"
                disabled={loading}
              >
                <Link href={`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=repo`}>
                  Import Projects from GitHub
                </Link>

              </Button>}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddProject}
                className="w-full border-dashed"
              >
                + Add Project
              </Button>
            </div>
          </FormSection>

          {/* Preferences Section */}
          <FormSection title="Job Preferences" description="Your job search preferences and availability">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Job Type Preference</label>
              <Select
                value={formData.jobTypePreference}
                onValueChange={(value) => handleChange("jobTypePreference", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type preference" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between p-4 border border-border rounded-lg bg-accent/30">
              <div className="mb-2 md:mb-0">
                <p className="text-sm font-medium text-foreground">Open to Remote Work</p>
                <p className="text-xs text-muted-foreground">Toggle to show remote job preferences</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange("openToWork", !formData.openToWork)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.openToWork ? "bg-primary" : "bg-muted"
                  }`}
                role="switch"
                aria-checked={formData.openToWork}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.openToWork ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Availability</label>
              <Select value={formData.availability} onValueChange={(value) => handleChange("availability", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FormSection>

          {/* Submit Button */}
          <div className="flex justify-center md:justify-end gap-3 pt-4  border-border">
            <Button variant="outline">Cancel</Button>
            <Button className="gap-2" >
              {!loading && <Save className="w-4 h-4" />}
              {loading ? <Spinner className="w-4 h-4" /> : "Save Changes"}
            </Button>
          </div>
        </form> :
          <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 space-y-6 animate-pulse h-[70vh]"></div>}
      </div>
    </main>
  )
}
