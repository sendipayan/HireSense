"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Save, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/form-field"
import { FormSection } from "@/components/form-section"
import { ProfileCompletionIndicator } from "@/components/profile-completion-indicator"
import { MultiSelect } from "@/components/multi-select"
import { VerificationBadge } from "@/components/verification-badge"
import { PageHeader } from "@/components/page-header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRecruiterStore } from "@/store/RecuiterStore"
import { useAuthStore } from "@/store/authStore"

interface RecruiterFormData {
  fullName?: string | null;
  email?: string | null;
  jobTitle?: string | null;
  phoneNumber?: string | null;
  companyName?: string | null;
  companyWebsite?: string | null;
  companyLinkedIn?: string | null;
  industry?: string | null;
  companySize?: string | null;
  hiringForRoles?: any;
  isVerified?: boolean | null;
}

const INDUSTRY_OPTIONS = [
  { value: "none", label: "Select Industry" },
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
]

const COMPANY_SIZE_OPTIONS = [
  { value: "none", label: "Select Company Size" },
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "200+", label: "200+ employees" },
]

const HIRING_ROLES = [
  { value: "engineer", label: "Software Engineer" },
  { value: "designer", label: "Product Designer" },
  { value: "manager", label: "Product Manager" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Customer Support" },
  { value: "operations", label: "Operations" },
]

export function RecruiterProfileClientPage() {

  const { RecuiterProfile } = useRecruiterStore()
  const { user } = useAuthStore()

  const [formData, setFormData] = useState<RecruiterFormData>({
    fullName: "",
    email: "",
    jobTitle: "",
    phoneNumber: "",
    companyName: "",
    companyWebsite: "",
    companyLinkedIn: "",
    industry: "",
    companySize: "",
    hiringForRoles: [],
    isVerified: false,
  })

  useEffect(() => {
    if (RecuiterProfile) {
      setFormData({
        fullName: user?.name,
        email: user?.email,
        jobTitle: RecuiterProfile?.jobTitle,
        phoneNumber: RecuiterProfile?.phoneNumber,
        companyName: RecuiterProfile?.companyName,
        companyWebsite: RecuiterProfile?.companyWebsite,
        companyLinkedIn: RecuiterProfile?.companyLinkedIn,
        industry: RecuiterProfile?.industry,
        companySize: RecuiterProfile?.companySize,
        hiringForRoles: RecuiterProfile?.hiringForRoles,
        isVerified: RecuiterProfile?.isVerified,
      })
    }
  }, [RecuiterProfile])




  const [isSaved, setIsSaved] = useState(false)

  // Calculate profile completion
  const totalFields = 11
  const completedFields = Object.values(formData).filter((v) => {
    if (Array.isArray(v)) return v.length > 0
    if (typeof v === "string") return v.trim() !== ""
    return v !== null && v !== undefined
  }).length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock save
    console.log(formData)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/recruiter/dashboard" },
    { label: "Profile", href: "/recruiter/profile" },
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Breadcrumbs items={breadcrumbs} />

        <PageHeader title="Recruiter Profile" description="Establish your company legitimacy and hiring intent" />

        {/* Profile Completion Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <ProfileCompletionIndicator completedFields={completedFields} totalFields={totalFields} />
        </div>

        {/* Warning for unverified actions */}
        {completedFields < totalFields && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Complete your profile</p>
              <p className="text-sm text-muted-foreground">
                Complete all fields to unlock full hiring capabilities and establish company credibility.
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
          <FormSection title="Basic Information" description="Your personal details as a recruiter">
            <FormField
              label="Full Name"
              name="fullName"
              placeholder="Enter your full name"
              required
              value={formData?.fullName || ""}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <FormField
              label="Work Email"
              name="email"
              type="email"
              placeholder="your.email@company.com"
              required
              description="Your company email address (read-only)"
              disabled
              value={formData?.email || ""}
            />
            <FormField
              label="Job Title"
              name="jobTitle"
              placeholder="e.g., HR Manager, Talent Partner, Recruiter"
              required
              value={formData?.jobTitle || ""}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            />
            <FormField
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              description="Optional: For candidate communication"
              value={formData?.phoneNumber || ""}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </FormSection>

          {/* Company Information Section */}
          <FormSection title="Company Information" description="Details about your organization">
            <FormField
              label="Company Name"
              name="companyName"
              placeholder="Enter your company name"
              required
              value={formData?.companyName || ""}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
            <FormField
              label="Company Website"
              name="companyWebsite"
              type="url"
              placeholder="https://company.com"
              required
              value={formData?.companyWebsite || ""}
              onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
            />
            <FormField
              label="Company LinkedIn URL"
              name="companyLinkedIn"
              type="url"
              placeholder="https://linkedin.com/company/yourcompany"
              description="Link to your company's LinkedIn page"
              value={formData?.companyLinkedIn || ""}
              onChange={(e) => setFormData({ ...formData, companyLinkedIn: e.target.value })}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Industry</label>
              <Select value={formData?.industry || "none"} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Company Size</label>
              <Select value={formData?.companySize || "none"} onValueChange={(value) => setFormData({ ...formData, companySize: value })} >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FormSection>

          {/* Hiring Context Section */}
          <FormSection title="Hiring Context" description="Information about your current hiring needs">
            <MultiSelect
              label="Hiring For Roles"
              name="hiringRoles"
              options={HIRING_ROLES}
              selected={formData?.hiringForRoles || []}
              onChange={(selected) => setFormData({ ...formData, hiringForRoles: selected })}
              placeholder="Select roles you're hiring for"
              required
            />

            {/*<div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Hiring Type</label>
              <Select value={formData?.hiringType || ""} onValueChange={(value) => setFormData({ ...formData, hiringType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HIRING_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>*/}
          </FormSection>

          {/* Verification Status Section */}
          <FormSection title="Verification Status" description="Current verification state of your profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VerificationBadge status={formData?.isVerified ? "verified" : "pending"} label="Account Verified" />
              <VerificationBadge status={formData?.isVerified ? "verified" : "pending"} label="Company Domain Match" />
              <VerificationBadge status={formData?.isVerified ? "verified" : "pending"} label="Manual Review" />
            </div>
          </FormSection>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4  border-border">
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
