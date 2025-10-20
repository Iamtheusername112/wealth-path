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
              <div className="mb-8">
                <div className="flex flex-col items-center text-center gap-4">
                  {user && (user.profileImageUrl || user.profile_image_url || user.imageUrl) && (
                    <img 
                      src={user.profileImageUrl || user.profile_image_url || user.imageUrl} 
                      alt={user?.full_name || 'User'}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gold-600 shadow-2xl"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xl mb-1">{user?.full_name || 'User'}</p>
                    <p className="text-sm text-muted-foreground truncate px-4">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="space-y-3 safe-area-bottom">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-4">Account</h3>
                
                <Link
                  href="/settings"
                  className="flex items-center gap-4 px-5 py-4 rounded-xl text-base font-medium bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] min-h-[56px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="p-2 bg-yellow-600 rounded-lg">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <span className="flex-1">Settings</span>
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <SignOutButton>
                  <button
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-base font-medium bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-800/30 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] min-h-[56px] text-red-600 dark:text-red-400"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="p-2 bg-red-600 rounded-lg">
                      <LogOut className="h-5 w-5 text-white" />
                    </div>
                    <span className="flex-1 text-left font-semibold">Log Out</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
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

