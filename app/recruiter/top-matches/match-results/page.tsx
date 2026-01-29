import type { Metadata } from "next"
import MatchResultsClientPage from "./clientMatchResults"


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

export default async function MatchResultsPage({
  searchParams,
}: {
  searchParams: {
    job: string;
    candidate: string;
  };
}) {

  const params = await searchParams;     // 👈 unwrap promise
  const candidateId = params.candidate;
  const jobId = params.job;


  return (
    <MatchResultsClientPage candidateId={candidateId} jobId={jobId} />
  )
}
