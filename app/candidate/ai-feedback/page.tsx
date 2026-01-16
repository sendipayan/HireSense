import type { Metadata } from "next"
import AIFeedbackClientPage from "./clientPage"

/**
 * SEO: AI Feedback page metadata
 * - Descriptive title for resume feedback page
 */
export const metadata: Metadata = {
  title: "AI Resume Feedback",
  description:
    "Get detailed AI-powered feedback on your resume. Receive section-by-section analysis, keyword optimization tips, and actionable improvement suggestions.",
  robots: { index: false, follow: false },
}

export default async function AIFeedbackPage({
  searchParams,
}: {
  searchParams: {
    resume: string;
  };
}) {

  const params = await searchParams;     // 👈 unwrap promise
  const resumeId = params.resume;

  return (
    <AIFeedbackClientPage resumeId={resumeId} />
  )
}
