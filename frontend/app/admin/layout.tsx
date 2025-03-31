"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, LayoutDashboard, MessageSquare, Users } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/chats", label: "Chats", icon: MessageSquare },
    { href: "/admin/users", label: "Users", icon: Users },
  ]

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-muted p-4 border-r">
          <div className="flex flex-col h-full">
            <div className="mb-8">
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>

            <nav className="space-y-2 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <Button variant="outline" size="sm" onClick={handleLogout} className="mt-auto">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </ProtectedRoute>
  )
}

