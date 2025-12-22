"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)

  const { isLoggedIn, setIsLoggedIn } = useAuthStore()

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      setUser(data.user)
      setIsLoggedIn(data.user ? true : false)
    }

    loadUser()
  }, [setUser])

  return <>{children}</>
}
