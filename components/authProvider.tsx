"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { useUserStore } from "@/store/userStore"
import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)
  const setProfile = useUserStore((s) => s.setProfile)
  const { setIsLoggedIn } = useAuthStore()

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      setUser(data?.user?.user)
      setProfile(data?.user)
      setIsLoggedIn(data.user ? true : false)
    }

    loadUser()
  }, [setUser, setProfile])

  return <SessionProvider>{children}</SessionProvider>
}
