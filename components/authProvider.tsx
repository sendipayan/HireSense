"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)

  const { setIsLoggedIn } = useAuthStore()

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      setUser(data.user)
      setIsLoggedIn(data.user ? true : false)
    }

    loadUser()
  }, [setUser])

  return <SessionProvider>{children}</SessionProvider>
}
