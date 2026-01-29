import type { Metadata } from "next"
import { RecruiterJobsClient } from "@/components/recuiter-jobs"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Manage Jobs",
    description: "View, edit, and manage your posted job opportunities.",
    robots: { index: false, follow: false },
}

export default function RecruiterJobsPage() {
    return (
        <main className="py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Breadcrumbs items={[{ label: "Recruiter", href: "/recruiter/dashboard" }, { label: "Manage Jobs" }]} />
                <section aria-labelledby="Job-heading">
                    <PageHeader
                        title="Manage My Jobs"
                        description="Track your hiring progress, update job details, or manage existing postings."
                    >
                        <Button asChild >
                            <Link href="/recruiter/jobs/post-job">
                                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                                Post New Job
                            </Link>
                        </Button>
                    </PageHeader>
                </section>
                <div className="mt-8">
                    <RecruiterJobsClient />
                </div>
            </div>
        </main>
    )
}
