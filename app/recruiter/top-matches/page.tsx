import type { Metadata } from "next"
import { TopMatchesClient } from "@/components/top-client"

export const metadata: Metadata = {
    title: "Top Candidate Matches | Recruiter Dashboard",
    description:
        "Discover top-tier talent matched specifically to your job requirements using AI-powered compatibility analysis.",
}

export default function TopMatchesPage() {
    return <TopMatchesClient />
}
