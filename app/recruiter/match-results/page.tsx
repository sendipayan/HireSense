import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { mockMatchResults } from "@/lib/mock-data"
import {
  Target,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Briefcase,
  MapPin,
  DollarSign,
  GraduationCap,
  Star,
  MessageSquare,
  Calendar,
} from "lucide-react"

/**
 * SEO: Match results page metadata
 * - Descriptive title and description for job matching results
 */
export const metadata: Metadata = {
  title: "Match Results",
  description:
    "View AI-powered match results between candidates and job opportunities. See detailed compatibility scores and recommendations.",
  robots: { index: false, follow: false },
}

export default function MatchResultsPage() {
  const { candidate, job, overallScore, breakdown, strengths, gaps, recommendation } = mockMatchResults

  return (
    <main className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ href: "/recruiter/dashboard", label: "Recruiter" }, { label: "Match Results" }]} />

        {/* Page Header */}
        <PageHeader
          title="Match Analysis"
          description="AI-powered compatibility analysis between candidate and job opportunity."
        />

        {/* Overall Score Hero */}
        <section className="mt-8" aria-labelledby="score-heading">
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Target className="h-4 w-4" aria-hidden="true" />
              AI Match Score
            </div>
            <h2 id="score-heading" className="sr-only">
              Overall Match Score
            </h2>
            <div className="text-7xl font-bold tracking-tight text-primary">{overallScore}%</div>
            <p className="mt-2 text-lg text-muted-foreground">Excellent Match</p>
            <div className="mt-6 flex justify-center gap-4">
              <Button size="lg">
                <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
                Contact Candidate
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent">
                <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                Schedule Interview
              </Button>
            </div>
          </div>
        </section>

        {/* Match Details Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Candidate Summary */}
          <section aria-labelledby="candidate-heading">
            <h2 id="candidate-heading" className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">
                C
              </span>
              Candidate Profile
            </h2>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
                  {candidate.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{candidate.name}</h3>
                  <p className="text-muted-foreground">{candidate.title}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>{candidate.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>{candidate.experience}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>{candidate.education}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Star className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>{candidate.skills.length} Skills</span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium mb-2">Top Skills</p>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Job Summary */}
          <section aria-labelledby="job-heading">
            <h2 id="job-heading" className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground text-xs font-bold">
                J
              </span>
              Job Details
            </h2>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-semibold">{job.title}</h3>
              <p className="text-muted-foreground">{job.company}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>{job.type}</span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-sm text-muted-foreground leading-relaxed">{job.description}</p>
            </div>
          </section>
        </div>

        {/* Score Breakdown */}
        <section className="mt-8" aria-labelledby="breakdown-heading">
          <h2 id="breakdown-heading" className="text-lg font-semibold mb-4">
            Score Breakdown
          </h2>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-6">
              {breakdown.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-xs text-muted-foreground">({item.weight}% weight)</span>
                    </div>
                    <span className="font-semibold text-primary">{item.score}%</span>
                  </div>
                  <Progress value={item.score} className="h-2" aria-label={`${item.category} score: ${item.score}%`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Strengths & Gaps */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Strengths */}
          <section aria-labelledby="strengths-heading">
            <h2 id="strengths-heading" className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
              Strengths
            </h2>
            <div className="rounded-xl border border-border bg-card p-6">
              <ul className="space-y-3">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Gaps */}
          <section aria-labelledby="gaps-heading">
            <h2 id="gaps-heading" className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" aria-hidden="true" />
              Areas to Explore
            </h2>
            <div className="rounded-xl border border-border bg-card p-6">
              <ul className="space-y-3">
                {gaps.map((gap, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* AI Recommendation */}
        <section className="mt-8" aria-labelledby="recommendation-heading">
          <h2 id="recommendation-heading" className="text-lg font-semibold mb-4">
            AI Recommendation
          </h2>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
            <p className="leading-relaxed">{recommendation}</p>
          </div>
        </section>

        {/* Actions */}
        <section className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center" aria-label="Next steps">
          <Button size="lg" asChild>
            <Link href="/ai-feedback">
              View Full AI Feedback
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent" asChild>
            <Link href="/candidate/dashboard">Back to Dashboard</Link>
          </Button>
        </section>
      </div>
    </main>
  )
}
