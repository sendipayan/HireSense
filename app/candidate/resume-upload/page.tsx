"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle2, Sparkles, ArrowRight, X, File as FileIcon } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

interface Resume {
  id: string;
  resumeName: string;
  resumeScore: number;
  createdAt: Date;
  isActive: boolean;
  resumeUrl: string;
}

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
  const [trigger, setTrigger] = useState(false)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [resumeId, setResumeId] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    console.log("running")
    const getResumes = async () => {
      try {
        const res = await axios.get("/api/candidate/get_resumes", { withCredentials: true })
        const data = res.data
        if (res.status === 200) {
          setResumes(data.resumes)
        }
      } catch (error) {
        console.error("Error fetching resumes:", error)
        toast.error("Failed to load resumes")
      }
    }
    getResumes()
  }, [isComplete])

  useEffect(() => {
    if (resumes.length > 0) {
      console.log(resumes)
    }
  }, [resumes])

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
    if (!file) {
      toast.error("Please select a file")
      return
    }
    // Upgraded limit to 5MB to match backend capability and standard practices
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return
    }

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return
    }

    setUploadedFile(file)
    setIsUploading(true)
    setUploadProgress(0)

    let safeFile: File;
    try {
      const buf = await file.arrayBuffer(); // forces provider to deliver bytes
      safeFile = new File([buf], file.name, {
        type: file.type || "application/pdf",
      });
    } catch (err) {
      toast.error("This file provider blocked access. Please download the PDF locally first.");
      setUploadProgress(0);
      setIsUploading(false);
      setUploadedFile(null);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", safeFile);

      const res = await axios.post("/api/candidate/upload_resume", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // Cap visual progress at 90% so user knows we are still processing/verifying even after bits are sent
            setUploadProgress(Math.min(percent, 90));
          }
        },
      });

      if (res.status === 200) {
        setResumeId(res.data.id);
        setUploadProgress(100);
        setTrigger(!trigger);
        setIsComplete(true);
        setIsUploading(false);
        toast.success("Resume uploaded successfully!");
      }

    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to upload resume.");
      setUploadProgress(0);
      setIsUploading(false);
    }
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
                  <p className="mt-4 text-sm text-muted-foreground">Supports PDF (max 5MB)</p>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    className="sr-only"
                    onChange={handleFileSelect}
                    aria-describedby="file-requirements"
                  />
                </label>
                <p id="file-requirements" className="sr-only">
                  Accepted file types: PDF. Maximum file size: 5 megabytes.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-6">
                {/* File Info */}
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <FileIcon className="h-6 w-6 text-primary" aria-hidden="true" />
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
                      <Link href={`/candidate/ai-feedback/${resumeId}`}>
                        <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                        Get AI Feedback
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Previous Resumes */}
            {resumes.length > 0 && <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Previous Uploads</h2>
              <div className="space-y-3">
                {resumes?.map((file) => (
                  <article
                    key={file.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                    onClick={() => { router.push(`/candidate/ai-feedback/${file.id}`) }}
                  >
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate"><strong className="text-primary">{file.isActive ? "Primary: " : ""}</strong>{file.resumeName}</p>
                      <p className="text-sm text-muted-foreground">{new Date(file.createdAt).toISOString().split("T")[0]}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium">{file.resumeScore}%</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>}
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
