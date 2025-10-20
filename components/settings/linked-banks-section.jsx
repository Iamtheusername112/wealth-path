"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Building2, Trash2, Plus, Check, Loader2, AlertTriangle, Shield } from "lucide-react"
import { toast } from "sonner"
import { LinkBankModal } from "@/components/dashboard/link-bank-modal"

export function LinkedBanksSection({ userId }) {
  const [linkedBanks, setLinkedBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [bankToRemove, setBankToRemove] = useState(null)
  const [linkBankModalOpen, setLinkBankModalOpen] = useState(false)

  useEffect(() => {
    fetchLinkedBanks()
  }, [])

  const fetchLinkedBanks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bank-accounts/list')
      if (response.ok) {
        const data = await response.json()
        setLinkedBanks(data.accounts || [])
      }
    } catch (error) {
      console.error('Fetch banks error:', error)
      toast.error('Failed to load linked accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveClick = (bank) => {
    setBankToRemove(bank)
    setConfirmDialogOpen(true)
  }

  const handleRemoveConfirm = async () => {
    if (!bankToRemove) return

    setRemoving(bankToRemove.id)
    try {
      const response = await fetch('/api/bank-accounts/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: bankToRemove.id }),
      })

      if (response.ok) {
        toast.success(`${bankToRemove.bank_name} account removed successfully`)
        setLinkedBanks(linkedBanks.filter(b => b.id !== bankToRemove.id))
        setConfirmDialogOpen(false)
        setBankToRemove(null)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to remove account')
      }
    } catch (error) {
      console.error('Remove bank error:', error)
      toast.error('An error occurred')
    } finally {
      setRemoving(null)
    }
  }

  const handleBankLinked = () => {
    fetchLinkedBanks()
  }

  return (
    <>
      <Card className="shadow-lg shadow-black/10">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-gold-600" />
                Linked Bank Accounts
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Manage your connected bank accounts for transfers</CardDescription>
            </div>
            <Button
              onClick={() => setLinkBankModalOpen(true)}
              variant="outline"
              className="gap-2 w-full sm:w-auto flex-shrink-0"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Link Bank Account</span>
              <span className="sm:hidden">Link Account</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gold-600 mb-2" />
              <p className="text-sm text-muted-foreground">Loading linked accounts...</p>
            </div>
          ) : linkedBanks.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {linkedBanks.map((bank) => (
                <div
                  key={bank.id}
                  className="p-3 sm:p-4 rounded-lg border-2 transition-all bg-card hover:border-gold-600/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                        {bank.bank_country === "United States" ? "🏦" : 
                         bank.bank_country === "United Kingdom" ? "🏛️" :
                         bank.bank_country === "Canada" ? "🍁" :
                         bank.bank_country === "Nigeria" ? "🇳🇬" :
                         bank.bank_country === "India" ? "🇮🇳" :
                         bank.bank_country === "Germany" ? "🇩🇪" :
                         bank.bank_country === "France" ? "🇫🇷" : "🏢"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-semibold text-base sm:text-lg truncate">{bank.bank_name}</p>
                          {bank.is_primary && (
                            <Badge variant="default" className="text-[10px] sm:text-xs flex-shrink-0">Primary</Badge>
                          )}
                          {bank.is_verified && (
                            <Badge variant="success" className="text-[10px] sm:text-xs gap-1 flex-shrink-0">
                              <Check className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                          <p className="truncate">
                            {bank.account_type.charAt(0).toUpperCase() + bank.account_type.slice(1)} Account • ****{bank.account_number_last4}
                          </p>
                          <p className="flex flex-wrap items-center gap-2">
                            <span>{bank.bank_country}</span>
                            <span>•</span>
                            <span>{bank.currency}</span>
                          </p>
                          <p className="text-[10px] sm:text-xs truncate">
                            Account Holder: {bank.account_holder_name}
                          </p>
                          {bank.routing_number && (
                            <p className="text-[10px] sm:text-xs truncate">
                              Routing: {bank.routing_number}
                            </p>
                          )}
                          {bank.iban && (
                            <p className="text-[10px] sm:text-xs font-mono truncate">
                              IBAN: {bank.iban}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveClick(bank)}
                      disabled={removing === bank.id}
                      className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950 gap-2 w-full sm:w-auto flex-shrink-0"
                    >
                      {removing === bank.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="hidden sm:inline">Removing...</span>
                          <span className="sm:hidden">Removing...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Remove</span>
                          <span className="sm:hidden">Remove</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2">No Bank Accounts Linked</p>
              <p className="text-sm text-muted-foreground mb-6">
                Link your bank account to enable fund transfers
              </p>
              <Button
                onClick={() => setLinkBankModalOpen(true)}
                variant="gold"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Link Your First Bank Account
              </Button>
            </div>
          )}

          {linkedBanks.length > 0 && (
            <div className="mt-4 sm:mt-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 sm:p-4 rounded-lg">
              <p className="text-[10px] sm:text-xs text-blue-900 dark:text-blue-100 flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Security Note:</strong> Removing a bank account will prevent future transfers from that account. Past transactions remain in your history.
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              Remove Bank Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this bank account from your linked accounts?
            </DialogDescription>
          </DialogHeader>

          {bankToRemove && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-2xl">
                    {bankToRemove.bank_country === "United States" ? "🏦" : 
                     bankToRemove.bank_country === "Nigeria" ? "🇳🇬" : "🏢"}
                  </div>
                  <div>
                    <p className="font-semibold text-base">{bankToRemove.bank_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {bankToRemove.account_type.charAt(0).toUpperCase() + bankToRemove.account_type.slice(1)} ****{bankToRemove.account_number_last4}
                    </p>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Country:</strong> {bankToRemove.bank_country}</p>
                  <p><strong>Account Holder:</strong> {bankToRemove.account_holder_name}</p>
                  <p><strong>Currency:</strong> {bankToRemove.currency}</p>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  ⚠️ <strong>Warning:</strong> You won't be able to transfer funds from this account after removal. This action cannot be undone.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false)
                setBankToRemove(null)
              }}
              disabled={removing === bankToRemove?.id}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveConfirm}
              disabled={removing === bankToRemove?.id}
              className="gap-2"
            >
              {removing === bankToRemove?.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Yes, Remove Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Bank Modal */}
      <LinkBankModal
        open={linkBankModalOpen}
        onOpenChange={setLinkBankModalOpen}
        userId={userId}
        onBankLinked={handleBankLinked}
      />
    </>
  )
}

