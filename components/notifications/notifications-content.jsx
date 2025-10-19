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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Bell className="h-8 w-8 text-gold-600" />
              Notifications
            </h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'You\'re all caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={loading}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all cursor-pointer ${!notification.is_read ? 'border-gold-600 bg-gold-50 dark:bg-gold-950/20' : ''}`}
              onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {!notification.is_read ? (
                        <Bell className="h-4 w-4 text-gold-600" />
                      ) : (
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <p className={`${!notification.is_read ? 'font-semibold' : ''}`}>
                        {notification.message}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(notification.created_at)}
                    </p>
                  </div>
                  <div>
                    {!notification.is_read ? (
                      <Badge variant="pending">New</Badge>
                    ) : (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BellOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                You'll see important updates and alerts here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

