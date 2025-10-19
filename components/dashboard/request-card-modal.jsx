"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2, CheckCircle2, ArrowRight, Home } from "lucide-react"
import { toast } from "sonner"

export function RequestCardModal({ open, onOpenChange, userId, onRequestSuccess }) {
  const [loading, setLoading] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)
  const router = useRouter()

  const handleRequest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/credit-cards/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      toast.success('Success!', {
        description: data.message,
      })
      setRequestSubmitted(true)
      if (onRequestSuccess) onRequestSuccess()
    } catch (error) {
      toast.error('Error', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setRequestSubmitted(false)
    onOpenChange(false)
  }

  const handleGoToDashboard = () => {
    handleClose()
    router.push('/dashboard')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!requestSubmitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gold-600" />
                Request Credit Card
              </DialogTitle>
              <DialogDescription>
                Submit a request for a premium CapitalPath credit card
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-gold-600/20 bg-gold-50 dark:bg-gold-950/10 p-4">
                <h4 className="font-semibold mb-2 text-gold-900 dark:text-gold-100">
                  Credit Card Benefits
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Premium stainless steel card design</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Up to $50,000 credit limit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Worldwide acceptance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Premium rewards and cashback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>24/7 concierge service</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-blue-600/20 bg-blue-50 dark:bg-blue-950/10 p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Note:</strong> Your request will be reviewed by our admin team. 
                  You'll receive a notification once your card is approved and ready to use.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                onClick={handleRequest}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <DialogTitle className="text-center">Request Submitted!</DialogTitle>
              <DialogDescription className="text-center">
                Your credit card request has been successfully submitted
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-green-600/20 bg-green-50 dark:bg-green-950/10 p-4">
                <p className="text-sm text-green-900 dark:text-green-100 text-center">
                  Our admin team will review your request shortly. You'll receive a notification 
                  once your credit card has been approved and is ready to use.
                </p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium">What's Next?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Check your notifications for updates</li>
                  <li>• Request typically processed within 24 hours</li>
                  <li>• Your card will appear in the Cards section</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button
                variant="gold"
                onClick={handleGoToDashboard}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                Stay on Cards Page
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

