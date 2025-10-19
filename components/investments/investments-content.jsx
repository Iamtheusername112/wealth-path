"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Bitcoin, 
  LineChart, 
  Building2,
  Landmark,
  Home,
  PieChart
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { InvestmentOpportunities } from "./investment-opportunities"
import { PortfolioOverview } from "./portfolio-overview"
import { InvestModal } from "./invest-modal"

export function InvestmentsContent({ user, investments }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [investModalOpen, setInvestModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedAsset, setSelectedAsset] = useState(null)
  
  // Check if user account is active
  const isAccountActive = user?.status === 'active'

  const categories = [
    {
      id: "crypto",
      name: "Cryptocurrency",
      icon: Bitcoin,
      description: "Digital currencies and blockchain assets",
      color: "text-orange-600"
    },
    {
      id: "stocks",
      name: "Stocks",
      icon: LineChart,
      description: "Company shares and equity markets",
      color: "text-blue-600"
    },
    {
      id: "forex",
      name: "Forex",
      icon: Landmark,
      description: "Foreign exchange and currency trading",
      color: "text-green-600"
    },
    {
      id: "commodities",
      name: "Commodities",
      icon: Building2,
      description: "Gold, silver, oil, and other resources",
      color: "text-yellow-600"
    },
    {
      id: "real_estate",
      name: "Real Estate",
      icon: Home,
      description: "Property investments and REITs",
      color: "text-purple-600"
    }
  ]

  const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
  const activeInvestments = investments.filter(inv => inv.status === 'active').length

  // Calculate total portfolio value (with simulated gains/losses)
  const portfolioValue = investments.reduce((sum, inv) => {
    const currentValue = inv.current_price && inv.quantity 
      ? parseFloat(inv.current_price) * parseFloat(inv.quantity)
      : parseFloat(inv.amount) * (1 + (Math.random() * 0.2 - 0.05)) // Simulated 5% variance
    return sum + currentValue
  }, 0)

  const portfolioChange = portfolioValue - totalInvested
  const portfolioChangePercent = totalInvested > 0 ? (portfolioChange / totalInvested) * 100 : 0

  const handleInvest = (category, asset) => {
    setSelectedCategory(category)
    setSelectedAsset(asset)
    setInvestModalOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Investment Portfolio</h1>
        <p className="text-muted-foreground">Grow your wealth with diverse investment opportunities</p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Invested</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalInvested)}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Portfolio Value</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatCurrency(portfolioValue)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Return</CardDescription>
            <CardTitle className={`text-2xl ${portfolioChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioChange >= 0 ? '+' : ''}{formatCurrency(portfolioChange)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Positions</CardDescription>
            <CardTitle className="text-2xl">{activeInvestments}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview" active={activeTab === "overview"}>
            <PieChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          {categories.map(category => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              active={activeTab === category.id}
            >
              <category.icon className={`h-4 w-4 mr-2 ${category.color}`} />
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <PortfolioOverview 
            investments={investments} 
            categories={categories}
            totalInvested={totalInvested}
            portfolioValue={portfolioValue}
          />
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category.id} value={category.id}>
            <InvestmentOpportunities 
              category={category}
              userInvestments={investments.filter(inv => inv.category === category.id)}
              onInvest={handleInvest}
              userBalance={parseFloat(user.balance)}
              isAccountActive={isAccountActive}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Invest Modal */}
      <InvestModal
        open={investModalOpen}
        onOpenChange={setInvestModalOpen}
        userId={user.id}
        category={selectedCategory}
        asset={selectedAsset}
        userBalance={parseFloat(user.balance)}
      />
    </div>
  )
}

