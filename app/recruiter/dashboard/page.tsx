
import type { Metadata } from "next"
import RecruiterDashboardPage from "../clientPage"
/**
 * SEO: Recruiter dashboard metadata
 * - noindex since this is an authenticated page
 */
export const metadata: Metadata = {
  title: "Recruiter Dashboard",
  description:
    "Manage your hiring pipeline with AI-powered candidate matching. View top candidates, active jobs, and hiring analytics.",
  robots: { index: false, follow: false },
}

export default function DashboardPage() {

  return <RecruiterDashboardPage />
}
