import { Suspense } from "react"
import ProjectsClientPage from "./clientPage"

export default function ProjectsPage() {
    return (
        <Suspense fallback={null}>
            <ProjectsClientPage />
        </Suspense>
    )
}
