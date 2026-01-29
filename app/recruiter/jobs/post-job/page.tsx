import type { Metadata } from "next"

import PostJob from "./post-job"

/**
 * SEO: Job posting page metadata
 * - noindex since this is an authenticated page
 */
export const metadata: Metadata = {
  title: "Post a Job",
  description:
    "Create a new job posting and let our AI match you with the best candidates. Fill out the job details and requirements.",
  robots: { index: false, follow: false },
}

export default function PostJobPage() {
  return <PostJob />
}


