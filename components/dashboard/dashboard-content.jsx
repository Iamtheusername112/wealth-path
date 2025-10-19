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
    <div className="container mx-auto px-4 py-8">
      {/* Account Deactivated Banner */}
      {!isAccountActive && (
        <div className="mb-6 rounded-lg border-2 border-red-600 bg-red-50 dark:bg-red-950/20 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-red-600 p-2">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-600 mb-2">Account Deactivated</h3>
              <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                Your account has been deactivated by an administrator. All features and transactions have been disabled.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-gold-600 hover:bg-gold-700"
                  onClick={() => setTicketModalOpen(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Request Reactivation
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  onClick={() => window.location.href = '/account-deactivated'}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-8 flex items-center gap-4">
        {(user.profileImageUrl || user.profile_image_url || user.imageUrl) && (
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold-600 shadow-lg">
            <img 
              src={user.profileImageUrl || user.profile_image_url || user.imageUrl} 
              alt={user.full_name || 'User'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null
                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-600 to-navy-800 text-white text-xl font-bold">' + (user.full_name?.[0] || 'U') + '</div>'
              }}
            />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.full_name || 'User'}!</h1>
          <p className="text-muted-foreground">Here's an overview of your financial activity</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-navy-700 to-navy-900 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-300">Available Balance</CardDescription>
            <CardTitle className="text-3xl text-white">
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
                  className="group flex items-center gap-2 w-full p-2 -ml-2 rounded hover:bg-white/10 transition-all"
                >
                  <p className="font-mono text-sm text-gold-400 font-semibold tracking-wider">
                    {user.account_number}
                  </p>
                  <svg 
                    className="h-4 w-4 text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <p className="text-[10px] text-gray-500 mt-1">Click to copy</p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mt-4">
              {!user.account_number && (
                <p className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded">
                  ⚠️ Account number not assigned yet
                </p>
              )}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="gold"
                  onClick={() => setAddFundsOpen(true)}
                  className="flex-1"
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
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
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
          <Card className="border-2 border-yellow-600/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-yellow-700 dark:text-yellow-400">Pending Deposits</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                {formatCurrency(pendingAmount)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-yellow-700 dark:text-yellow-400">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  <span>{pendingDeposits.length} awaiting approval</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your deposits will be added once approved by admin
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Investments</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {formatCurrency(totalInvestments)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground mt-4">
                <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                <span>{investments.length} active positions</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-green-600 flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                {formatCurrency(monthlyIncome)}
              </span>
              <span className="text-sm text-red-600 flex items-center">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                {formatCurrency(monthlyExpenses)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setTransferOpen(true)}
              className="w-full mt-4"
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
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <TransactionList transactions={recentTransactions} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm mt-1">Start by adding funds to your account</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setAddFundsOpen(true)}
                disabled={!isAccountActive}
                title={!isAccountActive ? "Account deactivated - contact support" : ""}
              >
                <Plus className="h-4 w-4 mr-2" />
                Deposit Funds
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setWithdrawOpen(true)}
                disabled={!isAccountActive}
                title={!isAccountActive ? "Account deactivated - contact support" : ""}
              >
                <Download className="h-4 w-4 mr-2" />
                Withdraw Money
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
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
                  className="w-full justify-start"
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
                  className="w-full justify-start"
                  disabled={!isAccountActive}
                  title={!isAccountActive ? "Account deactivated - contact support" : ""}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Explore Investments
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
    </div>
  )
}

