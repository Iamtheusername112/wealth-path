"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  Bell,
  User
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

export function MobileNav({ user, unreadCount = 0 }) {
  const pathname = usePathname()
  
  const navItems = [
    {
      href: "/dashboard",
      label: "Home",
      icon: Home,
      mobileOnly: true
    },
    {
      href: "/cards",
      label: "Cards",
      icon: CreditCard,
      mobileOnly: true
    },
    {
      href: "/investments",
      label: "Invest",
      icon: TrendingUp,
      mobileOnly: true
    },
    {
      href: "/notifications",
      label: "Alerts",
      icon: Bell,
      mobileOnly: true,
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      href: "/settings",
      label: "Profile",
      icon: User,
      mobileOnly: true
    }
  ]

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-t border-gray-200 dark:border-gray-700 safe-area-bottom md:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center h-12 w-full text-sm font-medium rounded-lg transition-all duration-200 relative",
                    isActive ? "bg-yellow-600 text-white shadow-lg" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <Icon className="h-5 w-5" />
                      {item.badge && (
                        <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex items-center justify-center rounded-full h-5 min-w-[20px] bg-red-500 text-[10px] font-bold text-white px-1 shadow-lg">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium leading-none">
                      {item.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
      
      <style jsx>{`
        @keyframes badge-bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        .animate-badge-bounce {
          animation: badge-bounce 1s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
