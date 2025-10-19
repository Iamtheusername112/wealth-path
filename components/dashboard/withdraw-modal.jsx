"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

export function WithdrawModal({ open, onOpenChange, userId, currentBalance }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("bank_transfer")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const withdrawAmount = parseFloat(amount)

    if (withdrawAmount > currentBalance) {
      toast.error("Insufficient balance")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/transactions/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: withdrawAmount,
          method,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Withdrawal of ${formatCurrency(withdrawAmount)} initiated!`)
        onOpenChange(false)
        setAmount("")
        router.refresh()
      } else {
        if (data.accountDeactivated) {
          toast.error("Account Deactivated", {
            description: "Your account has been deactivated. Please contact support for assistance."
          })
          onOpenChange(false)
          router.push('/account-deactivated')
        } else {
          toast.error(data.error || "Failed to withdraw funds")
        }
      }
    } catch (error) {
      console.error('Withdrawal error:', error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Withdraw money from your CapitalPath account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              <span className="text-muted-foreground">Available Balance:</span>
              <span className="font-semibold ml-2">{formatCurrency(currentBalance)}</span>
            </p>
          </div>

          <div>
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              max={currentBalance}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="method">Withdrawal Method</Label>
            <Select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              required
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="wire_transfer">Wire Transfer</option>
              <option value="check">Check</option>
            </Select>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
            <p className="text-sm text-yellow-900 dark:text-yellow-100">
              <strong>Note:</strong> Withdrawals typically take 1-3 business days to process.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !amount} variant="gold" className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Withdraw $${amount || '0.00'}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

