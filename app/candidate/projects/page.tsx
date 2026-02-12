"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useProjectStore } from "@/store/projectStore"

export default function Projects() {
    const router = useRouter()
    const { setProjects } = useProjectStore()

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch("/api/candidate/fetch_projects")
                const data = await res.json()
                if (res.ok) {

                    setProjects(data.project)
                    toast.success(`${data.project.length} projects fetched successfully`)
                } else {
                    toast.error(data.error || "Failed to fetch projects")
                }
            } catch (error) {
                console.error("Project fetch error:", error)
                toast.error("An unexpected error occurred")
            } finally {
                router.push("/candidate/profile")
            }
        }
        fetchProjects()
    }, [router, setProjects])

    return (
        <div className="flex items-center justify-center h-screen">
            <h1>Loading projects...</h1>
        </div>
    )
}