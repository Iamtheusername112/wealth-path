"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

export function InvestModal({ open, onOpenChange, userId, category, asset, userBalance }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState("")

  const quantity = asset && amount ? parseFloat(amount) / asset.price : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const investAmount = parseFloat(amount)

    if (investAmount > userBalance) {
      toast.error("Insufficient balance")
      setLoading(false)
      return
    }

    if (!asset || !category) {
      toast.error("Invalid investment selection")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/investments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          category: category.id,
          assetName: asset.name,
          assetSymbol: asset.symbol,
          amount: investAmount,
          quantity: quantity,
          purchasePrice: asset.price,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Successfully invested ${formatCurrency(investAmount)} in ${asset.name}!`)
        onOpenChange(false)
        setAmount("")
        router.refresh()
      } else {
        toast.error(data.error || "Failed to create investment")
      }
    } catch (error) {
      console.error('Investment error:', error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!asset || !category) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Invest in {asset.name}</DialogTitle>
          <DialogDescription>
            {category.name} • {asset.symbol}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Price</span>
              <span className="font-semibold">${asset.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Available Balance</span>
              <span className="font-semibold">{formatCurrency(userBalance)}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Investment Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min={asset.price}
              max={userBalance}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {amount && (
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <p className="text-sm text-green-900 dark:text-green-100">
                You will receive approximately <strong>{quantity.toFixed(6)} {asset.symbol}</strong>
              </p>
            </div>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
            <p className="text-sm text-yellow-900 dark:text-yellow-100 flex items-start gap-2">
              <svg className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                <strong>Risk Disclaimer:</strong> All investments carry risk. Past performance does not guarantee future results. Please invest responsibly and only what you can afford to lose.
              </span>
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
                `Invest $${amount || '0.00'}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

