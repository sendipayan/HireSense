"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle2, Sparkles, ArrowRight, X, File } from "lucide-react"
import axios from "axios"

/**
 * Resume upload page for candidates
 * - Drag and drop file upload
 * - File validation
 * - Progress indicator
 * - Accessible form controls
 */
export default function ResumeUploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type === "application/pdf" || file.type.includes("document"))) {
      handleFileUpload(file)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [])

  useEffect(() => {
    if (isComplete) {
      console.log(uploadedFile)
    }
  }, [isComplete])

  const handleFileUpload = async (file: File) => {
    if (!file) return
    setUploadedFile(file)
    setIsUploading(true)
    setUploadProgress(0)


    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setIsComplete(true)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const removeFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    setIsUploading(false)
    setIsComplete(false)
  }

  const tips = [
    "Use a clean, professional format",
    "Include relevant keywords from job descriptions",
    "Quantify achievements with numbers",
    "Keep it concise (1-2 pages)",
    "Proofread for errors",
  ]

  return (
    <main className="py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Candidate", href: "/candidate/dashboard" }, { label: "Resume Upload" }]} />

        {/* Page Header */}
        <PageHeader
          title="Upload Your Resume"
          description="Upload your resume to get AI-powered feedback and job matching. We support PDF and Word documents."
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Upload Area */}
          <div className="lg:col-span-2">
            {!uploadedFile ? (
              <div
                className={`relative rounded-2xl border-2 border-dashed transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <label
                  htmlFor="resume-upload"
                  className="flex flex-col items-center justify-center py-16 px-6 cursor-pointer"
                >
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <Upload className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <p className="text-lg font-medium">Drag and drop your resume here</p>
                  <p className="mt-1 text-muted-foreground">or click to browse files</p>
                  <p className="mt-4 text-sm text-muted-foreground">Supports PDF, DOC, DOCX (max 10MB)</p>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="sr-only"
                    onChange={handleFileSelect}
                    aria-describedby="file-requirements"
                  />
                </label>
                <p id="file-requirements" className="sr-only">
                  Accepted file types: PDF, DOC, DOCX. Maximum file size: 10 megabytes.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-6">
                {/* File Info */}
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <File className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium truncate">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      {!isUploading && (
                        <Button variant="ghost" size="icon" onClick={removeFile} aria-label="Remove uploaded file">
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {isUploading && (
                      <div className="mt-4">
                        <Progress value={uploadProgress} className="h-2" aria-label="Upload progress" />
                        <p className="mt-2 text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
                      </div>
                    )}

                    {/* Success State */}
                    {isComplete && (
                      <div className="mt-4 flex items-center gap-2 text-success">
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                        <span className="font-medium">Upload complete!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {isComplete && (
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="flex-1">
                      <Link href="/ai-feedback">
                        <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                        Get AI Feedback
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="flex-1 bg-transparent">
                      <Link href="/match-results">
                        View Job Matches
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Previous Resumes */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Previous Uploads</h2>
              <div className="space-y-3">
                {[
                  { name: "Sarah_Chen_Resume_v3.pdf", date: "Dec 15, 2024", score: 85 },
                  { name: "Sarah_Chen_Resume_v2.pdf", date: "Nov 28, 2024", score: 78 },
                ].map((file) => (
                  <article
                    key={file.name}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{file.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium">{file.score}%</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Tips Sidebar */}
          <aside className="lg:col-span-1">
            <div className="rounded-2xl border border-border bg-card p-6 sticky top-24">
              <h2 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                Resume Tips
              </h2>
              <ul className="mt-4 space-y-3">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Need help? Check out our{" "}
                  <Link href="/about" className="text-primary hover:underline">
                    resume writing guide
                  </Link>
                  .
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
