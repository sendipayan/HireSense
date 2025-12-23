"use client"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import * as Avatar from "@radix-ui/react-avatar"
import { LogOut, User, LayoutDashboard } from "lucide-react"

import { useRouter } from "next/navigation"

type Props = {
    email: string | undefined
    role: "CANDIDATE" | "RECRUITER" | undefined
    onLogout: () => void
}

export function ProfileMenu({ email, role, onLogout }: Props) {
    const router = useRouter()

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="outline-none">
                    <Avatar.Root className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        <Avatar.Image
                            src="/avatar.png"
                            alt="Profile"
                            className="h-full w-full rounded-full object-cover"
                        />
                        <Avatar.Fallback className="text-sm font-medium">
                            {email?.[0].toUpperCase()}
                        </Avatar.Fallback>
                    </Avatar.Root>
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
                align="end"
                className="w-56 rounded-md bg-background p-2 shadow-md"
            >
                <div className="px-2 py-1">
                    <p className="text-sm font-medium">{email}</p>
                    <p className="text-xs text-muted-foreground">{role?.toLowerCase()}</p>
                </div>

                <DropdownMenu.Separator className="my-1 h-px bg-border" />

                <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm outline-none hover:bg-muted"
                    onClick={() => router.push(`/${role?.toLowerCase()}/dashboard`)}
                >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                </DropdownMenu.Item>

                <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm outline-none hover:bg-muted"
                    onClick={() => router.push(`/${role?.toLowerCase()}/dashboard/profile`)}
                >
                    <User className="h-4 w-4" />
                    Profile
                </DropdownMenu.Item>

                <DropdownMenu.Item
                    onClick={onLogout}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm text-red-600 outline-none hover:bg-muted"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
}
