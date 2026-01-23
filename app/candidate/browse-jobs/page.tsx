import { JobsBrowser } from "./jobClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Browse Jobs",
    description: "Browse job opportunities and apply for positions.",
    robots: { index: false, follow: false },
}

export default function BrowseJobsPage() {
    return (<main className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <JobsBrowser />

        </div>
    </main>)
}