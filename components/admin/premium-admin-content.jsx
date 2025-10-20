"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  Users, 
  FileCheck, 
  DollarSign, 
  TrendingUp,
  Shield,
  Activity,
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Filter,
  Trash2,
  AlertTriangle,
  Hash,
  CreditCard,
  MessageSquare
} from "lucide-react"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import { KYCManagement } from "./kyc-management"
import { TransactionManagement } from "./transaction-management"
import { AssignAccountModal } from "./assign-account-modal"
import { PendingDeposits } from "./pending-deposits"
import { CardRequestManagement } from "./card-request-management"
import { UserManagement } from "./user-management"
import { SupportTicketManagement } from "./support-ticket-management"
import { BalanceManagement } from "./balance-management"
import { InvestmentManagement } from "./investment-management"
import { motion } from "framer-motion"
import { toast } from "sonner"

export function PremiumAdminContent({ users, kycDocuments, transactions, investments, depositRequests, cardRequests, supportTickets }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [usersList, setUsersList] = useState(users)
  const [assignAccountOpen, setAssignAccountOpen] = useState(false)

  // Handle tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'users', 'balance', 'manage-investments', 'kyc', 'deposits', 'transactions', 'investments', 'cards'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleUserUpdate = () => {
    // Refresh the page to get updated user data
    window.location.reload()
  }

  const stats = {
    totalUsers: users.length,
    pendingKYC: users.filter(u => u.kyc_status === 'pending').length,
    approvedKYC: users.filter(u => u.kyc_status === 'approved').length,
    pendingDeposits: depositRequests?.filter(d => d.status === 'pending').length || 0,
    pendingCardRequests: cardRequests?.filter(c => c.status === 'pending').length || 0,
    rejectedKYC: users.filter(u => u.kyc_status === 'rejected').length,
    totalBalance: users.reduce((sum, u) => sum + parseFloat(u.balance || 0), 0),
    totalTransactions: transactions.length,
    totalInvestments: investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
    activeInvestments: investments.filter(inv => inv.status === 'active').length,
    todayTransactions: transactions.filter(t => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return new Date(t.created_at) >= today
    }).length,
    weeklyRevenue: transactions
      .filter(t => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return new Date(t.created_at) >= weekAgo
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0),
  }

  const recentUsers = users.slice(0, 5)
  const recentTransactions = transactions.slice(0, 8)
  const pendingKYCUsers = users.filter(u => u.kyc_status === 'pending').slice(0, 5)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    
    setDeleting(true)
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userToDelete.id }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`User ${userToDelete.email} deleted successfully`)
        setDeleteConfirmOpen(false)
        setUserToDelete(null)
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Delete user error:', error)
      toast.error('An error occurred')
    } finally {
      setDeleting(false)
    }
  }

  const confirmDelete = (user) => {
    setUserToDelete(user)
    setDeleteConfirmOpen(true)
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2 hover:border-gold-600 transition-all hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              <h3 className="text-3xl font-bold mb-2">{value}</h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  {trend && trend > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : trend && trend < 0 ? (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  ) : null}
                  {subtitle}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-600 to-gold-700 rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="h-7 w-7 text-white" />
            </div>
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Platform overview and management controls
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setAssignAccountOpen(true)}
            className="gap-2"
          >
            <Hash className="h-4 w-4" />
            Assign Account Number
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="gold" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers}
          subtitle={`${stats.approvedKYC} verified`}
          color="blue"
        />
        <StatCard
          icon={FileCheck}
          title="Pending KYC"
          value={stats.pendingKYC}
          subtitle={stats.pendingKYC > 0 ? "Requires attention" : "All clear"}
          color="yellow"
        />
        <StatCard
          icon={DollarSign}
          title="Platform Balance"
          value={formatCurrency(stats.totalBalance)}
          subtitle={`${stats.todayTransactions} today`}
          trend={1}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          title="Total Investments"
          value={formatCurrency(stats.totalInvestments)}
          subtitle={`${stats.activeInvestments} active`}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start bg-muted/50 p-1 overflow-x-auto">
          <TabsTrigger value="overview" active={activeTab === "overview"} className="gap-2 flex-shrink-0">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" active={activeTab === "users"} className="gap-2 flex-shrink-0">
            <Users className="h-4 w-4" />
            Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="balance" active={activeTab === "balance"} className="gap-2 flex-shrink-0">
            <DollarSign className="h-4 w-4" />
            Balance Control
          </TabsTrigger>
          <TabsTrigger value="manage-investments" active={activeTab === "manage-investments"} className="gap-2 flex-shrink-0">
            <TrendingUp className="h-4 w-4" />
            Manage Investments
          </TabsTrigger>
          <TabsTrigger value="kyc" active={activeTab === "kyc"} className="gap-2 flex-shrink-0">
            <FileCheck className="h-4 w-4" />
            KYC ({stats.pendingKYC})
          </TabsTrigger>
          <TabsTrigger value="deposits" active={activeTab === "deposits"} className="gap-2 flex-shrink-0">
            <DollarSign className="h-4 w-4" />
            Deposits ({stats.pendingDeposits})
          </TabsTrigger>
          <TabsTrigger value="transactions" active={activeTab === "transactions"} className="gap-2 flex-shrink-0">
            <Activity className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="investments" active={activeTab === "investments"} className="gap-2 flex-shrink-0">
            <TrendingUp className="h-4 w-4" />
            Investment Overview
          </TabsTrigger>
          <TabsTrigger value="cards" active={activeTab === "cards"} className="gap-2 flex-shrink-0">
            <CreditCard className="h-4 w-4" />
            Cards
            {stats.pendingCardRequests > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {stats.pendingCardRequests}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="support" active={activeTab === "support"} className="gap-2 flex-shrink-0">
            <MessageSquare className="h-4 w-4" />
            Support
            {(supportTickets?.filter(t => t.status === 'open' || t.status === 'in_progress').length || 0) > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {supportTickets?.filter(t => t.status === 'open' || t.status === 'in_progress').length || 0}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pending Actions Alerts */}
              {(stats.pendingKYC > 0 || stats.pendingDeposits > 0 || stats.pendingCardRequests > 0) && (
                <div className="space-y-4">
                  {stats.pendingCardRequests > 0 && (
                    <Card className="border-l-4 border-l-gold-600">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gold-700 dark:text-gold-500">
                          <CreditCard className="h-5 w-5" />
                          Credit Card Requests Pending
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {stats.pendingCardRequests} credit card request{stats.pendingCardRequests === 1 ? '' : 's'} awaiting approval
                        </p>
                        <Button 
                          variant="gold" 
                          size="sm"
                          onClick={() => setActiveTab("cards")}
                        >
                          Review Requests
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                  {stats.pendingKYC > 0 && (
                    <Card className="border-l-4 border-l-yellow-600">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                          <AlertCircle className="h-5 w-5" />
                          KYC Verification Required
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">
                          {stats.pendingKYC} user{stats.pendingKYC !== 1 ? 's' : ''} waiting for KYC verification
                        </p>
                        <Button 
                          variant="gold" 
                          size="sm"
                          onClick={() => setActiveTab('kyc')}
                        >
                          Review KYC →
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {stats.pendingDeposits > 0 && (
                    <Card className="border-l-4 border-l-blue-600">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-500">
                          <DollarSign className="h-5 w-5" />
                          Deposit Approvals Needed
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">
                          {stats.pendingDeposits} deposit request{stats.pendingDeposits !== 1 ? 's' : ''} awaiting approval
                        </p>
                        <Button 
                          variant="gold" 
                          size="sm"
                          onClick={() => setActiveTab('deposits')}
                        >
                          Review Deposits →
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {recentTransactions.map((transaction) => {
                        const user = users.find(u => u.id === transaction.user_id)
                        return (
                          <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                transaction.type === 'deposit' ? 'bg-green-500' :
                                transaction.type === 'withdrawal' ? 'bg-red-500' :
                                'bg-blue-500'
                              }`} />
                              <div>
                                <p className="text-sm font-medium">{user?.full_name || user?.email || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {transaction.type} • {formatDateTime(transaction.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(parseFloat(transaction.amount))}</p>
                              <Badge variant={transaction.status === 'completed' ? 'success' : 'pending'} className="text-xs">
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No transactions yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Platform Health */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    Platform Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">System</span>
                    <Badge variant="success">Operational</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database</span>
                    <Badge variant="success">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage</span>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Auth</span>
                    <Badge variant="success">Online</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">KYC Reviews</span>
                    </div>
                    <Badge variant="warning">{stats.pendingKYC}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Today's Activity</span>
                    </div>
                    <Badge>{stats.todayTransactions}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Sign-Ups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-white font-semibold text-sm">
                          {user.full_name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.full_name || 'Unnamed'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Badge 
                          variant={
                            user.kyc_status === 'approved' ? 'success' : 
                            user.kyc_status === 'pending' ? 'warning' : 
                            'destructive'
                          }
                          className="text-xs"
                        >
                          {user.kyc_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <UserManagement users={users} onUserUpdate={handleUserUpdate} />
        </TabsContent>

        {/* Balance Control Tab */}
        <TabsContent value="balance">
          <BalanceManagement users={users} />
        </TabsContent>

        {/* Manage Investments Tab */}
        <TabsContent value="manage-investments">
          <InvestmentManagement users={users} investments={investments} />
        </TabsContent>

        {/* KYC Tab */}
        <TabsContent value="kyc">
          <KYCManagement users={users} kycDocuments={kycDocuments} />
        </TabsContent>

        {/* Deposits Tab */}
        <TabsContent value="deposits">
          <PendingDeposits deposits={depositRequests || []} users={users} />
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <TransactionManagement transactions={transactions} users={users} />
        </TabsContent>

        {/* Investments Tab */}
        <TabsContent value="investments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Investment Overview</CardTitle>
                  <CardDescription>All platform investments and portfolio management</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.totalInvestments)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Investment Categories Breakdown */}
              <div className="grid md:grid-cols-5 gap-4 mb-6">
                {['crypto', 'stocks', 'forex', 'commodities', 'real_estate'].map(category => {
                  const categoryInvestments = investments.filter(inv => inv.category === category)
                  const categoryTotal = categoryInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
                  const icons = {
                    crypto: '💰',
                    stocks: '📈',
                    forex: '💱',
                    commodities: '🏅',
                    real_estate: '🏘️'
                  }
                  return (
                    <Card key={category} className="text-center">
                      <CardContent className="p-4">
                        <div className="text-2xl mb-2">{icons[category]}</div>
                        <p className="text-xs text-muted-foreground capitalize mb-1">{category.replace('_', ' ')}</p>
                        <p className="font-bold text-sm">{formatCurrency(categoryTotal)}</p>
                        <p className="text-xs text-muted-foreground">{categoryInvestments.length} positions</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Investment List */}
              <div className="space-y-3">
                {investments.slice(0, 10).map((investment) => {
                  const user = users.find(u => u.id === investment.user_id)
                  return (
                    <div key={investment.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {investment.category === 'crypto' && '💰'}
                          {investment.category === 'stocks' && '📈'}
                          {investment.category === 'forex' && '💱'}
                          {investment.category === 'commodities' && '🏅'}
                          {investment.category === 'real_estate' && '🏘️'}
                        </div>
                        <div>
                          <p className="font-medium">{investment.asset_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user?.full_name || user?.email || 'Unknown User'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(parseFloat(investment.amount))}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(investment.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {investments.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-1">No investments yet</p>
                  <p className="text-sm">Investment activity will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards">
          <CardRequestManagement />
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support">
          <SupportTicketManagement initialTickets={supportTickets || []} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent onClose={() => setDeleteConfirmOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              Confirm User Deletion
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the user and all associated data.
            </DialogDescription>
          </DialogHeader>

          {userToDelete && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <p className="font-semibold mb-2">User to be deleted:</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {userToDelete.full_name || 'Unnamed'}</p>
                  <p><strong>Email:</strong> {userToDelete.email}</p>
                  <p><strong>Balance:</strong> {formatCurrency(parseFloat(userToDelete.balance || 0))}</p>
                  <p><strong>KYC Status:</strong> {userToDelete.kyc_status}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  ⚠️ What will be deleted:
                </p>
                <ul className="text-sm space-y-1 text-yellow-800 dark:text-yellow-200">
                  <li>• User account and profile</li>
                  <li>• All transactions history</li>
                  <li>• All investment records</li>
                  <li>• All notifications</li>
                  <li>• KYC documents and uploads</li>
                  <li>• Profile photo and ID documents</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Yes, Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Account Number Modal */}
      <AssignAccountModal
        open={assignAccountOpen}
        onOpenChange={setAssignAccountOpen}
        users={users}
      />
    </div>
  )
}

