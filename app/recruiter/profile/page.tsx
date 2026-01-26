import { RecruiterProfileClientPage } from "./clientPage"
import type { Metadata } from "next"

/**
 * SEO: Recruiter Profile Page Metadata
 * - Unique title and description for SEO
 * - No indexing as it's user-specific
 */
export const metadata: Metadata = {
  title: "Recruiter Profile",
  description: "Complete your recruiter profile to establish company legitimacy and hiring intent on HireAI",
  robots: {
    index: false,
    follow: false,
  },
}

export default function RecruiterProfilePage() {
  return <RecruiterProfileClientPage />
}
