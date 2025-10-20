"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Bitcoin,
  LineChart,
  Landmark,
  Building2,
  Home
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { formatCurrency, formatDate } from "@/lib/utils"

const investmentCategories = [
  { id: "crypto", name: "Cryptocurrency", icon: Bitcoin, color: "text-orange-600" },
  { id: "stocks", name: "Stocks", icon: LineChart, color: "text-blue-600" },
  { id: "forex", name: "Forex", icon: Landmark, color: "text-green-600" },
  { id: "commodities", name: "Commodities", icon: Building2, color: "text-yellow-600" },
  { id: "real_estate", name: "Real Estate", icon: Home, color: "text-purple-600" },
]

export function InvestmentManagement({ users, investments }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState('add') // 'add', 'edit', 'remove'
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedInvestment, setSelectedInvestment] = useState(null)
  
  // Form fields
  const [category, setCategory] = useState('')
  const [assetName, setAssetName] = useState('')
  const [assetSymbol, setAssetSymbol] = useState('')
  const [amount, setAmount] = useState('')
  const [quantity, setQuantity] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [currentPrice, setCurrentPrice] = useState('')
  const [status, setStatus] = useState('active')
  const [reason, setReason] = useState('')

  const openAddDialog = (user) => {
    setDialogMode('add')
    setSelectedUser(user)
    setSelectedInvestment(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (investment, user) => {
    setDialogMode('edit')
    setSelectedUser(user)
    setSelectedInvestment(investment)
    
    // Pre-fill form
    setCategory(investment.category)
    setAssetName(investment.asset_name)
    setAssetSymbol(investment.asset_symbol || '')
    setAmount(investment.amount.toString())
    setQuantity(investment.quantity?.toString() || '')
    setPurchasePrice(investment.purchase_price?.toString() || '')
    setCurrentPrice(investment.current_price?.toString() || '')
    setStatus(investment.status)
    setReason('')
    
    setDialogOpen(true)
  }

  const openRemoveDialog = (investment, user) => {
    setDialogMode('remove')
    setSelectedUser(user)
    setSelectedInvestment(investment)
    setReason('')
    setDialogOpen(true)
  }

  const resetForm = () => {
    setCategory('')
    setAssetName('')
    setAssetSymbol('')
    setAmount('')
    setQuantity('')
    setPurchasePrice('')
    setCurrentPrice('')
    setStatus('active')
    setReason('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let body = {}

      if (dialogMode === 'add') {
        body = {
          action: 'add',
          userId: selectedUser.id,
          investmentData: {
            category,
            assetName,
            assetSymbol,
            amount: parseFloat(amount),
            quantity: quantity ? parseFloat(quantity) : null,
            purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
            currentPrice: currentPrice ? parseFloat(currentPrice) : null,
            status,
            reason: reason.trim()
          }
        }
      } else if (dialogMode === 'edit') {
        body = {
          action: 'update',
          userId: selectedUser.id,
          investmentData: {
            investmentId: selectedInvestment.id,
            amount: parseFloat(amount),
            quantity: quantity ? parseFloat(quantity) : null,
            purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
            currentPrice: currentPrice ? parseFloat(currentPrice) : null,
            status,
            reason: reason.trim()
          }
        }
      } else if (dialogMode === 'remove') {
        body = {
          action: 'remove',
          userId: selectedUser.id,
          investmentData: {
            investmentId: selectedInvestment.id
          }
        }
      }

      const response = await fetch('/api/admin/manage-investment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        const actionText = dialogMode === 'add' ? 'added' : dialogMode === 'edit' ? 'updated' : 'removed'
        toast.success(
          `Successfully ${actionText} investment for ${data.userName}`,
          {
            description: dialogMode !== 'remove' 
              ? `${data.investment.asset_name}: ${formatCurrency(data.investment.amount)}`
              : undefined
          }
        )
        setDialogOpen(false)
        router.refresh()
      } else {
        toast.error(data.error || "Operation failed")
      }
    } catch (error) {
      console.error('Investment management error:', error)
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Investment Management
          </CardTitle>
          <CardDescription>
            Add, modify, or remove user investments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {users && users.length > 0 ? (
              users.map((user) => {
                const userInvestments = investmentsByUser[user.id] || []
                const totalInvested = userInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
                
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
                        {userInvestments.length > 0 && (
                          <p className="text-sm font-medium text-green-600 mt-1">
                            Total Invested: {formatCurrency(totalInvested)}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => openAddDialog(user)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Investment</span>
                      </Button>
                    </div>

                    {/* User's Investments */}
                    {userInvestments.length > 0 ? (
                      <div className="space-y-2">
                        {userInvestments.map((investment) => {
                          const categoryInfo = investmentCategories.find(c => c.id === investment.category)
                          const Icon = categoryInfo?.icon || TrendingUp
                          
                          return (
                            <div
                              key={investment.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Icon className={`h-5 w-5 ${categoryInfo?.color || 'text-gray-600'} flex-shrink-0`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium truncate">{investment.asset_name}</p>
                                    <Badge variant={investment.status === 'active' ? 'success' : 'secondary'} className="flex-shrink-0">
                                      {investment.status}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <span>Amount: {formatCurrency(parseFloat(investment.amount))}</span>
                                    {investment.quantity && (
                                      <span>Qty: {parseFloat(investment.quantity).toFixed(4)}</span>
                                    )}
                                    {investment.purchase_price && (
                                      <span>Buy: ${parseFloat(investment.purchase_price).toLocaleString()}</span>
                                    )}
                                    {investment.current_price && (
                                      <span>Current: ${parseFloat(investment.current_price).toLocaleString()}</span>
                                    )}
                                    <span>{formatDate(investment.created_at)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-1 flex-shrink-0 ml-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(investment, user)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openRemoveDialog(investment, user)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                        No investments yet
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit/Remove Investment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'add' && 'Add Investment'}
              {dialogMode === 'edit' && 'Edit Investment'}
              {dialogMode === 'remove' && 'Remove Investment'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'add' && `Add a new investment for ${selectedUser?.full_name}`}
              {dialogMode === 'edit' && `Modify investment for ${selectedUser?.full_name}`}
              {dialogMode === 'remove' && `Remove this investment from ${selectedUser?.full_name}'s portfolio`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {dialogMode === 'remove' ? (
                /* Remove Confirmation */
                <>
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                    <p className="font-semibold mb-2">Are you sure you want to remove this investment?</p>
                    <div className="space-y-1 text-sm">
                      <p><strong>Asset:</strong> {selectedInvestment?.asset_name}</p>
                      <p><strong>Amount:</strong> {formatCurrency(parseFloat(selectedInvestment?.amount || 0))}</p>
                      <p><strong>Category:</strong> {investmentCategories.find(c => c.id === selectedInvestment?.category)?.name}</p>
                      <p><strong>Status:</strong> {selectedInvestment?.status}</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="remove-reason">
                      Reason for Removal (Optional)
                    </Label>
                    <Textarea
                      id="remove-reason"
                      placeholder="Why are you removing this investment?"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </>
              ) : (
                /* Add/Edit Form */
                <>
                  {/* Category */}
                  {dialogMode === 'add' && (
                    <div>
                      <Label htmlFor="category">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {investmentCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <div className="flex items-center gap-2">
                                <cat.icon className={`h-4 w-4 ${cat.color}`} />
                                {cat.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Asset Name & Symbol */}
                  {dialogMode === 'add' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="assetName">
                          Asset Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="assetName"
                          placeholder="e.g., Bitcoin"
                          value={assetName}
                          onChange={(e) => setAssetName(e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="assetSymbol">
                          Symbol
                        </Label>
                        <Input
                          id="assetSymbol"
                          placeholder="e.g., BTC"
                          value={assetSymbol}
                          onChange={(e) => setAssetSymbol(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Amount & Quantity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    </div>
                    <div>
                      <Label htmlFor="quantity">
                        Quantity
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.00000001"
                        min="0"
                        placeholder="0.0000"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Purchase & Current Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="purchasePrice">
                        Purchase Price ($)
                      </Label>
                      <Input
                        id="purchasePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentPrice">
                        Current Price ($)
                      </Label>
                      <Input
                        id="currentPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={currentPrice}
                        onChange={(e) => setCurrentPrice(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <Label htmlFor="status">
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select value={status} onValueChange={setStatus} required>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reason */}
                  <div>
                    <Label htmlFor="reason">
                      Reason (Optional)
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder={`Why are you ${dialogMode === 'add' ? 'adding' : 'modifying'} this investment?`}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be visible to the user in their notifications
                    </p>
                  </div>
                </>
              )}
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
                disabled={loading}
                className={dialogMode === 'remove' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {dialogMode === 'add' && 'Add Investment'}
                    {dialogMode === 'edit' && 'Update Investment'}
                    {dialogMode === 'remove' && 'Remove Investment'}
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

