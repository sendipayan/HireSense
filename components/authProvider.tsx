"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { useCandidateStore } from "@/store/candidateStore"
import { useRecruiterStore } from "@/store/RecuiterStore"
import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)
  const setRecruiterProfile = useRecruiterStore((s) => s.setRecuiterProfile)
  const setCandidateProfile = useCandidateStore((s) => s.setCandidateProfile)
  const { setIsLoggedIn } = useAuthStore()

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      setUser(data?.user?.user)
      if (data?.user?.user?.role === "RECRUITER") {
        setRecruiterProfile(data?.user)
      } else {
        setCandidateProfile(data?.user)
      }
      setIsLoggedIn(data.user ? true : false)

    }

    loadUser()
  }, [setUser, setRecruiterProfile, setCandidateProfile])

  return <SessionProvider>{children}</SessionProvider>
}
