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
import { DollarSign, Plus, Minus, Loader2, TrendingUp, TrendingDown } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

export function BalanceManagement({ users }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [action, setAction] = useState('credit') // 'credit' or 'debit'
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  const openDialog = (user, actionType) => {
    setSelectedUser(user)
    setAction(actionType)
    setAmount('')
    setReason('')
    setDialogOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const adjustmentAmount = parseFloat(amount)

    if (!adjustmentAmount || adjustmentAmount <= 0) {
      toast.error("Please enter a valid amount")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/adjust-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          action,
          amount: adjustmentAmount,
          reason: reason.trim()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(
          `Successfully ${action === 'credit' ? 'credited' : 'debited'} ${formatCurrency(adjustmentAmount)} ${
            action === 'credit' ? 'to' : 'from'
          } ${data.userName}'s account`,
          {
            description: `New balance: ${formatCurrency(data.newBalance)}`
          }
        )
        setDialogOpen(false)
        router.refresh()
      } else {
        toast.error(data.error || "Failed to adjust balance")
      }
    } catch (error) {
      console.error('Balance adjustment error:', error)
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Balance Management
          </CardTitle>
          <CardDescription>
            Credit or debit user account balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users && users.length > 0 ? (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:border-gold-600 transition-all"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold truncate">{user.full_name || 'Unknown'}</h4>
                        <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>
                          {user.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      <p className="text-lg font-bold text-green-600 mt-1">
                        {formatCurrency(parseFloat(user.balance || 0))}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(user, 'credit')}
                        className="flex items-center gap-1 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Credit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(user, 'debit')}
                        className="flex items-center gap-1 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        disabled={parseFloat(user.balance || 0) <= 0}
                      >
                        <Minus className="h-4 w-4" />
                        <span className="hidden sm:inline">Debit</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Balance Adjustment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action === 'credit' ? (
                <>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Credit Balance
                </>
              ) : (
                <>
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Debit Balance
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {action === 'credit' 
                ? `Add funds to ${selectedUser?.full_name}'s account` 
                : `Remove funds from ${selectedUser?.full_name}'s account`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Current Balance */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(parseFloat(selectedUser?.balance || 0))}
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <Label htmlFor="amount">
                  Amount to {action === 'credit' ? 'Credit' : 'Debit'}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7"
                    required
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <Label htmlFor="reason">
                  Reason (Optional)
                </Label>
                <Textarea
                  id="reason"
                  placeholder={`Why are you ${action === 'credit' ? 'crediting' : 'debiting'} this account?`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This reason will be visible to the user in their transaction history
                </p>
              </div>

              {/* Preview */}
              {amount && parseFloat(amount) > 0 && (
                <div className="p-3 bg-muted rounded-lg border-2 border-dashed">
                  <p className="text-sm text-muted-foreground mb-2">Preview</p>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Current Balance:</span>
                    <span className="font-mono">
                      {formatCurrency(parseFloat(selectedUser?.balance || 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{action === 'credit' ? 'Adding:' : 'Removing:'}</span>
                    <span className={`font-mono ${action === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {action === 'credit' ? '+' : '-'}{formatCurrency(parseFloat(amount))}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex items-center justify-between font-bold">
                      <span>New Balance:</span>
                      <span className="font-mono text-lg">
                        {formatCurrency(
                          parseFloat(selectedUser?.balance || 0) + 
                          (action === 'credit' ? parseFloat(amount) : -parseFloat(amount))
                        )}
                      </span>
                    </div>
                  </div>
                </div>
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
                disabled={loading || !amount || parseFloat(amount) <= 0}
                className={action === 'credit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {action === 'credit' ? 'Credit Account' : 'Debit Account'}
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

