"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useAuthStore } from "@/store/authStore"

export default function RolePage() {
    const { setIsLoggedIn, setUser } = useAuthStore()
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
            setUser(data2.user)
            setIsLoggedIn(true)
            router.replace(`/${role.toLowerCase()}/dashboard`)
        }

    }

    if (!session) return null

    return (
        <div className="mt-10  flex flex-col items-center justify-evenly h-[25vh]  px-4 py-2">
            <h1>Select your role: </h1>
            <button onClick={() => submitRole("CANDIDATE")} className="border border-border rounded-md px-4 py-2 cursor-pointer">
                Candidate
            </button>
            <button onClick={() => submitRole("RECRUITER")} className="border border-border rounded-md px-4 py-2 cursor-pointer">
                Recruiter
            </button>
        </div>
    )
}
