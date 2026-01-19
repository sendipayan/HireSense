"use client"

import * as React from "react"
import {
    Briefcase,
    FileText,
    LayoutDashboard,
    Sparkles,
    Users,
    Video,
    Send,
    Star,
    UserCircle,
    LogOut,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect } from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/store/authStore"
import { useRecruiterStore } from "@/store/RecuiterStore"
import { useCandidateStore } from "@/store/candidateStore"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useJobStore } from "@/store/jobStore"
import axios from "axios"
import { useRecruiterApplicationsStore } from "@/store/recruiterApplication"
import { useApplicationsStore } from "@/store/candidateApplication"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Define the navigation items for each role
const candidateNav = [
    {
        title: "Dashboard",
        url: "/candidate/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Jobs",
        url: "/candidate/browse-jobs",
        icon: Briefcase,
    },
    {
        title: "Resume",
        url: "/candidate/resume-upload",
        icon: FileText,
    },
    {
        title: "Interviews",
        url: "/candidate/interviews",
        icon: Video,
    },
    {
        title: "Applications",
        url: "/candidate/applications",
        icon: Send,
    },
]

const recruiterNav = [
    {
        title: "Dashboard",
        url: "/recruiter/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Jobs",
        url: "/recruiter/jobs",
        icon: Briefcase,
    },
    {
        title: "Top Matches",
        url: "/recruiter/top-matches",
        icon: Star,
    },
    {
        title: "Interviews",
        url: "/recruiter/interviews",
        icon: Users,
    },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    type: "candidate" | "recruiter"
}

export function AppSidebar({ type, ...props }: AppSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const clearAuth = useAuthStore((s) => s.logout)
    const clearRecruiter = useRecruiterStore((s) => s.clearRecuiterProfile)
    const clearCandidate = useCandidateStore((s) => s.clearCandidateProfile)
    const clearJob = useJobStore((s) => s.clear)
    const clearApplications = useRecruiterApplicationsStore((s) => s.clear)
    const clearCandidateApplications = useApplicationsStore((s) => s.clear)
    const { user } = useAuthStore()
    const { setOpen, isMobile } = useSidebar()

    // Close sidebar on route change
    useEffect(() => {
        setOpen(false)
    }, [pathname, setOpen])

    const navItems = type === "candidate" ? candidateNav : recruiterNav
    const profileUrl = `/${type}/dashboard/profile`

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader className="h-[20vh] min-h-[180px] flex flex-col items-center justify-center p-0 border-b transition-all relative overflow-hidden group/header">
                {/* Decorative background */}
                <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-background to-background dark:from-primary/10 dark:via-background dark:to-background z-0" />

                <Link href={profileUrl} className="flex flex-col items-center gap-4 w-full h-full justify-center group relative z-10 transition-colors hover:bg-white/5 dark:hover:bg-black/5 p-4">
                    <div className="relative w-24 h-24 transition-transform duration-300 group-hover:scale-105">
                        {/* Glowing effect behind avatar */}
                        <div className="absolute inset-0 bg-linear-to-tr from-primary to-purple-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity" />

                        <div className="relative w-full h-full rounded-full p-[3px] bg-linear-to-tr from-primary/50 to-purple-500/50 group-hover:from-primary group-hover:to-purple-500 transition-colors">
                            <div className="w-full h-full rounded-full border-2 border-background overflow-hidden bg-background">
                                <Avatar className="w-full h-full">
                                    <AvatarImage src="" alt={user?.name || "User"} className="object-cover" />
                                    <AvatarFallback className="text-3xl font-bold bg-muted text-primary/80">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircle className="w-12 h-12" />}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-background rounded-full shadow-sm" />
                    </div>

                    <div className="text-center group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-top-1 duration-300 w-full px-2">
                        <h3 className="font-bold text-lg leading-tight truncate w-full text-foreground/90">
                            {user?.name || (type === "candidate" ? "Candidate" : "Recruiter")}
                        </h3>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1 scale-90">
                            {type} Workspace
                        </p>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu className="py-4 gap-1 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={item.title}
                                    size="lg"
                                    className="px-4 py-3 data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-all duration-200 hover:translate-x-1"
                                >
                                    <Link href={item.url}>
                                        <item.icon className="w-5! h-5!" />
                                        <span className="text-base font-medium">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t bg-muted/5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="px-4 py-3 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                            onClick={async () => {
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
                                router.replace("/login")
                            }}
                            tooltip="Logout"
                        >
                            <LogOut className="w-5! h-5!" />
                            <span className="text-base font-medium">Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="group-data-[collapsible=icon]:hidden text-xs text-center text-muted-foreground mt-2">
                    © 2024 HireSense
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
