"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Save, AlertCircle, Upload, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/form-field"
import { FormSection } from "@/components/form-section"
import { ProfileCompletionIndicator } from "@/components/profile-completion-indicator"
import { MultiSelect } from "@/components/multi-select"
import { PageHeader } from "@/components/page-header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { useCandidateStore } from "@/store/candidateStore"
import { useAuthStore } from "@/store/authStore"
import axios from "axios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

interface CandidateFormData {
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  status?: string | null;
  institution?: string | null;
  graduationYear?: string | null;
  degree?: string | null;
  primarySkills?: any;
  secondarySkills?: any;
  experienceLevel?: string | null;
  preferredRoles?: any;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  jobTypePreference?: string | null;
  openToWork: boolean;
  availability?: string | null;
};

const CURRENT_STATUS_OPTIONS = [
  { value: "NONE", label: "Select a Status" },
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
  { value: "NONE", label: "Select an Experience Level" },
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
  { value: "NONE", label: "Select a Job Type" },
  { label: "fulltime", value: "FULL_TIME" },
  { label: "internship", value: "INTERNSHIP" },
  { label: "both", value: "BOTH" },
]

const AVAILABILITY_OPTIONS = [
  { value: "NONE", label: "Select Availability" },
  { label: "immediate", value: "IMMEDIATE" },
  { label: "1-3months", value: "ONE_TO_THREE_MONTHS" },
  { label: "3-6months", value: "THREE_TO_SIX_MONTHS" },
]

export default function CandidateProfileClientPage() {
  const { candidateProfile, setCandidateProfile } = useCandidateStore()
  const { user } = useAuthStore()
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
    primarySkills: [],
    secondarySkills: [],
    experienceLevel: "",
    preferredRoles: [],
    githubUrl: "",
    portfolioUrl: "",
    linkedinUrl: "",
    jobTypePreference: "",
    openToWork: true,
    availability: "",
  })

  useEffect(() => {
    if (candidateProfile) {
      setFormData({
        fullName: user?.name,
        email: user?.email,
        phoneNumber: candidateProfile.phoneNumber,
        status: candidateProfile.status,
        institution: candidateProfile.institution,
        degree: candidateProfile.degree,
        graduationYear: candidateProfile.graduationYear,
        primarySkills: candidateProfile.primarySkills,
        secondarySkills: candidateProfile.secondarySkills,
        experienceLevel: candidateProfile.experienceLevel,
        preferredRoles: candidateProfile.preferredRoles,
        githubUrl: candidateProfile.githubUrl,
        portfolioUrl: candidateProfile.portfolioUrl,
        linkedinUrl: candidateProfile.linkedinUrl,
        jobTypePreference: candidateProfile.jobTypePreference,
        openToWork: candidateProfile.openToWork,
        availability: candidateProfile.availability,
      })
    }
  }, [candidateProfile])


  //phoneNumber,
  //status,
  //institution,
  //degree,
  //graduationYear,
  //primarySkills,
  //secondarySkills,
  //experienceLevel,
  //preferredRoles,
  //githubUrl,
  //portfolioUrl,
  //linkedinUrl,
  //jobTypePreference,
  //openToWork,
  //availability,

  const [isSaved, setIsSaved] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (formData.fullName) {
      setInitialLoad(false)
    }
  }, [formData])

  // Calculate profile completion
  const totalFields = 16
  const completedFields = Object.values(formData).filter((v) => {
    if (Array.isArray(v)) return v.length > 0
    if (typeof v === "string") return v.trim() !== ""
    return v !== null && v !== undefined
  }).length

  const handleChange = (field: keyof CandidateFormData, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!candidateProfile) return


    const payload = {
      id: candidateProfile.userId,
      name: formData.fullName,
      primarySkills: JSON.stringify(formData.primarySkills),
      secondarySkills: JSON.stringify(formData.secondarySkills),
      preferredRoles: JSON.stringify(formData.preferredRoles),
      ...formData
    }
    console.log(payload)
    try {
      setLoading(true)
      const res = await axios.patch("/api/candidate/update_profile", payload, { withCredentials: true })
      if (res.status === 200) {
        const res2 = await fetch("/api/auth/me")
        const data2 = await res2.json()
        setCandidateProfile(data2.user)
        setIsSaved(true)
        setTimeout(() => {
          setIsSaved(false)
        }, 3000)
      }
    } catch (error) {
      console.log(error)
      setIsError(true)
      setTimeout(() => {
        setIsError(false)
      }, 3000)
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
        {!initialLoad ? <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <ProfileCompletionIndicator completedFields={completedFields} totalFields={totalFields} />
        </div> :
          <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-20">

          </div>}

        {/* Missing Fields Alert */}
        {completedFields < totalFields && !initialLoad && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Complete your profile</p>
              <p className="text-sm text-muted-foreground">
                Fill in all sections to get better job matches and recommendations.
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
              <label className="text-sm font-medium text-foreground">Current Status</label>
              <Select value={formData.status || "NONE"} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select current status" />
                </SelectTrigger>
                <SelectContent>
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
              value={formData.institution || ""}
              onChange={(e) => handleChange("institution", e.target.value)}
            />
            <FormField
              label="Degree"
              name="degree"
              placeholder="e.g., Bachelor of Science in Computer Science"
              value={formData.degree || ""}
              onChange={(e) => handleChange("degree", e.target.value)}
            />
            <FormField
              label="Graduation Year"
              name="graduationYear"
              type="number"
              placeholder="2024"
              value={formData.graduationYear || ""}
              onChange={(e) => handleChange("graduationYear", e.target.value)}
            />
          </FormSection>

          {/* Skills & Experience Section */}
          <FormSection title="Skills & Experience" description="Your technical skills and experience level">
            <MultiSelect
              label="Primary Skills"
              name="primarySkills"
              options={SKILLS_OPTIONS}
              selected={formData.primarySkills || []}
              onChange={(selected) => handleChange("primarySkills", selected)}
              placeholder="Select your primary skills"
              required
            />

            <MultiSelect
              label="Secondary Skills"
              name="secondarySkills"
              options={SKILLS_OPTIONS}
              selected={formData.secondarySkills || []}
              onChange={(selected) => handleChange("secondarySkills", selected)}
              placeholder="Select additional skills"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Experience Level</label>
              <Select
                value={formData.experienceLevel || "NONE"}
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

            <MultiSelect
              label="Preferred Roles"
              name="preferredRoles"
              options={PREFERRED_ROLES_OPTIONS}
              selected={formData.preferredRoles || []}
              onChange={(selected) => handleChange("preferredRoles", selected)}
              placeholder="Select roles you're interested in"
              required
            />
          </FormSection>

          {/* Work Links Section */}
          <FormSection title="Work Links" description="Links to your work and professional profiles">
            <FormField
              label="GitHub URL"
              name="github"
              type="url"
              placeholder="https://github.com/yourname"
              description="Link to your GitHub profile"
              value={formData.githubUrl || ""}
              onChange={(e) => handleChange("githubUrl", e.target.value)}
            />
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
              label="LinkedIn URL"
              name="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/yourname"
              description="Link to your LinkedIn profile"
              value={formData.linkedinUrl || ""}
              onChange={(e) => handleChange("linkedinUrl", e.target.value)}
            />

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

          {/* Preferences Section */}
          <FormSection title="Job Preferences" description="Your job search preferences and availability">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Job Type Preference</label>
              <Select
                value={formData.jobTypePreference || "NONE"}
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

            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-accent/30">
              <div>
                <p className="text-sm font-medium text-foreground">Open to Remote Work</p>
                <p className="text-xs text-muted-foreground">Toggle to show remote job preferences</p>
              </div>
              <button
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
              <Select value={formData.availability || "NONE"} onValueChange={(value) => handleChange("availability", value)}>
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
          <div className="flex justify-end gap-3 pt-4  border-border">
            <Button variant="outline">Cancel</Button>
            <Button className="gap-2">
              {!loading && <Save className="w-4 h-4" />}
              {loading ? <Spinner className="w-4 h-4" /> : "Save Changes"}
            </Button>
          </div>
        </form> :
          <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 space-y-6 animate-pulse h-[50vh]"></div>}
      </div>
    </main>
  )
}
