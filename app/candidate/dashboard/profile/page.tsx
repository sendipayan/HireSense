import type { Metadata } from "next"
import CandidateProfileClientPage from "./CandidateProfileClientPage"

/**
 * SEO: Candidate Profile Page Metadata
 * - Unique title and description for SEO
 * - No indexing as it's user-specific
 */
export const metadata: Metadata = {
  title: "Candidate Profile",
  description: "Complete your candidate profile to unlock job matching and opportunities on HireAI",
  robots: {
    index: false,
    follow: false,
  },
}

export default function CandidateProfilePage() {
  return <CandidateProfileClientPage />
}
