"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, PlusCircle, User, Award } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/feed", icon: Home, label: "Home", emoji: "🏠" },
    { href: "/journeys", icon: Compass, label: "Journeys", emoji: "🗺️" },
    { href: "/create", icon: PlusCircle, label: "Post", emoji: "✨" },
    { href: "/badges", icon: Award, label: "Badges", emoji: "🏆" },
    { href: "/profile", icon: User, label: "Profile", emoji: "👤" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 bg-[#A8CDD8] pb-safe">
      <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-2 transition-all ${
                isActive ? "bg-white/90 shadow-lg" : "hover:bg-white/50"
              }`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className={`text-xs font-medium ${isActive ? "text-gray-800" : "text-gray-600"}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
