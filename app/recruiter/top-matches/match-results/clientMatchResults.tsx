"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockMatchResults } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Target,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Briefcase,
  MapPin,
  DollarSign,
  University,
  GraduationCap,
  Star,
  MessageSquare,
  Calendar,
  IndianRupee,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import type { Job } from "@/store/jobStore";
import { ScheduleInterviewModal } from "@/components/interview/schedule-interview-modal";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
type ApplicationJob = {
  title: string;
  id: string;
};

type Candidate = {
  id: string;
  institution: string;
  experienceLevel: string;
  degree: string;

  user: {
    name: string;
    profilePic?: string;
  };
};

type application_report = {
  achievment: {
    comp_bonus: number;
    final_score: number;
    leadership: number;
    prestige: number;
    quant_bonus: number;
    relevance: number;
    semantic_impact: number;
  };
  certificates: {
    final_score: number;
  };
  experience: {
    score: number;
  };
  primary_skill: {
    coverage_score: number;
    matched: string[];
    missing_skills: string[];
  };
  projects: {
    final_score: number;
    match_score: number;
    missing: string[];
    semantic_score: number;
    skills: string[];
  };
  secondry_skill: {
    coverage_score: number;
    matched: string[];
    missing_skills: string[];
  };
};

type Resume = {
  id: string;
  resumeName: string;
  resumeUrl: string;
  resumeMimeType: string;
  resumeSize: number;
};

type Application = {
  candidate: Candidate;
  createdAt: string;
  application_report?: application_report;
  id: string;
  score: number;
  status: string;
  job: ApplicationJob;
  resume: Resume;
};

export default function MatchResultsClientPage({
  candidateId,
  jobId,
}: {
  candidateId: string;
  jobId: string;
}) {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [trigger, setTrigger] = useState(false);
  const router = useRouter();
  const [link, setLink] = useState<string>("");
  const [uniqueJob, setUniqueJob] = useState<Job>({
    id: "",
    recruiterId: "",
    title: "",
    description: "",
    location: "",
    minSalary: 0,
    maxSalary: 0,
    department: "NONE",
    jobType: "NONE",
    experienceRequired: "NONE",
    primary_skills: [],
    secondry_skill: [],
    benifits: [],
    createdAt: "",
    updatedAt: "",
    recruiter: "",
    status: "ACTIVE",
  });
  const [uniqueApplication, setUniqueApplication] = useState<Application>({
    candidate: {
      id: "",
      institution: "",
      experienceLevel: "",
      degree: "",

      user: {
        name: "",
        profilePic: "",
      },
    },
    createdAt: "",
    id: "",
    score: 0,
    status: "",
    job: {
      title: "",
      id: "",
    },
    resume: {
      id: "",
      resumeName: "",
      resumeUrl: "",
      resumeMimeType: "",
      resumeSize: 0,
    },
    application_report: {
      achievment: {
        comp_bonus: 0,
        final_score: 0,
        leadership: 0,
        prestige: 0,
        quant_bonus: 0,
        relevance: 0,
        semantic_impact: 0,
      },
      certificates: {
        final_score: 0,
      },
      experience: {
        score: 0,
      },
      primary_skill: {
        coverage_score: 0,
        matched: [],
        missing_skills: [],
      },
      projects: {
        final_score: 0,
        match_score: 0,
        semantic_score: 0,
        skills: [],
        missing: [],
      },
      secondry_skill: {
        coverage_score: 0,
        matched: [],
        missing_skills: [],
      },
    },
  });

  const toNumberValue = (value: unknown) => {
    if (value === null || value === undefined) return null;
    const parsed = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(parsed)) return null;
    return parsed;
  };

  const formatDecimal = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    if (!Number.isFinite(value)) return "-";
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2);
  };

  const toStringArray = (value: unknown) => {
    if (!Array.isArray(value)) return [];
    return value.filter(Boolean).map((item) => String(item));
  };

  const clampPercent = (value: number | null | undefined) =>
    Math.min(100, Math.max(0, value ?? 0));

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get(`/api/getjob/${jobId}`);
      const res1 = await axios.get(
        `/api/recruiter/get_applications/unique?jobId=${jobId}&candidateId=${candidateId}`,
      );
      const data = await res.data;
      setUniqueJob({ ...data.job });
      const data1 = await res1.data;
      setUniqueApplication({ ...data1.applications });

      setInitialLoad(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    if (uniqueApplication.resume.id?.trim() !== "") {
      console.log(uniqueApplication);
    }
  }, [uniqueApplication]);

  const handleAddToWaitlist = async () => {
    if (uniqueApplication.id.trim() === "") return;

    try {
      const res = await axios.post(
        `/api/recruiter/toogle_waitlist`,
        { id: uniqueApplication.id },
        { withCredentials: true },
      );
      const data = await res.data;
      setUniqueApplication((prev) => ({ ...prev, status: data.status }));
      toast.success(data?.message || "Toggled waitlist");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Form submission error:", err.response?.data?.error);
        toast.error(err.response?.data?.error || "Failed to toggle waitlist");
      } else {
        console.error("Unexpected error:", err);
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <main className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { href: "/recruiter/dashboard", label: "Recruiter" },
            { href: "/recruiter/top-matches", label: "Top Matches" },
            { label: "Match Results" },
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title="Match Analysis"
          description="AI-powered compatibility analysis between candidate and job opportunity."
        />

        {/* Overall Score Hero */}
        <section className="mt-8" aria-labelledby="score-heading">
          {!initialLoad ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                <Target className="h-4 w-4" aria-hidden="true" />
                AI Match Score
              </div>
              <h2 id="score-heading" className="sr-only">
                Overall Match Score
              </h2>
              <div className="text-7xl font-bold tracking-tight text-primary">
                {uniqueApplication.score}%
              </div>
              <p className="mt-2 text-lg text-muted-foreground">
                Excellent Match
              </p>
              <div className="mt-6 flex justify-center gap-4 flex-col md:flex-row ">
                <Button size="lg" onClick={() => setIsScheduleModalOpen(true)}>
                  <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                  Schedule Interview
                </Button>
                {(uniqueApplication.status === "WAITLIST" ||
                  uniqueApplication.status === "PENDING") && (
                  <Button
                    size="lg"
                    variant={
                      uniqueApplication.status === "WAITLIST"
                        ? "destructive"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => handleAddToWaitlist()}
                  >
                    {uniqueApplication.status !== "WAITLIST" ? (
                      <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    )}
                    {uniqueApplication.status === "WAITLIST"
                      ? "Remove from Waitlist"
                      : "Add to Waitlist"}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-muted-foreground/50 border border-border p-6 mb-8 animate-pulse h-[40vh]"></div>
          )}
        </section>

        {/* Match Details Grid */}
        {!initialLoad ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Candidate Summary */}
            <section aria-labelledby="candidate-heading">
              <h2
                id="candidate-heading"
                className="text-lg font-semibold mb-4 flex items-center gap-2"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">
                  C
                </span>
                Candidate Profile
              </h2>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 border border-border/50">
                    <AvatarImage
                      src={
                        uniqueApplication.candidate.user.profilePic
                          ? uniqueApplication.candidate.user.profilePic
                          : ""
                      }
                    />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                      {uniqueApplication.candidate.user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {uniqueApplication?.candidate.user.name}
                    </h3>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 text-sm">
                    <GraduationCap
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span>{uniqueApplication?.candidate.degree}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span>{uniqueApplication?.candidate.experienceLevel}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <University
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span>{uniqueApplication?.candidate.institution}</span>
                  </div>
                  {/*<div className="flex items-center gap-3 text-sm">
                                    <Star className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <span>{uniqueApplication?.candidate.primarySkills.length + uniqueApplication?.candidate.secondarySkills.length} Skills</span>
                                </div>*/}
                </div>

                {/* <div className="mt-6">
                                <p className="text-sm font-medium mb-2">Top Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueApplication?.candidate.primarySkills.map((skill) => (
                                        <Badge key={skill.id} variant="default">
                                            {skill.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>*/}

                {/*<div className="mt-6">
                                <p className="text-sm font-medium mb-2">Secondary Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueApplication?.candidate.secondarySkills.map((skill) => (
                                        <Badge key={skill.id} variant="secondary">
                                            {skill.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>*/}
                <div className="flex flex-col md:flex-row gap-4 justify-start items-center mt-6">
                  {uniqueApplication?.resume?.resumeMimeType ===
                    "application/pdf" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        window.open(
                          `https://docs.google.com/gview?url=${encodeURIComponent(uniqueApplication?.resume?.resumeUrl)}&embedded=true`,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }}
                      variant="default"
                      className="cursor-pointer"
                    >
                      View Resume
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      window.open(
                        uniqueApplication?.resume?.resumeUrl,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                    variant="secondary"
                    className="cursor-pointer"
                  >
                    Download Resume
                  </Button>
                </div>
              </div>
            </section>

            {/* Job Summary */}
            <section aria-labelledby="job-heading">
              <h2
                id="job-heading"
                className="text-lg font-semibold mb-4 flex items-center gap-2"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground text-xs font-bold">
                  J
                </span>
                Job Details
              </h2>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-xl font-semibold">{uniqueJob?.title}</h3>
                <p className="text-muted-foreground">{uniqueJob?.recruiter}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span>{uniqueJob?.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <IndianRupee
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span>
                      {uniqueJob?.minSalary}-{uniqueJob?.maxSalary}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span>{uniqueJob?.jobType}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueJob?.primary_skills.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
                  {uniqueJob?.description}
                </p>
              </div>
            </section>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-[40vh]"></div>

            <div className="bg-muted-foreground/50 border border-border rounded-lg p-6 mb-8 animate-pulse h-[40vh]"></div>
          </div>
        )}

        {/* Score Breakdown */}
       {uniqueApplication.score>0 ? <section className="mt-8" aria-labelledby="breakdown-heading">
          <h2 id="breakdown-heading" className="text-lg font-semibold mb-4">
            Score Breakdown
          </h2>
          {!initialLoad   ? (
            <div className="rounded-xl border border-border bg-card p-6">
              {!uniqueApplication?.application_report ? (
                <p className="text-sm text-muted-foreground">
                  No score breakdown is available for this application yet.
                </p>
              ) : (
                (() => {
                  const report = uniqueApplication.application_report;
                  const primarySkill = report.primary_skill;
                  const secondarySkill = report.secondry_skill;
                  const projects = report.projects;
                  const experience = report.experience;
                  const certificates = report.certificates;
                  const achievement = report.achievment;

                  const primaryMatched = toStringArray(primarySkill?.matched);
                  const primaryMissing = toStringArray(
                    primarySkill?.missing_skills,
                  );
                  const secondaryMatched = toStringArray(
                    secondarySkill?.matched,
                  );
                  const secondaryMissing = toStringArray(
                    secondarySkill?.missing_skills,
                  );

                  const projectSkills = toStringArray(projects?.skills);
                  const projectMissing = toStringArray(projects?.missing);

                  return (
                    <div className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-border bg-background/60 p-5">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium">
                              Primary Skills
                            </h3>
                            <Badge variant="secondary">
                              Coverage:{" "}
                              {formatDecimal(
                                toNumberValue(primarySkill?.coverage_score),
                              )}
                              %
                            </Badge>
                          </div>
                          <Progress
                            value={clampPercent(
                              toNumberValue(primarySkill?.coverage_score),
                            )}
                            className="h-2"
                            aria-label="Primary skills coverage"
                          />
                          {primaryMatched.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-medium text-muted-foreground">
                                Matched
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {primaryMatched.map((skill) => (
                                  <Badge key={skill} variant="default">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {primaryMissing.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-medium text-muted-foreground">
                                Missing
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {primaryMissing.map((skill) => (
                                  <Badge key={skill} variant="destructive">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="rounded-lg border border-border bg-background/60 p-5">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium">
                              Secondary Skills
                            </h3>
                            <Badge variant="secondary">
                              Coverage:{" "}
                              {formatDecimal(
                                toNumberValue(secondarySkill?.coverage_score),
                              )}
                              %
                            </Badge>
                          </div>
                          <Progress
                            value={clampPercent(
                              toNumberValue(secondarySkill?.coverage_score),
                            )}
                            className="h-2"
                            aria-label="Secondary skills coverage"
                          />
                          {secondaryMatched.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-medium text-muted-foreground">
                                Matched
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {secondaryMatched.map((skill) => (
                                  <Badge key={skill} variant="default">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {secondaryMissing.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-medium text-muted-foreground">
                                Missing
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {secondaryMissing.map((skill) => (
                                  <Badge key={skill} variant="destructive">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-border bg-background/60 p-5 space-y-3">
                          <h3 className="text-sm font-medium">
                            Projects Match
                          </h3>
                          <div className="text-xs text-muted-foreground">
                            Semantic:{" "}
                            {formatDecimal(
                              toNumberValue(projects?.semantic_score),
                            )}{" "}
                            | Match:{" "}
                            {formatDecimal(
                              toNumberValue(projects?.match_score),
                            )}{" "}
                            | Final:{" "}
                            {formatDecimal(
                              toNumberValue(projects?.final_score),
                            )}
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                              Skills present{" "}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {projectSkills.length > 0 ? (
                                projectSkills.map((skill) => (
                                  <Badge key={skill} variant="default">
                                    {skill}
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  No matching project skills.
                                </p>
                              )}
                            </div>
                          </div>

                          {projectMissing.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Missing
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {projectMissing.map((skill) => (
                                  <Badge key={skill} variant="destructive">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="rounded-lg border border-border bg-background/60 p-5 space-y-3">
                          <div>
                            <h3 className="text-sm font-medium">Experience</h3>
                            <p className="text-xs text-muted-foreground">
                              Score:{" "}
                              {formatDecimal(toNumberValue(experience?.score))}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">
                              Certificates
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Final Score:{" "}
                              {formatDecimal(
                                toNumberValue(certificates?.final_score),
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-border bg-background/60 p-5">
                        <h3 className="text-sm font-medium mb-3">
                          Achievements
                        </h3>
                        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                          <div>
                            Final:{" "}
                            {formatDecimal(
                              toNumberValue(achievement?.final_score),
                            )}
                          </div>
                          <div>
                            Semantic Impact:{" "}
                            {formatDecimal(
                              toNumberValue(achievement?.semantic_impact),
                            )}
                          </div>
                          <div>
                            Relevance:{" "}
                            {formatDecimal(
                              toNumberValue(achievement?.relevance),
                            )}
                          </div>
                          <div>
                            Leadership:{" "}
                            {formatDecimal(
                              toNumberValue(achievement?.leadership),
                            )}
                          </div>
                          <div>
                            Prestige:{" "}
                            {formatDecimal(
                              toNumberValue(achievement?.prestige),
                            )}
                          </div>
                          <div>
                            Comp Bonus:{" "}
                            {formatDecimal(
                              toNumberValue(achievement?.comp_bonus),
                            )}
                          </div>
                          <div>
                            Quant Bonus:{" "}
                            {formatDecimal(
                              toNumberValue(achievement?.quant_bonus),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          ) : (
            <div className="bg-muted-foreground/50 border border-border rounded-xl p-6 mb-8 animate-pulse h-[50vh]"></div>
          )}
        </section>:
        <section className="mt-8 flex items-center justify-center" aria-labelledby="breakdown-missing">
            <h2 id="breakdown-heading" className="text-lg text-yellow-300 font-semibold mb-4">
            Score Breakdown being generated
          </h2>
        </section>}

        

        {/* Actions */}

        {uniqueApplication && (
          <ScheduleInterviewModal
            open={isScheduleModalOpen}
            onOpenChange={setIsScheduleModalOpen}
            onSchedule={() => router.back()}
            selectedApplicationIds={[uniqueApplication.id]}
            applications={[
              {
                JId: [uniqueApplication.job.id],
                Jname: [uniqueApplication.job.title],
                CId: uniqueApplication.candidate.id,
                Cname: uniqueApplication.candidate.user.name,
                resumeUrl: uniqueApplication.resume.resumeUrl,
                resumeMimeType: uniqueApplication.resume.resumeMimeType,
              },
            ]}
            setTrigger={setTrigger}
            trigger={trigger}
          />
        )}
      </div>
    </main>
  );
}
