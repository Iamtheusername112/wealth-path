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
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 pb-20 sm:pb-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Investment Portfolio</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Grow your wealth with diverse investment opportunities</p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="shadow-lg shadow-black/10">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-sm sm:text-base">Total Invested</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{formatCurrency(totalInvested)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="shadow-lg shadow-black/10">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-sm sm:text-base">Portfolio Value</CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-green-600">
              {formatCurrency(portfolioValue)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="shadow-lg shadow-black/10">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-sm sm:text-base">Total Return</CardDescription>
            <CardTitle className={`text-xl sm:text-2xl ${portfolioChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioChange >= 0 ? '+' : ''}{formatCurrency(portfolioChange)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="shadow-lg shadow-black/10">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-sm sm:text-base">Active Positions</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{activeInvestments}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" active={activeTab === "overview"} className="flex-shrink-0">
            <PieChart className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Overview</span>
          </TabsTrigger>
          {categories.map(category => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              active={activeTab === category.id}
              className="flex-shrink-0"
            >
              <category.icon className={`h-4 w-4 mr-2 ${category.color}`} />
              <span className="hidden sm:inline">{category.name}</span>
              <span className="sm:hidden">{category.name.split(' ')[0]}</span>
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

