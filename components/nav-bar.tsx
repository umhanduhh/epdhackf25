"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Compass, PlusCircle, User, Award, Shield } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export function NavBar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/auth")
    router.refresh()
  }

  const navItems = [
    { href: "/feed", icon: Home, label: "Home", color: "bg-orange-400" },
    { href: "/journeys", icon: Compass, label: "Journeys", color: "bg-blue-400" },
    { href: "/create", icon: PlusCircle, label: "Create", color: "bg-purple-400" },
    { href: "/verify", icon: Shield, label: "Verify", color: "bg-green-400" },
    { href: "/badges", icon: Award, label: "Badges", color: "bg-yellow-400" },
    { href: "/profile", icon: User, label: "Profile", color: "bg-pink-400" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-white/30 bg-[#8BBFB8] pb-safe">
      <div className="mx-auto flex max-w-7xl items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 transition-transform active:scale-95"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-md transition-all ${
                  isActive ? `${item.color} scale-110` : "bg-white/90"
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? "text-white" : "text-gray-700"}`} />
              </div>
              <span className={`text-xs font-medium ${isActive ? "text-white" : "text-gray-700"}`}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
