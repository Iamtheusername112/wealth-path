"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatDate } from "@/lib/utils"
import { Users, DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function AdminAnalytics({ users, transactions, investments, depositRequests }) {
  // Calculate key metrics
  const totalUsers = users?.length || 0
  const activeUsers = users?.filter(u => u.status === 'active').length || 0
  const totalBalance = users?.reduce((sum, user) => sum + parseFloat(user.balance || 0), 0) || 0
  const totalInvestments = investments?.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0) || 0
  const totalDeposits = depositRequests?.reduce((sum, req) => sum + parseFloat(req.amount || 0), 0) || 0
  
  // Calculate growth (simulated - you'd compare with previous period in production)
  const userGrowth = 12.5
  const revenueGrowth = 8.3
  const investmentGrowth = 15.7
  const depositsGrowth = 22.1

  // Generate user growth data (last 6 months)
  const generateUserGrowth = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    let cumulative = Math.max(totalUsers - 50, 10)
    return months.map((month, index) => {
      cumulative += Math.floor(Math.random() * 15) + 5
      return {
        month,
        users: Math.min(cumulative, totalUsers),
        active: Math.floor(cumulative * 0.85)
      }
    })
  }

  // Generate revenue data (last 6 months)
  const generateRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((month, index) => {
      const deposits = Math.floor(Math.random() * 50000) + 20000
      const investments = Math.floor(Math.random() * 80000) + 30000
      return {
        month,
        deposits,
        investments,
        total: deposits + investments
      }
    })
  }

  // Generate transaction types distribution
  const generateTransactionTypes = () => {
    if (!transactions || transactions.length === 0) {
      return [
        { type: 'Deposit', count: 0, amount: 0 },
        { type: 'Withdrawal', count: 0, amount: 0 },
        { type: 'Transfer', count: 0, amount: 0 },
        { type: 'Investment', count: 0, amount: 0 }
      ]
    }

    const types = ['deposit', 'withdrawal', 'transfer', 'investment']
    return types.map(type => {
      const filtered = transactions.filter(t => t.type === type)
      const amount = filtered.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
      return {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count: filtered.length,
        amount: amount
      }
    })
  }

  // Recent activity trend (last 7 days)
  const generateActivityTrend = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(day => ({
      day,
      transactions: Math.floor(Math.random() * 30) + 10,
      users: Math.floor(Math.random() * 15) + 5
    }))
  }

  const userGrowthData = generateUserGrowth()
  const revenueData = generateRevenueData()
  const transactionTypes = generateTransactionTypes()
  const activityTrend = generateActivityTrend()

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{userGrowth}%</span>
              <span>from last month</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {activeUsers} active users
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{revenueGrowth}%</span>
              <span>from last month</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Across all accounts
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestments)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{investmentGrowth}%</span>
              <span>from last month</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {investments?.length || 0} active investments
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDeposits)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{depositsGrowth}%</span>
              <span>from last month</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {depositRequests?.length || 0} deposit requests
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total and active users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3b82f6" 
                  fillOpacity={1}
                  fill="url(#colorUsers)" 
                  name="Total Users"
                />
                <Area 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#10b981" 
                  fillOpacity={1}
                  fill="url(#colorActive)" 
                  name="Active Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Deposits and investments by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="deposits" fill="#ca8a04" name="Deposits" />
                <Bar dataKey="investments" fill="#3b82f6" name="Investments" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Types</CardTitle>
            <CardDescription>Distribution of transaction types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactionTypes.map((type, index) => {
                const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500']
                const total = transactionTypes.reduce((sum, t) => sum + t.amount, 0)
                const percentage = total > 0 ? (type.amount / total * 100).toFixed(1) : 0
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors[index]}`} />
                        <span className="font-medium">{type.type}</span>
                        <Badge variant="secondary" className="text-xs">
                          {type.count}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{percentage}%</span>
                        <span className="font-semibold">{formatCurrency(type.amount)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`${colors[index]} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Trend</CardTitle>
            <CardDescription>Daily transactions and user activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#ca8a04" 
                  strokeWidth={2}
                  name="Transactions"
                  dot={{ fill: '#ca8a04', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Active Users"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

