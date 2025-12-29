import type { Metadata } from "next"
import CandidateClientDashboardPage from "../candidateDashboard"


/**
 * SEO: Candidate dashboard metadata
 * - Descriptive title for the dashboard page
 * - noindex since this is an authenticated page
 */
export const metadata: Metadata = {
  title: "Candidate Dashboard",
  description:
    "Your personal job search dashboard. View recommended jobs, track applications, and get AI-powered insights on your resume.",
  robots: { index: false, follow: false },
}

export default function CandidateDashboardPage() {
  return <CandidateClientDashboardPage />
}
