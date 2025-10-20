"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Send,
  Download,
  CreditCard,
  AlertTriangle,
  MessageSquare
} from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { AddFundsModal } from "./add-funds-modal"
import { WithdrawModal } from "./withdraw-modal"
import { TransferModal } from "./transfer-modal"
import { TransactionList } from "./transaction-list"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { SupportTicketModal } from "@/components/support/support-ticket-modal"
import { MobileTestHelper } from "@/components/mobile-test-helper"

export function DashboardContent({ user, transactions, investments, depositRequests }) {
  const [addFundsOpen, setAddFundsOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [ticketModalOpen, setTicketModalOpen] = useState(false)
  
  // Check if user account is active
  const isAccountActive = user?.status === 'active'
  
  const pendingDeposits = depositRequests?.filter(d => d.status === 'pending') || []
  const pendingAmount = pendingDeposits.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)

  const totalInvestments = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
  
  const recentTransactions = transactions.slice(0, 5)

  // Calculate income and expenses for this month
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const monthlyIncome = transactions
    .filter(t => t.type === 'deposit' && new Date(t.created_at) >= firstDayOfMonth)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  
  const monthlyExpenses = transactions
    .filter(t => (t.type === 'withdrawal' || t.type === 'transfer') && new Date(t.created_at) >= firstDayOfMonth)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 pb-20 sm:pb-8">
      {/* Account Deactivated Banner */}
      {!isAccountActive && (
        <div className="mb-6 rounded-xl border-2 border-red-600 bg-red-50 dark:bg-red-950/20 p-4 sm:p-6 shadow-lg shadow-black/10">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="rounded-full bg-red-600 p-2 flex-shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-red-600 mb-2">Account Deactivated</h3>
              <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                Your account has been deactivated by an administrator. All features and transactions have been disabled.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  variant="default" 
                  size="sm"
                  className="h-12 px-6 text-base font-medium rounded-xl transition-all duration-200 active:scale-95 bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800 w-full sm:w-auto"
                  onClick={() => setTicketModalOpen(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Request Reactivation
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-600 text-red-600 hover:bg-red-50 w-full sm:w-auto"
                  onClick={() => window.location.href = '/account-deactivated'}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
        {(user.profileImageUrl || user.profile_image_url || user.imageUrl) && (
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-gold-600 shadow-lg flex-shrink-0">
            <img 
              src={user.profileImageUrl || user.profile_image_url || user.imageUrl} 
              alt={user.full_name || 'User'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null
                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-600 to-navy-800 text-white text-lg sm:text-xl font-bold">' + (user.full_name?.[0] || 'U') + '</div>'
              }}
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 truncate">Welcome back, {user.full_name || 'User'}!</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Here's an overview of your financial activity</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 text-white border-0 shadow-xl shadow-black/20 col-span-1 sm:col-span-1">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-gray-300 text-sm sm:text-base">Available Balance</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl text-white">
              {formatCurrency(parseFloat(user.balance))}
            </CardTitle>
            {user.account_number && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-xs text-gray-400 mb-1">Your Account Number</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(user.account_number)
                    toast.success('Account number copied!', {
                      description: user.account_number
                    })
                  }}
                  className="group flex items-center gap-2 w-full p-2 -ml-2 rounded-lg hover:bg-white/10 transition-all duration-200 min-h-[44px] min-w-[44px]"
                >
                  <p className="font-mono text-xs sm:text-sm text-yellow-400 font-semibold tracking-wider truncate">
                    {user.account_number}
                  </p>
                  <svg 
                    className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <p className="text-[10px] text-gray-500 mt-1">Tap to copy</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-2 mt-4">
              {!user.account_number && (
                <p className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded-lg">
                  ⚠️ Account number not assigned yet
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  size="sm" 
                  variant="gold"
                  onClick={() => setAddFundsOpen(true)}
                  className="flex-1 h-12 px-6 text-base font-medium rounded-xl transition-all duration-200 active:scale-95 bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800"
                  disabled={!user.account_number || !isAccountActive}
                  title={!user.account_number ? "Account number required" : !isAccountActive ? "Account deactivated - contact support" : ""}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Funds
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setWithdrawOpen(true)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex-1"
                  disabled={!isAccountActive}
                  title={!isAccountActive ? "Account deactivated - contact support" : ""}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Withdraw
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {pendingDeposits.length > 0 ? (
          <Card className="border-2 border-yellow-600/50 bg-yellow-50 dark:bg-yellow-950/20 shadow-lg shadow-black/10">
            <CardHeader className="pb-2 p-4 sm:p-6">
              <CardDescription className="text-yellow-700 dark:text-yellow-400 text-sm sm:text-base">Pending Deposits</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-yellow-600">
                {formatCurrency(pendingAmount)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-yellow-700 dark:text-yellow-400">
                  <ArrowDownRight className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>{pendingDeposits.length} awaiting approval</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your deposits will be added once approved by admin
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg shadow-black/10">
            <CardHeader className="pb-2 p-4 sm:p-6">
              <CardDescription className="text-sm sm:text-base">Total Investments</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-green-600">
                {formatCurrency(totalInvestments)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center text-sm text-muted-foreground mt-4">
                <TrendingUp className="h-4 w-4 mr-1 text-green-600 flex-shrink-0" />
                <span>{investments.length} active positions</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg shadow-black/10">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-sm sm:text-base">This Month</CardDescription>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
              <span className="text-sm text-green-600 flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1 flex-shrink-0" />
                {formatCurrency(monthlyIncome)}
              </span>
              <span className="text-sm text-red-600 flex items-center">
                <ArrowDownRight className="h-4 w-4 mr-1 flex-shrink-0" />
                {formatCurrency(monthlyExpenses)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setTransferOpen(true)}
              className="w-full mt-4 h-12 px-6 text-base font-medium rounded-xl transition-all duration-200 active:scale-95 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              disabled={!isAccountActive}
              title={!isAccountActive ? "Account deactivated - contact support" : ""}
            >
              <Send className="h-4 w-4 mr-1" />
              Transfer Money
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg shadow-black/10">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Recent Transactions</CardTitle>
              <CardDescription className="text-sm sm:text-base">Your latest financial activity</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {recentTransactions.length > 0 ? (
                <TransactionList transactions={recentTransactions} />
              ) : (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <Wallet className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">No transactions yet</p>
                  <p className="text-xs sm:text-sm mt-1">Start by adding funds to your account</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card className="shadow-lg shadow-black/10">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
              <CardDescription className="text-sm sm:text-base">Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start h-12 px-6 text-base font-medium rounded-xl transition-all duration-200 active:scale-95 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 min-h-[44px] min-w-[44px]"
                onClick={() => setAddFundsOpen(true)}
                disabled={!isAccountActive}
                title={!isAccountActive ? "Account deactivated - contact support" : ""}
              >
                <Plus className="h-4 w-4 mr-2" />
                Deposit Funds
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-12 px-6 text-base font-medium rounded-xl transition-all duration-200 active:scale-95 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 min-h-[44px] min-w-[44px]"
                onClick={() => setWithdrawOpen(true)}
                disabled={!isAccountActive}
                title={!isAccountActive ? "Account deactivated - contact support" : ""}
              >
                <Download className="h-4 w-4 mr-2" />
                Withdraw Money
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-12 px-6 text-base font-medium rounded-xl transition-all duration-200 active:scale-95 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 min-h-[44px] min-w-[44px]"
                onClick={() => setTransferOpen(true)}
                disabled={!isAccountActive}
                title={!isAccountActive ? "Account deactivated - contact support" : ""}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Transfer
              </Button>
              <a href={isAccountActive ? "/cards" : "#"} onClick={(e) => !isAccountActive && e.preventDefault()}>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 px-6 text-base font-medium rounded-xl transition-all duration-200 active:scale-95 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 min-h-[44px] min-w-[44px]"
                  disabled={!isAccountActive}
                  title={!isAccountActive ? "Account deactivated - contact support" : ""}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  My Credit Cards
                </Button>
              </a>
              <a href={isAccountActive ? "/investments" : "#"} onClick={(e) => !isAccountActive && e.preventDefault()}>
                <Button 
                  variant="gold" 
                  className="w-full justify-start h-12 px-6 text-base font-medium rounded-xl transition-all duration-200 active:scale-95 bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800 min-h-[44px] min-w-[44px]"
                  disabled={!isAccountActive}
                  title={!isAccountActive ? "Account deactivated - contact support" : ""}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Explore Investments
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="shadow-lg shadow-black/10">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">KYC Status</span>
                <Badge variant="success">Verified</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Account Type</span>
                <Badge>Premium</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm">{new Date(user.created_at).getFullYear()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AddFundsModal 
        open={addFundsOpen} 
        onOpenChange={setAddFundsOpen}
        userId={user.id}
        userAccountNumber={user.account_number}
      />
      <WithdrawModal 
        open={withdrawOpen} 
        onOpenChange={setWithdrawOpen}
        userId={user.id}
        currentBalance={parseFloat(user.balance)}
      />
      <TransferModal 
        open={transferOpen}
        onOpenChange={setTransferOpen}
        userId={user.id}
        currentBalance={parseFloat(user.balance)}
      />
      <SupportTicketModal 
        open={ticketModalOpen}
        onOpenChange={setTicketModalOpen}
        userId={user.id}
        defaultCategory="account_reactivation"
        defaultSubject="Request to Reactivate My Account"
      />
      
      {/* Mobile Test Helper - Only in development */}
      {process.env.NODE_ENV === 'development' && <MobileTestHelper />}
    </div>
  )
}

