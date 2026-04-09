"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function AuthRedirect() {
    const router = useRouter()
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === "loading") return

        if (!session) {
            router.replace("/login")
            return
        }

        const isNewUser = Boolean((session.user as { isNewUser?: boolean })?.isNewUser)
        if (isNewUser) {
            window.location.href= "/onBoarding/role"
            
            return
        }
        window.location.href= "/generate_cookie"
        
    }, [router, session, status])

    return (
        <div className="flex items-center justify-center h-screen">
            <p>Please wait...</p>
        </div>
    )
}
