import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

export function PortfolioOverview({ investments, categories, totalInvested, portfolioValue }) {
  // Group investments by category
  const investmentsByCategory = categories.map(category => {
    const categoryInvestments = investments.filter(inv => inv.category === category.id)
    const totalAmount = categoryInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    const percentage = totalInvested > 0 ? (totalAmount / totalInvested) * 100 : 0
    
    return {
      ...category,
      investments: categoryInvestments,
      totalAmount,
      percentage
    }
  }).filter(cat => cat.totalAmount > 0)

  const portfolioChange = portfolioValue - totalInvested
  const isPositive = portfolioChange >= 0

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Your investment performance summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Total Return</p>
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="inline h-6 w-6 mr-2" /> : <TrendingDown className="inline h-6 w-6 mr-2" />}
                {isPositive ? '+' : ''}{formatCurrency(portfolioChange)}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Return Percentage</p>
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{((portfolioChange / totalInvested) * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allocation by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>Your portfolio distribution across asset classes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {investmentsByCategory.length > 0 ? (
            investmentsByCategory.map(category => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <category.icon className={`h-5 w-5 ${category.color}`} />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(category.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gold-600 h-2 rounded-full transition-all"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No investments yet</p>
              <p className="text-sm mt-1">Start investing in different asset classes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Investments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Investments</CardTitle>
          <CardDescription>Your latest investment activities</CardDescription>
        </CardHeader>
        <CardContent>
          {investments.length > 0 ? (
            <div className="space-y-3">
              {investments.slice(0, 5).map(investment => {
                const category = categories.find(c => c.id === investment.category)
                return (
                  <div key={investment.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {category && <category.icon className={`h-5 w-5 ${category.color}`} />}
                      <div>
                        <p className="font-medium">{investment.asset_name}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(investment.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(parseFloat(investment.amount))}</p>
                      <Badge variant={investment.status === 'active' ? 'success' : 'secondary'}>
                        {investment.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No investments yet</p>
              <p className="text-sm mt-1">Explore opportunities in different categories</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

