"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
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
import axios from "axios"
import { Spinner } from "@/components/ui/spinner"
import toast from "react-hot-toast"

type verificationStatus = "PENDING" | "APPROVED" | "REJECTED";
type CompanySize = "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE";

type approve = "verified" | "pending" | "rejected"

interface RecruiterFormData {
  fullName: string;
  email: string;
  jobTitle: string;
  phoneNumber: string;
  companyName: string;
  companyWebsite: string;
  companyLinkedIn: string;
  industry: string;
  companySize: CompanySize | "";
  isVerified?: verificationStatus | null;
}

const INDUSTRY_OPTIONS = [
  
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
]

const COMPANY_SIZE_OPTIONS = [
  
  { value: "SMALL", label: "Small" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LARGE", label: "Large" },
  { value: "ENTERPRISE", label: "Enterprise" },
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

  const { RecuiterProfile, setRecuiterProfile } = useRecruiterStore()
  const { user } = useAuthStore()
  const [rolesearch, setRoleSearch] = useState("")
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([])
  const [selectedRoles, setSelectedRoles] = useState<{ value: string; label: string }[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [loading, setLoading] = useState(false)

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
    isVerified: "PENDING",
  })
  const [approve, setApprove] = useState<approve>("pending")

  const normalizeOptional = (value: string) => {
    const trimmed = value.trim()
    return trimmed === "" ? null : trimmed
  }


  useEffect(() => {
    if (RecuiterProfile) {
      setFormData({
        fullName: user?.name || "",
        email: user?.email || "",
        jobTitle: RecuiterProfile?.jobTitle || "",
        phoneNumber: RecuiterProfile?.phoneNumber || "",
        companyName: RecuiterProfile?.companyName || "",
        companyWebsite: RecuiterProfile?.companyWebsite || "",
        companyLinkedIn: RecuiterProfile?.companyLinkedIn || "",
        industry: RecuiterProfile?.industry || "",
        companySize: RecuiterProfile?.companySize || "",
        isVerified: RecuiterProfile?.isVerified,
      })
      if (RecuiterProfile.isVerified === "APPROVED") {
        setApprove("verified")
      }
      else if (RecuiterProfile.isVerified === "REJECTED") {
        setApprove("rejected")
      }
      else {
        setApprove("pending")
      }

      // Convert string arrays to objects for MultiSelect display
      
    }
  }, [RecuiterProfile])

  useEffect(() => {
    if (formData.fullName) {
      setInitialLoad(false)
    }
  }, [formData])




  const [isSaved, setIsSaved] = useState(false)
  const [isError, setIsError] = useState(false)

  // Calculate profile completion
  const totalFields = 9
  const completedFields = [
    formData.fullName,
    formData.email,
    formData.jobTitle,
    formData.phoneNumber,
    formData.companyName,
    formData.companyWebsite,
    formData.companyLinkedIn,
    formData.industry,
    formData.companySize,
  ].filter((value) => value.trim() !== "").length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Mock save

    if (!RecuiterProfile) {
      return
    }
    const emailValue = user?.email || formData.email
    const payload = {
      id: RecuiterProfile.userId,
      name: formData.fullName.trim(),
      email: emailValue,
      phoneNumber: normalizeOptional(formData.phoneNumber),
      jobTitle: normalizeOptional(formData.jobTitle),
      companyName: normalizeOptional(formData.companyName),
      companyWebsite: normalizeOptional(formData.companyWebsite),
      companyLinkedIn: normalizeOptional(formData.companyLinkedIn),
      industry: normalizeOptional(formData.industry),
      companySize: formData.companySize === "" ? null : formData.companySize,
    }
    console.log(payload)

    try {
      setLoading(true)
      const res = await axios.patch("/api/recruiter/update_profile", payload, { withCredentials: true })
      if (res.status === 200) {
        const res2 = await fetch("/api/auth/me")
        const data2 = await res2.json()
        console.log(data2)
        setRecuiterProfile(data2.user)
        toast.success("Profile updated successfully!")
      }
    } catch (err) {
      console.log(err)
      toast.error("Failed to update profile. Please try again.")
    }

    finally { 
      setLoading(false)
    }
  }

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
        {!initialLoad ? <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <ProfileCompletionIndicator completedFields={completedFields} totalFields={totalFields} />
        </div> :
          <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-20">

          </div>}

        {/* Warning for unverified actions */}
        {completedFields < totalFields && !initialLoad && (
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

        {/* Error message */}
        {isError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm font-medium text-foreground">Failed to save profile.</p>
          </div>
        )}

        {!initialLoad ? <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
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
              <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
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
              <Select value={formData.companySize} onValueChange={(value) => setFormData({ ...formData, companySize: value as CompanySize | "" })} >
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
          {/*<FormSection title="Hiring Context" description="Information about your current hiring needs">
            <MultiSelect
              label="Hiring For Roles"
              name="hiringRoles"
              options={roles}
              selected={selectedRoles}
              onChange={(selected) => {
                setSelectedRoles(selected)
                setFormData({ ...formData, hiringForRoles: selected.map(r => r.value) })
              }}
              placeholder="Select roles you're hiring for"
              query={rolesearch}
              setQuery={setRoleSearch}
              loading={searchLoading}
              required
            />

            <div className="space-y-2">
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
            </div>
          </FormSection>*/}

          {/* Verification Status Section */}
          <FormSection title="Verification Status" description="Current verification state of your profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VerificationBadge status={approve} label="Account Verification" />
              <VerificationBadge status={approve} label="Company Domain Match" />
              <VerificationBadge status={approve} label="Manual Review" />
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
          <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-[50vh]">

          </div>}
      </div>
    </main>
  )
}
