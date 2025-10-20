"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, BellOff, Check, CheckCheck } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { toast } from "sonner"

export function NotificationsContent({ notifications, userId }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Mark as read error:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        toast.success("All notifications marked as read")
        router.refresh()
      } else {
        toast.error("Failed to mark notifications as read")
      }
    } catch (error) {
      console.error('Mark all as read error:', error)
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 pb-20 sm:pb-8 max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
              <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-gold-600" />
              Notifications
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'You\'re all caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={loading}
              className="w-full sm:w-auto flex-shrink-0"
              size="sm"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Mark all as read</span>
              <span className="sm:hidden">Mark all read</span>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all cursor-pointer shadow-lg shadow-black/10 ${!notification.is_read ? 'border-gold-600 bg-gold-50 dark:bg-gold-950/20' : ''}`}
              onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      {!notification.is_read ? (
                        <Bell className="h-4 w-4 text-gold-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <BellOff className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm sm:text-base ${!notification.is_read ? 'font-semibold' : ''}`}>
                        {notification.message}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground pl-6">
                      {formatDateTime(notification.created_at)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {!notification.is_read ? (
                      <Badge variant="pending" className="text-xs">New</Badge>
                    ) : (
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-lg shadow-black/10">
            <CardContent className="p-8 sm:p-12 text-center">
              <BellOff className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                You'll see important updates and alerts here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

