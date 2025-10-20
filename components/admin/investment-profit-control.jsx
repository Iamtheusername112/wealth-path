"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Percent,
  Loader2,
  Plus,
  Minus,
  LineChart
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

const investmentCategories = [
  { id: "crypto", name: "Cryptocurrency", icon: "🪙", color: "text-orange-600" },
  { id: "stocks", name: "Stocks", icon: "📈", color: "text-blue-600" },
  { id: "forex", name: "Forex", icon: "💱", color: "text-green-600" },
  { id: "commodities", name: "Commodities", icon: "🏅", color: "text-yellow-600" },
  { id: "real_estate", name: "Real Estate", icon: "🏘️", color: "text-purple-600" },
]

export function InvestmentProfitControl({ users, investments }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [adjustType, setAdjustType] = useState('price') // 'price', 'profit', 'loss'
  
  const [amount, setAmount] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [reason, setReason] = useState('')

  const openProfitDialog = (investment, user, type) => {
    setSelectedInvestment(investment)
    setSelectedUser(user)
    setAdjustType(type)
    setAmount('')
    setNewPrice(type === 'price' ? investment.current_price?.toString() || '' : '')
    setReason('')
    setDialogOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let body = {}

      if (adjustType === 'price') {
        body = {
          investmentId: selectedInvestment.id,
          action: 'adjust_price',
          newCurrentPrice: parseFloat(newPrice),
          reason: reason.trim()
        }
      } else if (adjustType === 'profit') {
        body = {
          investmentId: selectedInvestment.id,
          action: 'add_profit',
          amount: parseFloat(amount),
          reason: reason.trim()
        }
      } else if (adjustType === 'loss') {
        body = {
          investmentId: selectedInvestment.id,
          action: 'subtract_loss',
          amount: parseFloat(amount),
          reason: reason.trim()
        }
      }

      const response = await fetch('/api/admin/adjust-investment-profit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        if (adjustType === 'price') {
          toast.success(
            `Price updated for ${selectedInvestment.asset_name}`,
            {
              description: data.profitLoss >= 0 
                ? `Profit: ${formatCurrency(data.profitLoss)} (${data.profitLossPercent}%)`
                : `Loss: ${formatCurrency(Math.abs(data.profitLoss))} (${data.profitLossPercent}%)`
            }
          )
        } else {
          toast.success(
            `${adjustType === 'profit' ? 'Profit added' : 'Loss applied'} to ${selectedInvestment.asset_name}`,
            {
              description: `New value: ${formatCurrency(data.newAmount)}`
            }
          )
        }
        setDialogOpen(false)
        router.refresh()
      } else {
        toast.error(data.error || "Failed to adjust investment")
      }
    } catch (error) {
      console.error('Adjust profit error:', error)
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Group investments by user
  const investmentsByUser = {}
  if (investments) {
    investments.forEach(inv => {
      if (!investmentsByUser[inv.user_id]) {
        investmentsByUser[inv.user_id] = []
      }
      investmentsByUser[inv.user_id].push(inv)
    })
  }

  const calculateProfitLoss = (investment) => {
    if (!investment.quantity || !investment.purchase_price || !investment.current_price) {
      return null
    }
    
    const purchaseValue = parseFloat(investment.purchase_price) * parseFloat(investment.quantity)
    const currentValue = parseFloat(investment.current_price) * parseFloat(investment.quantity)
    const profitLoss = currentValue - purchaseValue
    const percent = purchaseValue > 0 ? ((profitLoss / purchaseValue) * 100).toFixed(2) : 0
    
    return { profitLoss, percent }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Investment Profit/Loss Control
          </CardTitle>
          <CardDescription>
            Adjust investment values, add profits, or apply losses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {users && users.length > 0 ? (
              users.map((user) => {
                const userInvestments = investmentsByUser[user.id] || []
                
                if (userInvestments.length === 0) return null
                
                return (
                  <div key={user.id} className="border rounded-lg p-4">
                    {/* User Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold truncate">{user.full_name || 'Unknown'}</h4>
                          <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>
                            {user.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* User's Investments */}
                    <div className="space-y-3">
                      {userInvestments.map((investment) => {
                        const categoryInfo = investmentCategories.find(c => c.id === investment.category)
                        const profitLossData = calculateProfitLoss(investment)
                        
                        return (
                          <div
                            key={investment.id}
                            className="p-4 rounded-lg border bg-gradient-to-r from-muted/30 to-muted/10"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{categoryInfo?.icon || '📊'}</span>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold">{investment.asset_name}</p>
                                    <Badge variant={investment.status === 'active' ? 'success' : 'secondary'}>
                                      {investment.status}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                    <span>Value: {formatCurrency(parseFloat(investment.amount))}</span>
                                    {investment.quantity && (
                                      <span>Qty: {parseFloat(investment.quantity).toFixed(4)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {profitLossData && (
                                <div className={`text-right ${profitLossData.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  <p className="font-bold text-lg">
                                    {profitLossData.profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLossData.profitLoss)}
                                  </p>
                                  <p className="text-sm">
                                    ({profitLossData.percent}%)
                                  </p>
                                </div>
                              )}
                            </div>

                            {investment.purchase_price && investment.current_price && (
                              <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                                <span>Buy: ${parseFloat(investment.purchase_price).toLocaleString()}</span>
                                <span>Current: ${parseFloat(investment.current_price).toLocaleString()}</span>
                              </div>
                            )}

                            {/* Control Buttons */}
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openProfitDialog(investment, user, 'price')}
                                className="flex items-center gap-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                              >
                                <Percent className="h-3 w-3" />
                                Update Price
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openProfitDialog(investment, user, 'profit')}
                                className="flex items-center gap-1 border-green-600 text-green-600 hover:bg-green-50"
                              >
                                <Plus className="h-3 w-3" />
                                Add Profit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openProfitDialog(investment, user, 'loss')}
                                className="flex items-center gap-1 border-red-600 text-red-600 hover:bg-red-50"
                              >
                                <Minus className="h-3 w-3" />
                                Apply Loss
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No investments found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profit/Loss Adjustment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {adjustType === 'price' && (
                <>
                  <Percent className="h-5 w-5 text-blue-600" />
                  Update Market Price
                </>
              )}
              {adjustType === 'profit' && (
                <>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Add Profit
                </>
              )}
              {adjustType === 'loss' && (
                <>
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Apply Loss
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Adjust {selectedInvestment?.asset_name} for {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Current Info */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Current Investment</p>
                <p className="text-xl font-bold">
                  {formatCurrency(parseFloat(selectedInvestment?.amount || 0))}
                </p>
                {selectedInvestment?.current_price && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Price: ${parseFloat(selectedInvestment.current_price).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Input Field */}
              {adjustType === 'price' ? (
                <div>
                  <Label htmlFor="newPrice">
                    New Market Price ($) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="newPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="mt-1"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Update the market/current price of this asset
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="amount">
                    Amount ($) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {adjustType === 'profit' 
                      ? 'Amount to add to investment value' 
                      : 'Amount to subtract from investment value'}
                  </p>
                </div>
              )}

              {/* Reason */}
              <div>
                <Label htmlFor="reason">
                  Reason (Optional)
                </Label>
                <Textarea
                  id="reason"
                  placeholder={`Why are you ${adjustType === 'price' ? 'updating the price' : adjustType === 'profit' ? 'adding profit' : 'applying loss'}?`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be visible to the user in their notification
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || (adjustType === 'price' ? !newPrice : !amount)}
                className={
                  adjustType === 'price' ? 'bg-blue-600 hover:bg-blue-700' :
                  adjustType === 'profit' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-red-600 hover:bg-red-700'
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {adjustType === 'price' && 'Update Price'}
                    {adjustType === 'profit' && 'Add Profit'}
                    {adjustType === 'loss' && 'Apply Loss'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

