"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Download,
  RefreshCw,
  Tag,
  Trash2,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useResumeFeedbackStore } from "@/store/resumeFeedbackStore";

export default function AIFeedbackClientPage({
  resumeId,
}: {
  resumeId: string;
}) {
  const router = useRouter();
  const setResumeFeedback = useResumeFeedbackStore((state) => state.setResume);
  const { resume, setResumeAts, setResumeRecommendations,clearResume } =
    useResumeFeedbackStore();
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [viewurl, setViewurl] = useState("");
  const [selectedRecId, setSelectedRecId] = useState("");
  const [showResume, setShowResume] = useState(true);
  const [feedloading,setFeedloading]=useState(false)
  const [isFeedbackPending, setIsFeedbackPending] = useState(false);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (resumeId.trim() === "") return;
    const getResume = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/candidate/get_resumes/${resumeId}`,
        );
        console.log(response.data);
        if (response.status === 200) {
          const resumePayload = response.data.resume ?? response.data.resumes;
          if (resumePayload) {
            setResumeFeedback(resumePayload);
            console.log(resumePayload.resumeUrl);
          }
        }
      } catch (err) {
        console.log(err);
        toast.error("Failed to load resume");
      } finally {
        setLoading(false);
      }
    };

    //    const getText = async () => {
    //      try {
    //    //    setLoading(true);
    //    //    const response = await axios.post(`/api/candidate/extract_text`, {
    //    //      resumeId,
    //    //    });
    //    //    console.log(response.data);
    //    //    if (response.status === 200) {
    //    //      console.log(response.data.text);
    //    //    }
    //      } catch (err) {
    //    //    console.log(err);
    //    //    toast.error("Failed to extract text");
    //      } finally {
    //    //    setLoading(false);
    //      }
    //    };

    //getText();
    getResume();
  }, [resumeId, trigger]);

  useEffect(() => {
    if (resume?.resumeUrl) {
      if (resume.resumeMimeType === "application/pdf") {
        const viewerUrl =
          "https://docs.google.com/gview?url=" +
          encodeURIComponent(resume.resumeUrl) +
          "&embedded=true";
        setViewurl(viewerUrl);
      }
    }
  }, [resume]);
  const recommendations = resume?.resume_recommendations ?? [];

  const getRecommendationKey = (rec: any, index: number) =>
    String(rec?.id ?? rec?.Title ?? rec?.title ?? index);

  useEffect(() => {
    if (!recommendations.length) {
      setSelectedRecId("");
      return;
    }
    setSelectedRecId((current) =>
      recommendations.some(
        (rec, index) => getRecommendationKey(rec, index) === current,
      )
        ? current
        : getRecommendationKey(recommendations[0], 0),
    );
  }, [recommendations]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    return "Needs Work";
  };

  const toScore = (value?: number | string | null) => {
    if (value === null || value === undefined) return null;
    const parsed = typeof value === "string" ? Number(value) : value;
    if (!Number.isFinite(parsed)) return null;
    return parsed;
  };

  const toNumberValue = (value: unknown) => {
    if (value === null || value === undefined) return null;
    const parsed = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(parsed)) return null;
    return parsed;
  };

  const formatDecimal = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return "-";
    const parsed = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(parsed)) return "-";
    if (Number.isInteger(parsed)) return String(parsed);
    return parsed.toFixed(2);
  };

  const toStringArray = (value: unknown) => {
    if (!Array.isArray(value)) return [];
    return value.filter(Boolean).map((item) => String(item));
  };

  const getFeedback = async () => {
    try {
      if (!resume) return;

      setFeedloading(true)
      setIsFeedbackPending(false);
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      feedbackTimeoutRef.current = setTimeout(() => {
        setIsFeedbackPending(true);
      }, 8000);

      const res = await axios.post(
        "https://53jljxuloivay4q5n3pizi274m0deskh.lambda-url.eu-north-1.on.aws/feedback",
        { resume_url: resume.resumeUrl },
      );
      if (res.status === 200) {
        toast.success("Feedback fetched");
        console.log(res.data);
        setResumeAts(res.data.ats);
        setResumeRecommendations(res.data.recommendations);
        try {
          const payload = {
            ats: res.data.ats,
            recomendation: res.data.recommendations,
            resume_id: resumeId,
          };
          const resp = await axios.post(
            "/api/candidate/set_feedback",
            payload,
            { withCredentials: true },
          );
          if (resp.status === 200) toast.success("Feedback saved");
          else toast.error("Failed to save feedback");
        } catch (err) {
          toast.error("Failed to save feedback");
          console.log(err);
        }
      }
    } catch (err: any) {
      toast.error("Failed to fetch feedback");
      console.log(err);
    } finally {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }
      setIsFeedbackPending(false);
      setFeedloading(false)
    }
  };

  const ats = resume?.resume_ats ?? null;

  const hasAts = Boolean(ats);
  const hasRecommendations = recommendations.length > 0;
  const showGenerateFeedback =
    Boolean(resume) && (!hasAts || !hasRecommendations);
  useEffect(() => {
    setShowResume(showGenerateFeedback);
  }, [showGenerateFeedback]);

  const resumeScore = resume?.resume_ats?.ATS_score || 0;

  const atsScores = [
    { label: "ATS Score", value: toScore(ats?.ATS_score) },
    { label: "Section Score", value: toScore(ats?.section_score) },
    { label: "Contact Score", value: toScore(ats?.contact_score) },
    { label: "Formatting Score", value: toScore(ats?.formating_score) },
  ];

  const primaryResume = async () => {
    if (resumeId.trim() === "") return;
    if (resume?.isActive) return;
    try {
      setLoading(true);
      const response = await axios.post(`/api/candidate/set_resume`, {
        id: resumeId,
      });
      console.log(response.data);
      if (response.status === 200) {
        setTrigger(!trigger);
        toast.success("Resume set as primary successfully");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to set resume as primary");
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async () => {
    if (resumeId.trim() === "") return;
    try {
      setLoading(true);
      const response = await axios.delete(
        `/api/candidate/delete_resume/${resumeId}`,
      );
      console.log(response.data);
      if (response.status === 200) {
        clearResume()
        router.back();
        toast.success("Resume deleted successfully");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Candidate", href: "/candidate/dashboard" },
            { label: "AI Feedback", href: "/candidate/ai-feedback" },
            {
              label: resume?.resumeName || "",
              href: `/candidate/ai-feedback/${resumeId}`,
            },
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title="AI Resume Feedback"
          description="Detailed analysis of your resume with actionable suggestions to improve your chances."
        >
          {resume?.resumeMimeType === "application/pdf" && (
            <Button
              variant="outline"
              className="bg-transparent cursor-pointer"
              onClick={() =>
                window.open(viewurl, "_blank", "noopener,noreferrer")
              }
              disabled={!viewurl}
            >
              <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
              View Resume
            </Button>
          )}
          {resume && (
            <Button
              variant="outline"
              className="bg-transparent cursor-pointer"
              onClick={() =>
                window.open(resume?.resumeUrl, "_blank", "noopener,noreferrer")
              }
              disabled={!resume?.resumeUrl}
            >
              <Link
                href={resume.resumeUrl}
                download={resume.resumeName}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Download Resume
              </Link>
            </Button>
          )}
        </PageHeader>

        {showResume ? (
          <section className="mt-8">
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <h2 className="text-lg font-semibold">Generate Feedback</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Feedback hasn't been generated for this resume yet.
              </p>
              <Button className="mt-6 mb-4 cursor-pointer" onClick={getFeedback} disabled={feedloading}>
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                {feedloading?"Generating feedback...":"Generate feedback"}
              </Button>
              {isFeedbackPending &&<p className="mt-2 text-sm text-warning">
                Waking server from sleep this may take 30 sec or more...
              </p>}
            </div>
            
          </section>
        ) : (
          <>
            {/* Resume Score */}
            <section className="mt-8" aria-labelledby="resume-score-heading">
              <div className="rounded-2xl border border-border bg-card p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                      <span
                        className={`text-2xl font-bold ${getScoreColor(
                          resumeScore,
                        )}`}
                      >
                        {formatDecimal(resumeScore)}
                      </span>
                    </div>
                    <div>
                      <h2
                        id="resume-score-heading"
                        className="text-lg font-semibold"
                      >
                        Resume Score
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {resume
                          ? `Score status: ${getScoreLabel(resumeScore)}`
                          : "Loading resume score..."}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {resume ? getScoreLabel(resumeScore) : "No score yet"}
                  </Badge>
                </div>
              </div>
            </section>

            {/* ATS Overview */}
            <section className="mt-8" aria-labelledby="ats-heading">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="ats-heading"
                  className="text-lg font-semibold flex items-center gap-2"
                >
                  <FileText
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                  Resume ATS Overview
                </h2>
              </div>
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {atsScores.map((score) => (
                    <div
                      key={score.label}
                      className="rounded-xl border border-border bg-card p-5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{score.label}</h3>
                        <span
                          className={`text-lg font-semibold ${getScoreColor(
                            score.value ?? 0,
                          )}`}
                        >
                          {formatDecimal(score.value)}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(100, Math.max(0, score.value ?? 0))}
                        className="h-2"
                        aria-label={`${score.label} score`}
                      />
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <AlertCircle
                      className="h-4 w-4 text-warning"
                      aria-hidden="true"
                    />
                    Issues Found
                  </h3>
                  {ats?.issues?.length ? (
                    <ul className="space-y-2">
                      {ats.issues.map((issue) => (
                        <li
                          key={issue}
                          className="text-sm text-muted-foreground"
                        >
                          {issue}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No issues flagged for this resume yet.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Recommendations */}
            <section className="mt-8" aria-labelledby="recommendations-heading">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="recommendations-heading"
                  className="text-lg font-semibold flex items-center gap-2"
                >
                  <Lightbulb
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                  Resume Recommendations
                </h2>
                <Badge variant="secondary">
                  {recommendations.length} result
                  {recommendations.length === 1 ? "" : "s"}
                </Badge>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Select Recommendation
                  </label>
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={selectedRecId}
                    onChange={(event) => setSelectedRecId(event.target.value)}
                  >
                    {recommendations.map((rec, index) => (
                      <option
                        key={getRecommendationKey(rec, index)}
                        value={getRecommendationKey(rec, index)}
                      >
                        {(rec.Title ||

                          `Recommendation ${index + 1}`) +
                          ` (Score: ${formatDecimal(rec.score)})`}
                      </option>
                    ))}
                  </select>
                </div>

                {(() => {
                  const selectedRec =
                    recommendations.find(
                      (rec, index) =>
                        getRecommendationKey(rec, index) === selectedRecId,
                    ) || recommendations[0];
                  if (!selectedRec) return null;

                  const recData = selectedRec as Record<string, unknown>;
                  const title =
                    (recData.Title as string | undefined) ||
                    selectedRec.Title ||
                    "Recommendation";
                  const scoreValue = toNumberValue(
                    recData.score ?? selectedRec.score,
                  );
                  const responsibilities = toStringArray(
                    recData.Responsibilities ?? selectedRec.Responsibilities,
                  );
                  const primarySkill = recData.primary_skill as
                    | Record<string, unknown>
                    | undefined;
                  const secondarySkill =
                    (recData.secondary_skill as Record<string, unknown>) ||
                    (recData.secondry_skill as Record<string, unknown>);
                  const projects = recData.projects as
                    | Record<string, unknown>
                    | undefined;
                  const experience = recData.experience as
                    | Record<string, unknown>
                    | undefined;
                  const achievement =
                    (recData.achievement as Record<string, unknown>) ||
                    (recData.achievment as Record<string, unknown>);
                  const certificates = recData.certificates as
                    | Record<string, unknown>
                    | undefined;

                  const primaryMatched = toStringArray(
                    primarySkill?.matched ?? [],
                  );
                  const primaryMissing = toStringArray(
                    primarySkill?.missing_skills ?? [],
                  );
                  const primaryCoverage = toNumberValue(
                    primarySkill?.coverage_score,
                  );
                  const primaryMatchedCount = toNumberValue(
                    primarySkill?.matched_count,
                  );
                  const primaryTotal = toNumberValue(
                    primarySkill?.total_role_skills,
                  );

                  const secondaryMatched = toStringArray(
                    secondarySkill?.matched ?? [],
                  );
                  const secondaryMissing = toStringArray(
                    secondarySkill?.missing_skills ?? [],
                  );
                  const secondaryCoverage = toNumberValue(
                    secondarySkill?.coverage_score,
                  );
                  const secondaryMatchedCount = toNumberValue(
                    secondarySkill?.matched_count,
                  );
                  const secondaryTotal = toNumberValue(
                    secondarySkill?.total_role_skills,
                  );

                  const projectSkills = toStringArray(projects?.skills ?? []);
                  const projectMissing = toStringArray(projects?.missing ?? []);
                  const projectSemantic = toNumberValue(
                    projects?.semantic_score,
                  );
                  const projectMatch = toNumberValue(projects?.match_score);
                  const projectFinal = toNumberValue(projects?.final_score);

                  const experienceScore = toNumberValue(experience?.score);
                  const achievementFinal = toNumberValue(
                    achievement?.final_score,
                  );
                  const achievementSemantic = toNumberValue(
                    achievement?.semantic_impact,
                  );
                  const achievementRelevance = toNumberValue(
                    achievement?.relevance,
                  );
                  const achievementLeadership = toNumberValue(
                    achievement?.leadership,
                  );
                  const achievementPrestige = toNumberValue(
                    achievement?.prestige,
                  );
                  const achievementComp = toNumberValue(
                    achievement?.comp_bonus,
                  );
                  const achievementQuant = toNumberValue(
                    achievement?.quant_bonus,
                  );
                  const certificatesFinal = toNumberValue(
                    certificates?.final_score,
                  );

                  return (
                    <div className="space-y-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Role alignment and improvement guidance for this
                            resume.
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-lg">
                          Score: {formatDecimal(scoreValue)}
                        </Badge>
                      </div>

                      {responsibilities.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <CheckCircle2
                              className="h-4 w-4 text-success"
                              aria-hidden="true"
                            />
                            Responsibilities
                          </h4>
                          <ul className="space-y-2">
                            {responsibilities.map((item, index) => (
                              <li
                                key={`${selectedRec.id}-resp-${index}`}
                                className="text-sm text-muted-foreground"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {(primarySkill || secondarySkill) && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {primarySkill && (
                            <div className="rounded-lg border border-border bg-background/60 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <Tag className="h-4 w-4 text-primary" />
                                  Primary Skills
                                </h4>
                                <Badge variant="secondary">
                                  Coverage: {formatDecimal(primaryCoverage)}%
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Matched {primaryMatchedCount ?? "-"}/
                                {primaryTotal ?? "-"} skills
                              </p>
                              {primaryMatched.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {primaryMatched.map((skill) => (
                                    <Badge key={skill} variant="default">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {primaryMissing.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Missing
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {primaryMissing.map((skill) => (
                                      <Badge key={skill} variant="destructive">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {secondarySkill && (
                            <div className="rounded-lg border border-border bg-background/60 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <Tag className="h-4 w-4 text-primary" />
                                  Secondary Skills
                                </h4>
                                <Badge variant="secondary">
                                  Coverage: {formatDecimal(secondaryCoverage)}%
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Matched {secondaryMatchedCount ?? "-"}/
                                {secondaryTotal ?? "-"} skills
                              </p>
                              {secondaryMatched.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {secondaryMatched.map((skill) => (
                                    <Badge key={skill} variant="default">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {secondaryMissing.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Missing
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {secondaryMissing.map((skill) => (
                                      <Badge key={skill} variant="destructive">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {(projects ||
                        experience ||
                        achievement ||
                        certificates) && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {projects && (
                            <div className="rounded-lg border border-border bg-background/60 p-4 space-y-3">
                              <h4 className="text-sm font-medium">
                                Projects Match
                              </h4>
                              <div className="text-xs text-muted-foreground">
                                Semantic: {formatDecimal(projectSemantic)} | Match:{" "}
                                {formatDecimal(projectMatch)} | Final:{" "}
                                {formatDecimal(projectFinal)}
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {projectSkills.length > 0 ? (
                                  projectSkills.map((skill) => (
                                    <Badge key={skill} variant="default">
                                      {skill}
                                    </Badge>
                                  ))
                                ) : (
                                  <div className="text-xs font-medium text-muted-foreground">
                                    no matching skills
                                  </div>
                                )}
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
                          )}
                          <div className="rounded-lg border border-border bg-background/60 p-4 space-y-3">
                            <h4 className="text-sm font-medium">Experience</h4>
                            <div className="text-xs text-muted-foreground">
                              Score: {formatDecimal(experienceScore)}
                            </div>
                            <h4 className="text-sm font-medium pt-2">
                              Certificates
                            </h4>
                            <div className="text-xs text-muted-foreground">
                              Final Score: {formatDecimal(certificatesFinal)}
                            </div>
                          </div>
                        </div>
                      )}

                      {achievement && (
                        <div className="rounded-lg border border-border bg-background/60 p-4">
                          <h4 className="text-sm font-medium mb-3">
                            Achievements
                          </h4>
                          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                            <div>Final: {formatDecimal(achievementFinal)}</div>
                            <div>
                              Semantic Impact: {formatDecimal(achievementSemantic)}
                            </div>
                            <div>Relevance: {formatDecimal(achievementRelevance)}</div>
                            <div>
                              Leadership: {formatDecimal(achievementLeadership)}
                            </div>
                            <div>Prestige: {formatDecimal(achievementPrestige)}</div>
                            <div>Comp Bonus: {formatDecimal(achievementComp)}</div>
                            <div>Quant Bonus: {formatDecimal(achievementQuant)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </section>
          </>
        )}

        {/* Actions */}
        <section
          className="mt-8 rounded-xl border border-border bg-card p-6"
          aria-labelledby="actions-heading"
        >
          <h2 id="actions-heading" className="font-semibold mb-4">
            Next Steps
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              className={`flex-1 ${resume?.isActive ? "cursor-not-allowed" : "cursor-pointer"}`}
              onClick={primaryResume}
              disabled={loading || resume?.isActive}
            >
              {!resume?.isActive && (
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              {resume?.isActive ? "Primary Resume" : "Set as Primary Resume"}
            </Button>
            <Button
              variant="destructive"
              className="flex-1 cursor-pointer"
              onClick={deleteResume}
              disabled={loading}
            >
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Delete Resume
            </Button>
            <Button
              variant="outline"
              asChild
              className="flex-1 bg-transparent"
              disabled={loading}
            >
              <Link href="/match-results">
                View Job Matches
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
