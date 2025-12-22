"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      setUser(data.user)
    }

    loadUser()
  }, [setUser])

  return <>{children}</>
}
