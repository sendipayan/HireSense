"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import toast from "react-hot-toast"
import { useProjectStore } from "@/store/projectStore"

export default function ProjectsClientPage() {
    const router = useRouter()
    const { setProjects } = useProjectStore()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (searchParams.get("github") === "cancelled") {
            toast.error("GitHub connection was cancelled.")
            router.replace("/candidate/profile")
            return
        }

        const fetchProjects = async () => {
            try {
                const res = await fetch("/api/candidate/fetch_projects")
                const data = await res.json()

                if (res.status === 200) {
                    setProjects(data.project)
                    toast.success(`${data.project.length} projects fetched successfully`)
                    window.location.href="/candidate/profile"
                    
                } else if (res.status === 404) {
                    toast.error("Please connect your github account")

                    window.location.href =
                        `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=repo`
                } else {
                    toast.error(data.error || "Failed to fetch projects")
                }
            } catch (error) {
                console.error("Project fetch error:", error)
                toast.error("An unexpected error occurred")
                window.location.href="/candidate/profile"
                
            }
        }

        fetchProjects()
    }, [router, setProjects, searchParams])

    return (
        <div className="flex items-center justify-center h-screen">
            <h1>Loading...</h1>
        </div>
    )
}
