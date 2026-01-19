"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function CandidateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider
            defaultOpen={false}
            forceMobile={true}
            style={
                {
                    "--sidebar-width": "18rem",
                } as React.CSSProperties
            }
        >
            {/* 
        The top-16 class offsets the sidebar to start below the global sticky navbar (approx 64px/4rem).
        We calculate height to fill the remaining screen space.
        z-40 ensures it sits below the navbar (z-50) but above content.
      */}
            <AppSidebar type="candidate" className="top-16 h-[calc(100svh-4rem)]! z-40 border-r" />
            <SidebarInset className="p-4 md:p-6 lg:p-8">
                <div className="mb-4">
                    <SidebarTrigger />
                </div>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
