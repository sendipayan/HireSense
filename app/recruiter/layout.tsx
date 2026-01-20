"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { SidebarAutoClose } from "@/lib/SidebarClose"

function RecruiterLayoutContent({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <>

            <AppSidebar
                type="recruiter"
                className="top-16 h-[calc(100svh-4rem)]! z-40 border-r"
            />


            <SidebarInset className="p-4 md:p-6 lg:p-8">
                <div className="mb-4">
                    <SidebarTrigger className="cursor-pointer" />
                </div>
                {children}
            </SidebarInset>
        </>
    )
}

export default function RecruiterLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider
            defaultOpen={true}
            forceMobile={true}
            style={
                {
                    "--sidebar-width": "18rem",
                } as React.CSSProperties
            }
        >
            <SidebarAutoClose />
            <RecruiterLayoutContent>{children}</RecruiterLayoutContent>
        </SidebarProvider>
    )
}
