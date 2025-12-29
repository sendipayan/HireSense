"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { useJobStore } from "@/store/jobStore"
import { useCandidateStore } from "@/store/candidateStore"
import { useRecruiterStore } from "@/store/RecuiterStore"
import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)
  const setRecruiterProfile = useRecruiterStore((s) => s.setRecuiterProfile)
  const setCandidateProfile = useCandidateStore((s) => s.setCandidateProfile)
  const { setIsLoggedIn } = useAuthStore()
  const { setJobs } = useJobStore()

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
      const res1 = await fetch("/api/getjob")
      const data1 = await res1.json()
      setJobs(data1.job)
    }

    loadUser()
  }, [setUser, setRecruiterProfile, setCandidateProfile, setJobs])

  return <SessionProvider>{children}</SessionProvider>
}
