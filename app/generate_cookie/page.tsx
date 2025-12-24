"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"


export default function TriggerGoogleJwt() {
    const { setIsLoggedIn, setUser } = useAuthStore()
    const router = useRouter()
    useEffect(() => {

        const signIn = async () => {
            const res = await fetch("/api/auth/complete_google_signin", {
                method: "POST",
                credentials: "include",
            })
            const data = await res.json()
            if (res.ok) {
                const res2 = await fetch("/api/auth/me")
                const data2 = await res2.json()
                setUser(data2.user)
                setIsLoggedIn(true)
                router.replace(`${data.role}/dashboard`)
            }
        }

        signIn()

    }, [])

    return (<div className="flex items-center justify-center h-screen">
        <p>Please wait...</p>
    </div>)
}
