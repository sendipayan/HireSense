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
    let isMounted = true // Prevent state updates on unmounted component

    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include", // Important for cookies
        })

        // Check if response is successful
        if (!res.ok) {
          console.error("Failed to fetch user:", res.status)
          if (isMounted) {
            setIsLoggedIn(false)
          }
          return
        }

        // Read response body only once
        const data = await res.json()
        console.log("Auth data:", data)

        // Only update state if component is still mounted
        if (isMounted) {
          // Check if user data exists
          if (data?.user) {
            setUser(data.user.user || data.user)

            // Set profile based on role
            if (data.user.user?.role === "RECRUITER" || data.user.role === "RECRUITER") {
              setRecruiterProfile(data.user)
            } else if (data.user.user?.role === "CANDIDATE" || data.user.role === "CANDIDATE") {
              setCandidateProfile(data.user)
            }

            setIsLoggedIn(true)
          } else {
            setIsLoggedIn(false)
          }
        }
      } catch (error) {
        console.error("Error loading user:", error)
        if (isMounted) {
          setIsLoggedIn(false)
        }
      }
    }

    loadUser()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [setUser, setRecruiterProfile, setCandidateProfile, setIsLoggedIn])

  return <SessionProvider>{children}</SessionProvider>
}
