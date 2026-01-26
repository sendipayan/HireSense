"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Sparkles } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import icon from "@/public/icon.png"
import Image from "next/image"
import { ProfileMenu } from "./profileMenu"
import { useAuthStore } from "@/store/authStore"
import { useRecruiterStore } from "@/store/RecuiterStore"
import { useCandidateStore } from "@/store/candidateStore"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useJobStore } from "@/store/jobStore"
import axios from "axios"
import { useRecruiterApplicationsStore } from "@/store/recruiterApplication"
import { useApplicationsStore } from "@/store/candidateApplication"
/**
 * Main navigation component
 * - Semantic <header> and <nav> elements for accessibility and SEO
 * - ARIA labels for screen readers
 * - Keyboard navigable menu
 * - Responsive mobile menu
 * - Theme toggle button
 */
export function Navbar() {
  const router = useRouter()
  const clearAuth = useAuthStore((s) => s.logout)
  const clearRecruiter = useRecruiterStore((s) => s.clearRecuiterProfile)
  const clearCandidate = useCandidateStore((s) => s.clearCandidateProfile)
  const clearJob = useJobStore((s) => s.clear)
  const clearApplications = useRecruiterApplicationsStore((s) => s.clear)
  const clearCandidateApplications = useApplicationsStore((s) => s.clear)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isLoggedIn, user } = useAuthStore()
  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl"
      role="banner"
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight" aria-label="HireAI Home">
            <div className="flex h-8 w-8 items-center justify-center ">
              <Image src={icon} alt="HireAI Logo" width={24} height={24} className="" />
            </div>
            <span>HireSense</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex md:items-center md:gap-3">
          <ThemeToggle />
          {!isLoggedIn && <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>}
          {!isLoggedIn && <Button asChild>
            <Link href="/login">Get Started</Link>
          </Button>}
          {isLoggedIn && (
            <ProfileMenu
              name={user?.name}
              role={user?.role}
              profilePic={user?.profilePic}
              onLogout={async () => {
                const res = await axios.post("/api/auth/logout")
                if (res.data.success) {
                  clearAuth()
                  clearRecruiter()
                  clearCandidate()
                  clearJob()
                  clearApplications()
                  clearCandidateApplications()
                }
                await signOut({
                  redirect: false,
                })
                window.location.href = "/login"
              }}
            />)}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-border bg-background" role="menu">
          <div className="space-y-1 px-4 py-4 flex flex-col items-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                role="menuitem"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-border w-full">
              {!isLoggedIn && <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/login">Sign in</Link>
              </Button>}
              {!isLoggedIn && <Button asChild className="w-full">
                <Link href="/login">Get Started</Link>
              </Button>}
              {isLoggedIn && <Button asChild className="w-full">
                <Link href={`/${user?.role.toLowerCase()}/dashboard`}>Dashboard</Link>
              </Button>}
              {isLoggedIn && <Button asChild className="w-full">
                <Link href={`/${user?.role.toLowerCase()}/profile`}>Profile</Link>
              </Button>}
              {isLoggedIn && <Button asChild className="w-full bg-red-500" onClick={async () => {
                const res = await axios.post("/api/auth/logout")
                if (res.data.success) {
                  clearAuth()
                  clearRecruiter()
                  clearCandidate()
                  clearJob()
                  clearApplications()
                  clearCandidateApplications()
                }
                await signOut({
                  redirect: false,
                })
                window.location.href = "/login"
              }}>
                <p >Logout</p>
              </Button>}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
