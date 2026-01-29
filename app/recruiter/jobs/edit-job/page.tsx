import type { Metadata } from "next"

import EditJob from "./edit-job"

/**
 * SEO: Job posting page metadata
 * - noindex since this is an authenticated page
 */
export const metadata: Metadata = {
    title: "Edit Job",
    description:
        "Edit a job posting and let our AI match you with the best candidates. Fill out the job details and requirements.",
    robots: { index: false, follow: false },
}

export default async function EditJobPage({
    searchParams,
}: {
    searchParams: Promise<{ job: string }>;
}) {
    const params = await searchParams;     // 👈 unwrap promise
    const job = params.job;

    return <EditJob job={job} />;
}


