"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function NotificationBadge({ userId }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const pathname = usePathname()

  const fetchUnreadCount = async () => {
    if (!userId) return
    
    try {
      const response = await fetch(`/api/notifications/unread-count?userId=${userId}`, {
        method: 'GET',
        cache: 'no-store',
      })
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count || 0)
      } else {
        console.error('Notification count API error:', response.status)
      }
    } catch (error) {
      // Silently fail - don't spam console with errors
      // Badge will just not show if API is down
    }
  }

  useEffect(() => {
    // Fetch initially
    fetchUnreadCount()

    // Poll every 3 seconds for real-time updates
    const interval = setInterval(fetchUnreadCount, 3000)

    return () => clearInterval(interval)
  }, [userId])

  // Refresh count immediately when user navigates (especially from/to notifications page)
  useEffect(() => {
    fetchUnreadCount()
  }, [pathname])

  if (unreadCount === 0) return null

  return (
    <span className="relative inline-flex h-5 w-5 sm:h-6 sm:w-6">
      {/* Pulsing outer ring */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-40 animate-pulse"></span>
      {/* Main badge */}
      <span className="relative inline-flex rounded-full h-5 w-5 sm:h-6 sm:w-6 bg-gradient-to-br from-red-500 to-red-600 items-center justify-center text-[9px] sm:text-[10px] font-bold text-white shadow-lg border-2 border-background">
        {unreadCount > 99 ? '99+' : unreadCount > 9 ? '9+' : unreadCount}
      </span>
    </span>
  )
}

