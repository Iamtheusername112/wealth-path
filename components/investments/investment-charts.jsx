"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

const COLORS = ['#ca8a04', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

export function InvestmentCharts({ investments }) {
  // Calculate portfolio growth over time (simulated monthly data)
  const generatePortfolioGrowth = () => {
    if (!investments || investments.length === 0) return []
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.initial_investment || inv.amount), 0)
    
    return months.map((month, index) => {
      const growthFactor = 1 + (index * 0.05) // 5% growth per month
      return {
        month,
        value: totalInvested * growthFactor,
        invested: totalInvested
      }
    })
  }

  // Calculate asset allocation
  const getAssetAllocation = () => {
    if (!investments || investments.length === 0) return []
    
    const categoryTotals = {}
    const categoryNames = {
      crypto: 'Cryptocurrency',
      stocks: 'Stocks',
      forex: 'Forex',
      commodities: 'Commodities',
      real_estate: 'Real Estate'
    }
    
    investments.forEach(inv => {
      const category = inv.category
      const amount = parseFloat(inv.amount || 0)
      categoryTotals[category] = (categoryTotals[category] || 0) + amount
    })
    
    return Object.entries(categoryTotals).map(([category, value]) => ({
      name: categoryNames[category] || category,
      value: value
    }))
  }

  // Calculate individual investment performance
  const getInvestmentPerformance = () => {
    if (!investments || investments.length === 0) return []
    
    return investments.slice(0, 5).map(inv => {
      const initial = parseFloat(inv.initial_investment || inv.amount)
      const current = parseFloat(inv.amount)
      const profit = current - initial
      const profitPercent = initial > 0 ? ((profit / initial) * 100).toFixed(2) : 0
      
      return {
        name: inv.asset_name.length > 15 ? inv.asset_name.substring(0, 15) + '...' : inv.asset_name,
        initial: initial,
        current: current,
        profit: profit,
        profitPercent: parseFloat(profitPercent)
      }
    })
  }

  const portfolioGrowth = generatePortfolioGrowth()
  const assetAllocation = getAssetAllocation()
  const investmentPerformance = getInvestmentPerformance()

  const totalValue = assetAllocation.reduce((sum, item) => sum + item.value, 0)

  if (!investments || investments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-1">No Investment Data</p>
            <p className="text-sm">Start investing to see your performance charts</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Growth</CardTitle>
          <CardDescription>Your portfolio value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={portfolioGrowth}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ca8a04" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ca8a04" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#ca8a04" 
                fillOpacity={1}
                fill="url(#colorValue)" 
                name="Portfolio Value"
              />
              <Line 
                type="monotone" 
                dataKey="invested" 
                stroke="#3b82f6" 
                strokeDasharray="5 5" 
                name="Amount Invested"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Asset Allocation Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Distribution across asset classes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {assetAllocation.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Individual Investment Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Investments</CardTitle>
            <CardDescription>Performance of your best holdings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={investmentPerformance}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="initial" stroke="#3b82f6" name="Initial" />
                <Line type="monotone" dataKey="current" stroke="#10b981" name="Current" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {investmentPerformance.map((inv, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                  <span className="font-medium">{inv.name}</span>
                  <div className="flex items-center gap-2">
                    {inv.profit >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={inv.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {inv.profitPercent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

