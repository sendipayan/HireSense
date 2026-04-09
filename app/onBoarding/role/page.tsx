"use client"

import { useSession } from "next-auth/react"
import { useAuthStore } from "@/store/authStore"
import { useRecruiterStore } from "@/store/RecuiterStore"
import { useCandidateStore } from "@/store/candidateStore"
import toast from "react-hot-toast"

export default function RolePage() {
    const { setIsLoggedIn, setUser } = useAuthStore()
    const { setRecuiterProfile } = useRecruiterStore()
    const { setCandidateProfile } = useCandidateStore()
    const { data: session } = useSession()

    async function submitRole(role: "CANDIDATE" | "RECRUITER") {
        const res = await fetch("/api/auth/complete_google_signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role }),
            credentials: "include",
        })
        if (res.ok) {
            const res2 = await fetch("/api/auth/me")
            const data2 = await res2.json()
            setUser(data2.user.user)
            if (data2.user.user.role === "RECRUITER") {
                setRecuiterProfile(data2.user)
            } else {
                setCandidateProfile(data2.user)
            }
            setIsLoggedIn(true)
            toast.success("Welcome to HireSense!")
            window.location.href = `/${role.toLowerCase()}/dashboard`
    
        }


    }

    if (!session) return null

    return (
        <div className="mt-10  flex flex-col items-center justify-evenly h-[50vh]  px-4 py-2">
            <h1 className="text-2xl font-bold">Select your role: </h1>
            <button onClick={() => submitRole("CANDIDATE")} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 cursor-pointer">
                Candidate
            </button>
            <button onClick={() => submitRole("RECRUITER")} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 cursor-pointer">
                Recruiter
            </button>
        </div>
    )
}
