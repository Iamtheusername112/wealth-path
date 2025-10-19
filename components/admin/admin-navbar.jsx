"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Building2, LogOut, Shield, Bell, Settings, CreditCard, FileCheck, DollarSign, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AdminNavbar({ pendingKYC: initialPendingKYC = 0, pendingDeposits: initialPendingDeposits = 0, pendingCardRequests: initialPendingCardRequests = 0 }) {
  const router = useRouter()
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [pendingKYC, setPendingKYC] = useState(initialPendingKYC)
  const [pendingDeposits, setPendingDeposits] = useState(initialPendingDeposits)
  const [pendingCardRequests, setPendingCardRequests] = useState(initialPendingCardRequests)
  const [openSupportTickets, setOpenSupportTickets] = useState(0)
  
  const totalPending = pendingKYC + pendingDeposits + pendingCardRequests + openSupportTickets

  // Fetch pending counts
  const fetchPendingCounts = async () => {
    try {
      const response = await fetch('/api/admin/pending-counts')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPendingKYC(data.counts.pendingKYC)
          setPendingDeposits(data.counts.pendingDeposits)
          setPendingCardRequests(data.counts.pendingCardRequests)
          setOpenSupportTickets(data.counts.openSupportTickets)
        }
      }
    } catch (error) {
      console.error('Error fetching pending counts:', error)
    }
  }

  useEffect(() => {
    fetchPendingCounts()
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchPendingCounts()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success("Logged out successfully")
        router.push('/admin-login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleNavigation = (path) => {
    setNotificationOpen(false)
    window.location.href = path
  }

  return (
    <nav className="border-b bg-gradient-to-r from-navy-800 via-navy-900 to-navy-800 text-white sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Section */}
          <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-700 rounded-lg flex items-center justify-center shadow-lg">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-navy-900 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold text-white block leading-tight">CapitalPath</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gold-400 font-medium">Admin Portal</span>
                <Badge className="bg-gold-600 text-white text-[10px] px-1.5 py-0">PRO</Badge>
              </div>
            </div>
          </Link>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link 
              href="/admin" 
              className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Dashboard
            </Link>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/80">System Online</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Admin Badge */}
            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg border border-white/20">
              <Shield className="h-4 w-4 text-gold-400" />
              <span className="text-sm font-medium">Administrator</span>
            </div>

            {/* Notifications */}
            <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-white hover:bg-white/10"
                >
                  <Bell className={`h-5 w-5 ${totalPending > 0 ? 'animate-bell-ring' : ''}`} />
                  {totalPending > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center bg-red-500 text-white text-xs px-1 border-2 border-navy-900 animate-pulse"
                    >
                      {totalPending > 99 ? '99+' : totalPending}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
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
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Pending Actions</span>
                  {totalPending > 0 && (
                    <Badge variant="destructive">{totalPending} Total</Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {totalPending === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No pending actions</p>
                    <p className="text-xs mt-1">All caught up! 🎉</p>
                  </div>
                ) : (
                  <>
                    {openSupportTickets > 0 && (
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-start gap-3 p-3"
                        onClick={() => handleNavigation('/admin?tab=support')}
                      >
                        <div className="mt-0.5">
                          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-red-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Support Tickets</p>
                          <p className="text-xs text-muted-foreground">
                            {openSupportTickets} ticket{openSupportTickets === 1 ? '' : 's'} need attention
                          </p>
                        </div>
                        <Badge variant="destructive">
                          {openSupportTickets}
                        </Badge>
                      </DropdownMenuItem>
                    )}
                    
                    {pendingCardRequests > 0 && (
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-start gap-3 p-3"
                        onClick={() => handleNavigation('/admin?tab=cards')}
                      >
                        <div className="mt-0.5">
                          <div className="w-10 h-10 rounded-lg bg-gold-100 dark:bg-gold-950 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-gold-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Credit Card Requests</p>
                          <p className="text-xs text-muted-foreground">
                            {pendingCardRequests} request{pendingCardRequests === 1 ? '' : 's'} awaiting approval
                          </p>
                        </div>
                        <Badge variant="default" className="bg-gold-600">
                          {pendingCardRequests}
                        </Badge>
                      </DropdownMenuItem>
                    )}
                    
                    {pendingKYC > 0 && (
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-start gap-3 p-3"
                        onClick={() => handleNavigation('/admin?tab=kyc')}
                      >
                        <div className="mt-0.5">
                          <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-950 flex items-center justify-center">
                            <FileCheck className="h-5 w-5 text-yellow-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">KYC Verifications</p>
                          <p className="text-xs text-muted-foreground">
                            {pendingKYC} verification{pendingKYC === 1 ? '' : 's'} pending
                          </p>
                        </div>
                        <Badge variant="warning">
                          {pendingKYC}
                        </Badge>
                      </DropdownMenuItem>
                    )}
                    
                    {pendingDeposits > 0 && (
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-start gap-3 p-3"
                        onClick={() => handleNavigation('/admin?tab=deposits')}
                      >
                        <div className="mt-0.5">
                          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Deposit Requests</p>
                          <p className="text-xs text-muted-foreground">
                            {pendingDeposits} deposit{pendingDeposits === 1 ? '' : 's'} to review
                          </p>
                        </div>
                        <Badge variant="success">
                          {pendingDeposits}
                        </Badge>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer justify-center text-xs"
                      onClick={() => handleNavigation('/admin')}
                    >
                      View All in Dashboard
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />
            
            {/* Logout Button */}
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40 gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
