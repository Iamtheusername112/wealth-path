"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, Menu, X, Bell, CheckCircle2, Clock, DollarSign, CreditCard, TrendingUp, Settings, LogOut } from "lucide-react"
import { Button } from "./ui/button"
import { ThemeToggle } from "./theme-toggle"
import { UserMenu } from "./user-menu"
import { Badge } from "./ui/badge"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { SignInButton, SignUpButton, SignOutButton } from "@clerk/nextjs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { MobileNav } from "@/components/mobile-nav"

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
      if (countResponse.ok) {
        const countData = await countResponse.json()
        if (countData.success) {
          setUnreadCount(countData.count || 0)
        }
      } else {
        console.warn('Failed to fetch notification count:', countResponse.status)
      }

      // Fetch recent notifications
      const notifResponse = await fetch('/api/notifications/recent')
      if (notifResponse.ok) {
        const notifData = await notifResponse.json()
        if (notifData.success) {
          setNotifications(notifData.notifications || [])
        }
      } else {
        console.warn('Failed to fetch notifications:', notifResponse.status)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Set defaults on error to prevent UI issues
      setUnreadCount(0)
      setNotifications([])
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
    <React.Fragment>
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 safe-area-top">
        <div className="container mx-auto px-4">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-8">
              <Link href="/" className="flex items-center gap-2">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-gold-600" />
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-navy-700 to-gold-600 bg-clip-text text-transparent">
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

            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              
              {user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Notification Bell Dropdown - Desktop Only */}
                  <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative hidden md:flex h-9 w-9"
                      >
                        <Bell className={`h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-gold-600 transition-colors ${unreadCount > 0 ? 'animate-bell-ring' : ''}`} />
                        {unreadCount > 0 && (
                          <Badge 
                            className="absolute -top-1 -right-1 h-4 min-w-[16px] flex items-center justify-center bg-red-500 text-white text-xs px-1 animate-pulse"
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
                  <div className="hidden md:block">
                    <UserMenu user={user} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm" className="hidden sm:flex">Login</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button variant="gold" size="sm">Get Started</Button>
                  </SignUpButton>
                </div>
              )}

              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[85%] max-w-sm p-0">
          <SheetHeader className="p-4 sm:p-6 border-b safe-area-top">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          <div className="flex flex-col h-full">

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* User Profile */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-center gap-3">
                  {user && (user.profileImageUrl || user.profile_image_url || user.imageUrl) && (
                    <img 
                      src={user.profileImageUrl || user.profile_image_url || user.imageUrl} 
                      alt={user?.full_name || 'User'}
                      className="w-16 h-16 rounded-full object-cover border-4 border-gold-600 shadow-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg">{user?.full_name || 'User'}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3 mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Quick Actions</h3>
                
                {/* Notifications with Preview */}
                <Link
                  href="/notifications"
                  className={cn(
                    "block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 hover:scale-[1.02]",
                    pathname === "/notifications"
                      ? "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg"
                      : "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/40 dark:hover:to-blue-800/40"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 dark:bg-black/20 rounded-lg">
                        <Bell className="h-5 w-5" />
                      </div>
                      <span>Notifications</span>
                    </span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="animate-pulse">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                </Link>

                {/* Recent Notifications Preview */}
                {notifications.length > 0 && (
                  <div className="ml-4 space-y-2 pl-4 border-l-2 border-gold-600/30">
                    {notifications.slice(0, 3).map((notification) => {
                      const Icon = getNotificationIcon(notification.message)
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "px-3 py-2 rounded-lg text-xs cursor-pointer transition-all hover:scale-[1.02]",
                            !notification.is_read 
                              ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800' 
                              : 'bg-muted/50 hover:bg-muted'
                          )}
                          onClick={() => {
                            handleNotificationClick(notification.id)
                            setMobileMenuOpen(false)
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <Icon className="h-4 w-4 mt-0.5 text-gold-600 flex-shrink-0" />
                            <p className="flex-1 line-clamp-2 leading-relaxed">{notification.message}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Settings & Logout */}
              <div className="pt-6 border-t space-y-2 safe-area-bottom">
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-accent transition-all duration-200 min-h-[44px] min-w-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-5 w-5 text-yellow-600" />
                  <span>Settings</span>
                </Link>
                
                <SignOutButton>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 min-h-[44px] min-w-[44px]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Log Out</span>
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {user && <MobileNav user={user} unreadCount={unreadCount} />}
    </React.Fragment>
  )
}

