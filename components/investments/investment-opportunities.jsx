import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Mock investment opportunities for each category
const opportunities = {
  crypto: [
    { id: 1, name: "Bitcoin", symbol: "BTC", price: 45000, change: 5.2, trend: "up", risk: "High" },
    { id: 2, name: "Ethereum", symbol: "ETH", price: 3200, change: 3.8, trend: "up", risk: "High" },
    { id: 3, name: "Cardano", symbol: "ADA", price: 1.25, change: -2.1, trend: "down", risk: "Medium" },
    { id: 4, name: "Solana", symbol: "SOL", price: 98, change: 7.5, trend: "up", risk: "High" },
  ],
  stocks: [
    { id: 1, name: "Apple Inc.", symbol: "AAPL", price: 178, change: 1.2, trend: "up", risk: "Low" },
    { id: 2, name: "Microsoft", symbol: "MSFT", price: 385, change: 0.8, trend: "up", risk: "Low" },
    { id: 3, name: "Tesla", symbol: "TSLA", price: 242, change: -1.5, trend: "down", risk: "Medium" },
    { id: 4, name: "Amazon", symbol: "AMZN", price: 156, change: 2.3, trend: "up", risk: "Low" },
  ],
  forex: [
    { id: 1, name: "EUR/USD", symbol: "EURUSD", price: 1.08, change: 0.3, trend: "up", risk: "Medium" },
    { id: 2, name: "GBP/USD", symbol: "GBPUSD", price: 1.27, change: -0.2, trend: "down", risk: "Medium" },
    { id: 3, name: "USD/JPY", symbol: "USDJPY", price: 148.5, change: 0.5, trend: "up", risk: "Medium" },
    { id: 4, name: "AUD/USD", symbol: "AUDUSD", price: 0.66, change: 0.8, trend: "up", risk: "Medium" },
  ],
  commodities: [
    { id: 1, name: "Gold", symbol: "XAUUSD", price: 2050, change: 1.5, trend: "up", risk: "Low" },
    { id: 2, name: "Silver", symbol: "XAGUSD", price: 24.5, change: 2.1, trend: "up", risk: "Medium" },
    { id: 3, name: "Crude Oil", symbol: "WTI", price: 78, change: -0.9, trend: "down", risk: "High" },
    { id: 4, name: "Natural Gas", symbol: "NG", price: 2.8, change: 3.2, trend: "up", risk: "High" },
  ],
  real_estate: [
    { id: 1, name: "Vanguard Real Estate ETF", symbol: "VNQ", price: 85, change: 1.8, trend: "up", risk: "Low" },
    { id: 2, name: "American Tower", symbol: "AMT", price: 195, change: 0.5, trend: "up", risk: "Low" },
    { id: 3, name: "Prologis", symbol: "PLD", price: 128, change: 1.2, trend: "up", risk: "Low" },
    { id: 4, name: "Simon Property Group", symbol: "SPG", price: 142, change: -0.3, trend: "down", risk: "Medium" },
  ],
}

export function InvestmentOpportunities({ category, userInvestments, onInvest, userBalance, isAccountActive = true }) {
  const categoryOpportunities = opportunities[category.id] || []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <category.icon className={`h-6 w-6 ${category.color}`} />
                {category.name}
              </CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-xl font-semibold">{formatCurrency(userBalance)}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* User's Current Investments */}
      {userInvestments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your {category.name} Positions</CardTitle>
            <CardDescription>Currently active investments in this category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {userInvestments.map(investment => (
                <div key={investment.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{investment.asset_name}</h4>
                    <Badge variant={investment.status === 'active' ? 'success' : 'secondary'}>
                      {investment.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Invested</span>
                      <span className="font-medium">{formatCurrency(parseFloat(investment.amount))}</span>
                    </div>
                    {investment.quantity && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-medium">{parseFloat(investment.quantity).toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Available Opportunities</CardTitle>
          <CardDescription>Explore and invest in {category.name.toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryOpportunities.map(asset => (
              <div key={asset.id} className="p-4 rounded-lg border hover:border-gold-600 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{asset.name}</h4>
                    <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                  </div>
                  <Badge variant={asset.risk === 'Low' ? 'success' : asset.risk === 'Medium' ? 'warning' : 'destructive'}>
                    {asset.risk}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="text-lg font-bold">${asset.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">24h Change</span>
                    <span className={`text-sm font-semibold flex items-center ${asset.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {asset.change >= 0 ? '+' : ''}{asset.change}%
                    </span>
                  </div>
                </div>

                <Button
                  variant="gold"
                  className="w-full"
                  onClick={() => onInvest(category, asset)}
                  disabled={userBalance < asset.price || !isAccountActive}
                  title={!isAccountActive ? "Account deactivated - contact support" : userBalance < asset.price ? "Insufficient balance" : ""}
                >
                  Invest Now
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

