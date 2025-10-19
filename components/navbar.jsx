"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, Menu, X, Bell, CheckCircle2, Clock, DollarSign, CreditCard, TrendingUp } from "lucide-react"
import { Button } from "./ui/button"
import { ThemeToggle } from "./theme-toggle"
import { UserMenu } from "./user-menu"
import { Badge } from "./ui/badge"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar({ user }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])

  const fetchNotifications = async () => {
    try {
      // Fetch unread count
      const countResponse = await fetch('/api/notifications/unread-count')
      const countData = await countResponse.json()
      if (countData.success) {
        setUnreadCount(countData.count || 0)
      }

      // Fetch recent notifications (we'll need to create this endpoint)
      const notifResponse = await fetch('/api/notifications/recent')
      if (notifResponse.ok) {
        const notifData = await notifResponse.json()
        if (notifData.success) {
          setNotifications(notifData.notifications || [])
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleNotificationClick = async (notificationId) => {
    try {
      // Mark as read
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      fetchNotifications()
      setNotificationOpen(false)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleViewAll = () => {
    setNotificationOpen(false)
    window.location.href = '/notifications'
  }

  const getNotificationIcon = (message) => {
    if (message.includes('deposit') || message.includes('Deposit')) return DollarSign
    if (message.includes('card') || message.includes('Card')) return CreditCard
    if (message.includes('KYC') || message.includes('verification')) return CheckCircle2
    if (message.includes('investment') || message.includes('Investment')) return TrendingUp
    return Bell
  }

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const navItems = user
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/cards", label: "Cards" },
        { href: "/investments", label: "Investments" },
        { href: "/settings", label: "Settings" },
      ]
    : []

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-gold-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-navy-700 to-gold-600 bg-clip-text text-transparent">
                CapitalPath
              </span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-gold-600",
                      pathname === item.href
                        ? "text-gold-600"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell Dropdown */}
                <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                    >
                      <Bell className={`h-5 w-5 text-muted-foreground hover:text-gold-600 transition-colors ${unreadCount > 0 ? 'animate-bell-ring' : ''}`} />
                      {unreadCount > 0 && (
                        <Badge 
                          className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center bg-red-500 text-white text-xs px-1 animate-pulse"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <Badge variant="destructive">{unreadCount} New</Badge>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground text-sm">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications</p>
                        <p className="text-xs mt-1">You're all caught up! 🎉</p>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-[400px] overflow-y-auto">
                          {notifications.slice(0, 5).map((notification) => {
                            const Icon = getNotificationIcon(notification.message)
                            return (
                              <DropdownMenuItem 
                                key={notification.id}
                                className={`cursor-pointer flex items-start gap-3 p-3 ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                                onClick={() => handleNotificationClick(notification.id)}
                              >
                                <div className="mt-0.5">
                                  <div className={`w-10 h-10 rounded-lg ${!notification.is_read ? 'bg-gold-100 dark:bg-gold-950' : 'bg-muted'} flex items-center justify-center`}>
                                    <Icon className={`h-5 w-5 ${!notification.is_read ? 'text-gold-600' : 'text-muted-foreground'}`} />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''}`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                                {!notification.is_read && (
                                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                                )}
                              </DropdownMenuItem>
                            )
                          })}
                        </div>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer justify-center text-xs font-medium text-gold-600"
                          onClick={handleViewAll}
                        >
                          View All Notifications
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <style jsx>{`
                  @keyframes bell-ring {
                    0%, 100% { transform: rotate(0deg); }
                    10%, 30% { transform: rotate(14deg); }
                    20%, 40% { transform: rotate(-14deg); }
                    50% { transform: rotate(0deg); }
                  }
                  :global(.animate-bell-ring) {
                    animation: bell-ring 2s ease-in-out infinite;
                    transform-origin: 50% 0%;
                  }
                `}</style>
                
                <span className="hidden md:block text-sm text-muted-foreground">
                  {user?.full_name || user?.email}
                </span>
                <UserMenu user={user} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost">Login</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="gold">Get Started</Button>
                </SignUpButton>
              </div>
            )}

            {user && (
              <div className="flex items-center gap-2 md:hidden">
                <button
                  className="p-2"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {mobileMenuOpen && user && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between",
                  pathname === item.href
                    ? "bg-gold-100 text-gold-900 dark:bg-gold-900 dark:text-gold-100"
                    : "hover:bg-accent"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/notifications"
              className={cn(
                "block px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between",
                pathname === "/notifications"
                  ? "bg-gold-100 text-gold-900 dark:bg-gold-900 dark:text-gold-100"
                  : "hover:bg-accent"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

