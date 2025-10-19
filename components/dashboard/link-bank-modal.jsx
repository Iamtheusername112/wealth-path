"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Building2, Check, Shield, Globe, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { searchBanks, countries } from "@/lib/banks-data"

export function LinkBankModal({ open, onOpenChange, userId, onBankLinked }) {
  const [step, setStep] = useState(1) // 1: Search Bank, 2: Enter Details, 3: Verification
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedBank, setSelectedBank] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const [accountDetails, setAccountDetails] = useState({
    accountHolderName: "",
    accountType: "checking",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    iban: "",
  })

  const searchResults = searchQuery || selectedCountry
    ? searchBanks(selectedCountry || searchQuery).slice(0, 10)
    : []

  const handleBankSelect = (bank) => {
    setSelectedBank(bank)
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStep(3)
    setLoading(true)

    try {
      // Simulate verification delay (in production, this would verify with the bank)
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await fetch('/api/bank-accounts/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          bankName: selectedBank.name,
          bankCountry: selectedBank.country,
          bankCode: selectedBank.code,
          currency: selectedBank.currency,
          accountType: accountDetails.accountType,
          accountHolderName: accountDetails.accountHolderName,
          accountNumberLast4: accountDetails.accountNumber.slice(-4),
          routingNumber: accountDetails.routingNumber,
          swiftCode: accountDetails.swiftCode || selectedBank.code,
          iban: accountDetails.iban,
          isVerified: true, // In production, this would be false until micro-deposit verification
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const linkedAccount = data.account
        
        toast.success(`${selectedBank.name} account linked successfully!`, {
          description: "Proceeding to transfer details..."
        })
        
        // Reset form
        setStep(1)
        setSelectedBank(null)
        setAccountDetails({
          accountHolderName: "",
          accountType: "checking",
          accountNumber: "",
          routingNumber: "",
          swiftCode: "",
          iban: "",
        })
        setSearchQuery("")
        setSelectedCountry("")
        
        // Close this modal
        onOpenChange(false)
        
        // Notify parent with the newly linked bank account
        if (onBankLinked) {
          onBankLinked(linkedAccount)
        }
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to link account")
        setStep(2)
      }
    } catch (error) {
      console.error('Link bank error:', error)
      toast.error("An error occurred")
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setStep(1)
      setSelectedBank(null)
      setSearchQuery("")
      setSelectedCountry("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Building2 className="h-6 w-6 text-gold-600" />
            Link Bank Account
          </DialogTitle>
          <DialogDescription>
            Search for your bank and securely link your account
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Search and Select Bank */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Search by Name */}
              <div>
                <Label htmlFor="search" className="mb-2 block">Search by Bank Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="e.g., Chase, HSBC, DBS..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setSelectedCountry("")
                    }}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Filter by Country */}
              <div>
                <Label className="mb-2 block">Or Filter by Country</Label>
                <Select value={selectedCountry} onValueChange={(value) => {
                  setSelectedCountry(value)
                  setSearchQuery("")
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country..." />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        🌍 {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <p className="text-sm text-muted-foreground mb-3">
                  {searchResults.length} bank{searchResults.length !== 1 ? 's' : ''} found
                </p>
                {searchResults.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => handleBankSelect(bank)}
                    className="w-full p-4 rounded-lg border-2 hover:border-gold-600 transition-all text-left group bg-card hover:bg-accent"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-2xl">
                          {bank.logo}
                        </div>
                        <div>
                          <p className="font-semibold text-base">{bank.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span>{bank.country}</span>
                            <span className="text-xs">•</span>
                            <span>{bank.currency}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gold-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {searchQuery || selectedCountry
                    ? "No banks found. Try a different search."
                    : "Search for your bank by name or select a country"}
                </p>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Secure Connection:</strong> We use 256-bit encryption to protect your banking information. Your credentials are never stored on our servers.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Enter Account Details */}
        {step === 2 && selectedBank && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Bank */}
            <div className="p-4 rounded-lg bg-muted flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-2xl">
                  {selectedBank.logo}
                </div>
                <div>
                  <p className="font-semibold">{selectedBank.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedBank.country}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep(1)
                  setSelectedBank(null)
                }}
              >
                Change
              </Button>
            </div>

            {/* Account Holder Name */}
            <div>
              <Label htmlFor="holderName">Account Holder Name</Label>
              <Input
                id="holderName"
                placeholder="Full name as it appears on account"
                value={accountDetails.accountHolderName}
                onChange={(e) => setAccountDetails({...accountDetails, accountHolderName: e.target.value})}
                required
              />
            </div>

            {/* Account Type */}
            <div>
              <Label>Account Type</Label>
              <Select
                value={accountDetails.accountType}
                onValueChange={(value) => setAccountDetails({...accountDetails, accountType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking Account</SelectItem>
                  <SelectItem value="savings">Savings Account</SelectItem>
                  <SelectItem value="business">Business Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Account Number */}
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                type="text"
                placeholder="Enter your account number"
                value={accountDetails.accountNumber}
                onChange={(e) => setAccountDetails({...accountDetails, accountNumber: e.target.value})}
                required
              />
            </div>

            {/* Routing Number / Sort Code (for US/UK) */}
            {(selectedBank.country === "United States" || selectedBank.country === "United Kingdom") && (
              <div>
                <Label htmlFor="routing">
                  {selectedBank.country === "United States" ? "Routing Number" : "Sort Code"}
                </Label>
                <Input
                  id="routing"
                  placeholder={selectedBank.country === "United States" ? "9-digit routing number" : "6-digit sort code"}
                  value={accountDetails.routingNumber}
                  onChange={(e) => setAccountDetails({...accountDetails, routingNumber: e.target.value})}
                />
              </div>
            )}

            {/* IBAN (for European banks) */}
            {selectedBank.currency === "EUR" && (
              <div>
                <Label htmlFor="iban">IBAN (International Bank Account Number)</Label>
                <Input
                  id="iban"
                  placeholder="e.g., DE89370400440532013000"
                  value={accountDetails.iban}
                  onChange={(e) => setAccountDetails({...accountDetails, iban: e.target.value.toUpperCase()})}
                />
              </div>
            )}

            {/* SWIFT/BIC Code */}
            <div>
              <Label htmlFor="swift">SWIFT/BIC Code (Optional)</Label>
              <Input
                id="swift"
                placeholder="e.g., CHASUS33"
                value={accountDetails.swiftCode}
                onChange={(e) => setAccountDetails({...accountDetails, swiftCode: e.target.value.toUpperCase()})}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for international transfers
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                <strong>Verification Required:</strong> To complete the linking process, we'll make two small deposits (less than $1.00 each) to your account within 1-2 business days. You'll need to verify these amounts to activate transfers.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="gold"
                className="flex-1 gap-2"
                disabled={loading}
              >
                Link Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Verification Processing */}
        {step === 3 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gold-600/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Loader2 className="h-10 w-10 text-gold-600 animate-spin" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Verifying Your Account...</h3>
            <p className="text-muted-foreground mb-6">
              Please wait while we securely verify your bank account
            </p>
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gold-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-gold-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-gold-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

