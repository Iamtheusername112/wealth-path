"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Building2, Check, ArrowRight, Shield, ArrowLeft, Edit2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { LinkBankModal } from "./link-bank-modal"

export function AddFundsModal({ open, onOpenChange, userId, userAccountNumber }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [selectedBank, setSelectedBank] = useState(null)
  const [loading, setLoading] = useState(false)
  const [linkedBanks, setLinkedBanks] = useState([])
  const [fetchingBanks, setFetchingBanks] = useState(true)
  const [linkBankModalOpen, setLinkBankModalOpen] = useState(false)

  // Fetch linked bank accounts
  useEffect(() => {
    if (open && userId) {
      fetchLinkedBanks()
    }
  }, [open, userId])

  const fetchLinkedBanks = async () => {
    setFetchingBanks(true)
    try {
      const response = await fetch('/api/bank-accounts/list')
      if (response.ok) {
        const data = await response.json()
        setLinkedBanks(data.accounts || [])
      }
    } catch (error) {
      console.error('Fetch banks error:', error)
    } finally {
      setFetchingBanks(false)
    }
  }

  const handleBankLinked = async (newBank) => {
    await fetchLinkedBanks()
    
    // Auto-select the newly linked bank and advance to Step 2
    if (newBank) {
      setSelectedBank(newBank)
      // Auto-fill account number if available
      if (userAccountNumber) {
        setAccountNumber(userAccountNumber)
      }
      setTimeout(() => setStep(2), 500)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || !selectedBank || !accountNumber) return

    setLoading(true)

    try {
      const response = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: parseFloat(amount),
          method: `${selectedBank.bank_name} - ****${selectedBank.account_number_last4}`,
          destinationAccount: accountNumber,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Different messages based on whether it requires approval or not
        if (data.requiresApproval) {
          toast.success('Deposit request submitted!', {
            description: `Your $${parseFloat(amount).toFixed(2)} deposit is pending admin approval`
          })
        } else {
          toast.success('Transfer completed successfully!', {
            description: `$${parseFloat(amount).toFixed(2)} sent to ${data.recipient?.name || 'recipient'}`
          })
        }
        
        // Reset form
        setAmount("")
        setAccountNumber("")
        setSelectedBank(null)
        setStep(1)
        onOpenChange(false)
        
        // Redirect to dashboard
        router.push('/dashboard')
        router.refresh()
      } else {
        const data = await response.json()
        if (data.accountDeactivated) {
          toast.error("Account Deactivated", {
            description: "Your account has been deactivated. Please contact support for assistance."
          })
          // Close modal and redirect to deactivated page
          onOpenChange(false)
          router.push('/account-deactivated')
        } else {
          toast.error(data.error || "Transfer failed")
        }
      }
    } catch (error) {
      console.error('Transfer error:', error)
      toast.error("An error occurred during transfer")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setAmount("")
      setAccountNumber("")
      setSelectedBank(null)
      setStep(1)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Plus className="h-6 w-6 text-gold-600" />
            Transfer Funds
          </DialogTitle>
          <DialogDescription>
            Deposit to your account or send to another CapitalPath user
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-gold-600 text-white' : 'bg-muted text-muted-foreground'}`}>
              {step > 1 ? <Check className="h-5 w-5" /> : '1'}
            </div>
            <div className="text-left">
              <p className={`text-sm font-medium ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>Source Bank</p>
              <p className="text-xs text-muted-foreground">Select account</p>
            </div>
          </div>
          <div className="flex-1 h-px bg-muted mx-3" />
          
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-gold-600 text-white' : 'bg-muted text-muted-foreground'}`}>
              {step > 2 ? <Check className="h-5 w-5" /> : '2'}
            </div>
            <div className="text-left">
              <p className={`text-sm font-medium ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>Transfer Details</p>
              <p className="text-xs text-muted-foreground">Amount & account</p>
            </div>
          </div>
          <div className="flex-1 h-px bg-muted mx-3" />
          
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 3 ? 'bg-gold-600 text-white' : 'bg-muted text-muted-foreground'}`}>
              {step > 3 ? <Check className="h-5 w-5" /> : '3'}
            </div>
            <div className="text-left">
              <p className={`text-sm font-medium ${step >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>Confirm</p>
              <p className="text-xs text-muted-foreground">Review & submit</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Source Bank */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-4 block">Select Source Bank Account</Label>
                
                {fetchingBanks ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gold-600 mb-2" />
                    <p className="text-sm text-muted-foreground">Loading your linked accounts...</p>
                  </div>
                ) : linkedBanks.length > 0 ? (
                  <div className="space-y-3">
                    {linkedBanks.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => {
                          setSelectedBank(bank)
                          // Auto-fill account number if available
                          if (userAccountNumber) {
                            setAccountNumber(userAccountNumber)
                          }
                          setTimeout(() => setStep(2), 300)
                        }}
                        className="w-full p-4 rounded-lg border-2 hover:border-gold-600 transition-all text-left group bg-card hover:bg-accent"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-2xl">
                              {bank.bank_country === "United States" ? "🏦" : 
                               bank.bank_country === "United Kingdom" ? "🏛️" :
                               bank.bank_country === "Nigeria" ? "🇳🇬" :
                               bank.bank_country === "India" ? "🇮🇳" : "🏢"}
                            </div>
                            <div>
                              <p className="font-semibold text-base">{bank.bank_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {bank.account_type.charAt(0).toUpperCase() + bank.account_type.slice(1)} ****{bank.account_number_last4}
                              </p>
                              {bank.is_verified && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Check className="h-3 w-3 text-green-600" />
                                  <span className="text-xs text-green-600">Verified</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gold-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg bg-yellow-50 dark:bg-yellow-950/10">
                    <Building2 className="h-12 w-12 mx-auto mb-3 text-yellow-600" />
                    <p className="text-sm font-semibold mb-1">No Bank Accounts Linked</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Link your bank account to start transferring funds
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                <p className="text-xs text-blue-900 dark:text-blue-100 flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Secure:</strong> All transfers are encrypted and protected.
                  </span>
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => setLinkBankModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Link New Bank Account
              </Button>
            </div>
          )}

          {/* Step 2: Enter Amount and Destination Account */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Selected Bank Summary */}
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-xl">
                      {selectedBank?.bank_country === "United States" ? "🏦" : "🏢"}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">From</p>
                      <p className="font-semibold">{selectedBank?.bank_name}</p>
                      <p className="text-xs text-muted-foreground">****{selectedBank?.account_number_last4}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Change
                  </Button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <Label htmlFor="amount" className="text-base font-semibold">Transfer Amount</Label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-muted-foreground">
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
                    className="pl-10 text-3xl h-20 font-bold"
                    required
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[50, 100, 500, 1000].map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant="outline"
                      onClick={() => setAmount(preset.toString())}
                      size="sm"
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Destination Account Number */}
              <div>
                <Label htmlFor="accountNumber" className="text-base font-semibold">Destination CapitalPath Account Number</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Enter your account number OR another CapitalPath user's account number
                </p>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="Enter CapitalPath account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.toUpperCase())}
                  className="text-lg h-12 font-mono tracking-wider"
                  required
                />
                {userAccountNumber ? (
                  <div className="mt-3 space-y-3">
                    <div className="p-4 bg-gradient-to-r from-gold-50 to-gold-100 dark:from-gold-950/20 dark:to-gold-900/20 border-2 border-gold-600/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">
                        💡 <strong>Deposit to YOUR Account:</strong>
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-mono font-bold text-xl text-gold-700 dark:text-gold-400 tracking-wider">
                          {userAccountNumber}
                        </p>
                        <Button
                          type="button"
                          variant="gold"
                          size="sm"
                          onClick={() => {
                            setAccountNumber(userAccountNumber)
                            toast.success('Your account number filled in!')
                          }}
                          className="gap-2"
                        >
                          <Check className="h-3 w-3" />
                          Use Mine
                        </Button>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        ⏳ Requires admin approval before funds are added
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-xs text-blue-900 dark:text-blue-100">
                        <strong>Transfer to Others:</strong> Enter another user's account number for instant transfer (no approval needed)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-xs text-red-900 dark:text-red-100">
                      ⚠️ <strong>Account number not assigned yet.</strong> Contact support to get your account number.
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!amount || parseFloat(amount) <= 0 || !accountNumber}
                  variant="gold"
                  className="flex-1 gap-2"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              {(() => {
                const isOwnAccount = userAccountNumber && accountNumber === userAccountNumber
                return (
                  <>
                    <div className="text-center">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gold-600" />
                      <h3 className="text-2xl font-bold mb-2">
                        {isOwnAccount ? 'Review Your Deposit' : 'Review Your Transfer'}
                      </h3>
                      <p className="text-muted-foreground">
                        {isOwnAccount 
                          ? 'Deposit to your account (requires admin approval)'
                          : 'Transfer to another CapitalPath user (instant)'
                        }
                      </p>
                    </div>
                  </>
                )
              })()}

              {/* Transfer Summary */}
              <div className="space-y-4 p-6 rounded-lg border-2 border-gold-600/20 bg-gradient-to-br from-card to-muted/30">
                {/* From Bank */}
                <div className="flex justify-between items-start pb-4 border-b">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">From</p>
                    <p className="font-semibold text-lg">{selectedBank?.bank_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedBank?.account_type.charAt(0).toUpperCase() + selectedBank?.account_type.slice(1)} ****{selectedBank?.account_number_last4}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>

                {/* Amount & Destination */}
                <div className="flex justify-between items-start pb-4 border-b">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Transfer Amount</p>
                    <p className="text-4xl font-bold text-gold-600 mb-3">
                      ${parseFloat(amount || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">To Account Number</p>
                    <p className="font-mono text-lg font-semibold">{accountNumber}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(2)}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>

                {/* Fee */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted-foreground">Transfer Fee</span>
                  <p className="font-semibold text-green-600">$0.00</p>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t-2">
                  <span className="font-semibold text-lg">Total Amount</span>
                  <p className="text-3xl font-bold">
                    ${parseFloat(amount || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Authorization Notice */}
              {(() => {
                const isOwnAccount = userAccountNumber && accountNumber === userAccountNumber
                return (
                  <div className={`p-4 rounded-lg border ${isOwnAccount ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'}`}>
                    <p className={`text-sm ${isOwnAccount ? 'text-yellow-900 dark:text-yellow-100' : 'text-blue-900 dark:text-blue-100'}`}>
                      {isOwnAccount ? (
                        <>
                          By confirming, you authorize a transfer of <strong>${parseFloat(amount || 0).toFixed(2)}</strong> from your {selectedBank?.bank_name} account (****{selectedBank?.account_number_last4}) to your CapitalPath account <strong>{accountNumber}</strong>. This deposit will be reviewed and approved by an administrator before being added to your balance.
                        </>
                      ) : (
                        <>
                          By confirming, you authorize a transfer of <strong>${parseFloat(amount || 0).toFixed(2)}</strong> from your {selectedBank?.bank_name} account (****{selectedBank?.account_number_last4}) to this account <strong>{accountNumber}</strong>. This transfer will be processed instantly.
                        </>
                      )}
                    </p>
                  </div>
                )
              })()}

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="gold"
                  className="flex-1 gap-2 text-lg h-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Confirm Transfer
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>

      {/* Link Bank Modal */}
      <LinkBankModal
        open={linkBankModalOpen}
        onOpenChange={setLinkBankModalOpen}
        userId={userId}
        onBankLinked={handleBankLinked}
      />
    </Dialog>
  )
}
