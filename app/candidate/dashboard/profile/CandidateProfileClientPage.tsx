"use client"

import type React from "react"

import { useState } from "react"
import { Save, AlertCircle, Upload, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/form-field"
import { FormSection } from "@/components/form-section"
import { ProfileCompletionIndicator } from "@/components/profile-completion-indicator"
import { MultiSelect } from "@/components/multi-select"
import { PageHeader } from "@/components/page-header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CandidateFormData {
  // Basic Information
  fullName: string
  email: string
  phone: string

  // Education
  currentStatus: string
  institution: string
  degree: string
  graduationYear: string

  // Skills & Experience
  primarySkills: string[]
  secondarySkills: string[]
  experienceLevel: string
  preferredRoles: string[]

  // Work Links
  github: string
  portfolio: string
  linkedin: string
  resumeFile: string

  // Preferences
  jobTypePreference: string
  openToRemote: boolean
  availability: string
}

const CURRENT_STATUS_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "graduate", label: "Graduate" },
  { value: "working", label: "Working Professional" },
]

const SKILLS_OPTIONS = [
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
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
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
  { value: "fulltime", label: "Full-Time" },
  { value: "internship", label: "Internship" },
  { value: "both", label: "Both" },
]

const AVAILABILITY_OPTIONS = [
  { value: "immediate", label: "Immediate" },
  { value: "1-3months", label: "1-3 months" },
  { value: "3-6months", label: "3-6 months" },
]

export default function CandidateProfileClientPage() {
  const [formData, setFormData] = useState<CandidateFormData>({
    fullName: "Alex Chen",
    email: "alex@example.com",
    phone: "+1 (555) 987-6543",
    currentStatus: "working",
    institution: "University of California, Berkeley",
    degree: "Bachelor of Science in Computer Science",
    graduationYear: "2020",
    primarySkills: ["react", "typescript", "nodejs"],
    secondarySkills: ["python", "aws"],
    experienceLevel: "advanced",
    preferredRoles: ["fullstack", "frontend"],
    github: "https://github.com/alexchen",
    portfolio: "https://alexchen.dev",
    linkedin: "https://linkedin.com/in/alexchen",
    resumeFile: "alex-chen-resume.pdf",
    jobTypePreference: "fulltime",
    openToRemote: true,
    availability: "immediate",
  })

  const [isSaved, setIsSaved] = useState(false)

  // Calculate profile completion
  const totalFields = 16
  const completedFields = Object.values(formData).filter((value) => {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === "boolean") return value === true
    return value.trim().length > 0
  }).length

  const handleChange = (field: keyof CandidateFormData, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock save
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
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
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <ProfileCompletionIndicator completedFields={completedFields} totalFields={totalFields} />
        </div>

        {/* Missing Fields Alert */}
        {completedFields < totalFields && (
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
            <CheckCircle className="w-5 h-5 text-success" />
            <p className="text-sm font-medium text-foreground">Profile saved successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Basic Information Section */}
          <FormSection title="Basic Information" description="Your personal contact details">
            <FormField
              label="Full Name"
              name="fullName"
              placeholder="Enter your full name"
              required
              value={formData.fullName}
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
              value={formData.email}
            />
            <FormField
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+1 (555) 987-6543"
              description="For employer contact"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </FormSection>

          {/* Education Section */}
          <FormSection title="Education" description="Your educational background">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Current Status</label>
              <Select value={formData.currentStatus} onValueChange={(value) => handleChange("currentStatus", value)}>
                <SelectTrigger>
                  <SelectValue />
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
              value={formData.institution}
              onChange={(e) => handleChange("institution", e.target.value)}
            />
            <FormField
              label="Degree"
              name="degree"
              placeholder="e.g., Bachelor of Science in Computer Science"
              value={formData.degree}
              onChange={(e) => handleChange("degree", e.target.value)}
            />
            <FormField
              label="Graduation Year"
              name="graduationYear"
              type="number"
              placeholder="2024"
              value={formData.graduationYear}
              onChange={(e) => handleChange("graduationYear", e.target.value)}
            />
          </FormSection>

          {/* Skills & Experience Section */}
          <FormSection title="Skills & Experience" description="Your technical skills and experience level">
            <MultiSelect
              label="Primary Skills"
              name="primarySkills"
              options={SKILLS_OPTIONS}
              selected={formData.primarySkills}
              onChange={(selected) => handleChange("primarySkills", selected)}
              placeholder="Select your primary skills"
              required
            />

            <MultiSelect
              label="Secondary Skills"
              name="secondarySkills"
              options={SKILLS_OPTIONS}
              selected={formData.secondarySkills}
              onChange={(selected) => handleChange("secondarySkills", selected)}
              placeholder="Select additional skills"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Experience Level</label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) => handleChange("experienceLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue />
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
              selected={formData.preferredRoles}
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
              value={formData.github}
              onChange={(e) => handleChange("github", e.target.value)}
            />
            <FormField
              label="Portfolio URL"
              name="portfolio"
              type="url"
              placeholder="https://yourportfolio.com"
              description="Link to your portfolio website"
              value={formData.portfolio}
              onChange={(e) => handleChange("portfolio", e.target.value)}
            />
            <FormField
              label="LinkedIn URL"
              name="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/yourname"
              description="Link to your LinkedIn profile"
              value={formData.linkedin}
              onChange={(e) => handleChange("linkedin", e.target.value)}
            />

            <div className="space-y-2">
              <label htmlFor="resume" className="text-sm font-medium text-foreground">
                Resume (PDF only)
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-accent/30 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">{formData.resumeFile || "No file uploaded"}</p>
                <p className="text-xs text-muted-foreground">Drag and drop your PDF or click to upload</p>
              </div>
              {formData.resumeFile && <p className="text-xs text-success">✓ Resume uploaded: {formData.resumeFile}</p>}
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
                  <SelectValue />
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
                onClick={() => handleChange("openToRemote", !formData.openToRemote)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.openToRemote ? "bg-primary" : "bg-muted"
                  }`}
                role="switch"
                aria-checked={formData.openToRemote}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.openToRemote ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Availability</label>
              <Select value={formData.availability} onValueChange={(value) => handleChange("availability", value)}>
                <SelectTrigger>
                  <SelectValue />
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
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline">Cancel</Button>
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
