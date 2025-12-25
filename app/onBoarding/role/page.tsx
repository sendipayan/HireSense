"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useAuthStore } from "@/store/authStore"
import { useUserStore } from "@/store/userStore"

export default function RolePage() {
    const { setIsLoggedIn, setUser } = useAuthStore()
    const { setProfile } = useUserStore()
    const { data: session } = useSession()
    const router = useRouter()

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
            setProfile(data2.user)
            setIsLoggedIn(true)
            router.replace(`/${role.toLowerCase()}/dashboard`)
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
