"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DollarSign, CheckCircle, XCircle, Clock, Building2, User, ArrowRight } from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { toast } from "sonner"

export function PendingDeposits({ deposits, users }) {
  const router = useRouter()
  const [loading, setLoading] = useState(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedDeposit, setSelectedDeposit] = useState(null)
  const [action, setAction] = useState(null)
  const [adminNotes, setAdminNotes] = useState("")

  const pendingDeposits = deposits.filter(d => d.status === 'pending')

  const getUserInfo = (userId) => {
    return users.find(u => u.id === userId)
  }

  const handleReview = (deposit, actionType) => {
    setSelectedDeposit(deposit)
    setAction(actionType)
    setAdminNotes("")
    setReviewDialogOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedDeposit || !action) return

    setLoading(selectedDeposit.id)

    try {
      const response = await fetch('/api/admin/deposit-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depositId: selectedDeposit.id,
          action: action,
          adminNotes: adminNotes,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Deposit ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
        setReviewDialogOpen(false)
        setSelectedDeposit(null)
        setAction(null)
        setAdminNotes("")
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to process deposit')
      }
    } catch (error) {
      console.error('Deposit action error:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-gold-600" />
                Pending Deposits
              </CardTitle>
              <CardDescription>Review and approve user deposit requests</CardDescription>
            </div>
            {pendingDeposits.length > 0 && (
              <Badge variant="warning" className="text-base px-4 py-2">
                {pendingDeposits.length} Pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pendingDeposits.length > 0 ? (
            <div className="space-y-4">
              {pendingDeposits.map((deposit) => {
                const user = getUserInfo(deposit.user_id)
                return (
                  <div key={deposit.id} className="p-6 rounded-lg border-2 hover:border-gold-600 transition-all bg-card">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* User Info */}
                      <div className="flex items-start gap-4 flex-1">
                        {user?.profile_image_url ? (
                          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-gold-600 shadow-lg flex-shrink-0">
                            <img 
                              src={user.profile_image_url} 
                              alt={user.full_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                            {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">{user?.full_name || 'Unknown User'}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{user?.email || 'No email'}</p>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Amount</p>
                              <p className="text-2xl font-bold text-gold-600">
                                {formatCurrency(parseFloat(deposit.amount))}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Submitted</p>
                              <p className="font-medium">{formatDateTime(deposit.created_at)}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-muted-foreground">From Bank</p>
                              <p className="font-medium">
                                {deposit.source_bank_name} (****{deposit.source_account_last4})
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-muted-foreground">To Account</p>
                              <p className="font-mono font-medium">{deposit.destination_account}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 md:w-48">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                          onClick={() => handleReview(deposit, 'approve')}
                          disabled={loading === deposit.id}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleReview(deposit, 'reject')}
                          disabled={loading === deposit.id}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <CheckCircle className="h-20 w-20 mx-auto mb-4 text-green-500 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
              <p className="text-sm">No pending deposit requests at this time</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={action === 'approve' ? 'text-green-600' : 'text-red-600'}>
              {action === 'approve' ? 'Approve Deposit' : 'Reject Deposit'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve' 
                ? 'The deposit will be added to the user\'s balance immediately.'
                : 'The deposit will be rejected and the user will be notified.'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedDeposit && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted border">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">User</p>
                    <p className="font-semibold">{getUserInfo(selectedDeposit.user_id)?.full_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-semibold text-lg text-gold-600">
                      {formatCurrency(parseFloat(selectedDeposit.amount))}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">From</p>
                    <p className="font-medium">
                      {selectedDeposit.source_bank_name} (****{selectedDeposit.source_account_last4})
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">To Account</p>
                    <p className="font-mono font-medium">{selectedDeposit.destination_account}</p>
                  </div>
                </div>
              </div>

              {action === 'reject' && (
                <div>
                  <Label htmlFor="notes">Rejection Reason (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter reason for rejection..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setReviewDialogOpen(false)
                setSelectedDeposit(null)
                setAction(null)
                setAdminNotes("")
              }}
              disabled={loading === selectedDeposit?.id}
            >
              Cancel
            </Button>
            <Button
              variant={action === 'approve' ? 'default' : 'destructive'}
              onClick={handleConfirmAction}
              disabled={loading === selectedDeposit?.id}
              className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {loading === selectedDeposit?.id ? (
                'Processing...'
              ) : (
                action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

