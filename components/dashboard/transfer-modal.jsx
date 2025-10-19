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

export function TransferModal({ open, onOpenChange, userId, currentBalance }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const transferAmount = parseFloat(amount)

    if (transferAmount > currentBalance) {
      toast.error("Insufficient balance")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/transactions/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: transferAmount,
          recipientEmail,
          description,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Transfer of ${formatCurrency(transferAmount)} sent successfully!`)
        onOpenChange(false)
        setAmount("")
        setRecipientEmail("")
        setDescription("")
        router.refresh()
      } else {
        if (data.accountDeactivated) {
          toast.error("Account Deactivated", {
            description: "Your account has been deactivated. Please contact support for assistance."
          })
          onOpenChange(false)
          router.push('/account-deactivated')
        } else {
          toast.error(data.error || "Failed to transfer funds")
        }
      }
    } catch (error) {
      console.error('Transfer error:', error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Transfer Money</DialogTitle>
          <DialogDescription>
            Send money to another CapitalPath user
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
            <Label htmlFor="recipientEmail">Recipient Email</Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="recipient@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
            />
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
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              type="text"
              placeholder="What's this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
            <Button type="submit" disabled={loading || !amount || !recipientEmail} variant="gold" className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                `Send $${amount || '0.00'}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

