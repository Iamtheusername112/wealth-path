"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Hash, Check, Search, User as UserIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function AssignAccountModal({ open, onOpenChange, users }) {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Select User, 2: Enter Account Number
  const [selectedUser, setSelectedUser] = useState(null)
  const [accountNumber, setAccountNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Filter users who don't have account numbers yet
  const usersWithoutAccount = users.filter(u => !u.account_number)
  
  const filteredUsers = usersWithoutAccount.filter(user =>
    !searchTerm ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const generateAccountNumber = () => {
    // Generate a random 12-digit account number
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `CP${timestamp}${random}`
  }

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setAccountNumber(generateAccountNumber())
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedUser || !accountNumber) return

    setLoading(true)

    try {
      const response = await fetch('/api/admin/assign-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          accountNumber: accountNumber.toUpperCase(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Account number assigned to ${selectedUser.full_name || selectedUser.email}`, {
          description: `Account: ${accountNumber}`
        })
        
        // Reset and close
        setStep(1)
        setSelectedUser(null)
        setAccountNumber("")
        setSearchTerm("")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(data.error || "Failed to assign account number")
      }
    } catch (error) {
      console.error('Assign account error:', error)
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setStep(1)
      setSelectedUser(null)
      setAccountNumber("")
      setSearchTerm("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Hash className="h-6 w-6 text-gold-600" />
            Assign Account Number
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Select a user to assign an account number"
              : "Enter or confirm the account number"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select User */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* User List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">
                      {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} without account numbers
                    </p>
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="w-full p-4 rounded-lg border-2 hover:border-gold-600 transition-all cursor-pointer group bg-card hover:bg-accent"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {user.profile_image_url ? (
                              <img
                                src={user.profile_image_url}
                                alt={user.full_name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gold-600"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-white font-semibold text-lg">
                                {user.full_name?.[0] || user.email[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-base">{user.full_name || 'Unnamed User'}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant={
                                    user.kyc_status === 'approved' ? 'success' :
                                    user.kyc_status === 'pending' ? 'warning' :
                                    'destructive'
                                  }
                                  className="text-xs"
                                >
                                  {user.kyc_status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Joined {new Date(user.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground mb-2">No account #</p>
                            <div className="inline-flex items-center gap-2 text-sm font-medium text-gold-600">
                              Assign →
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-1">
                      {searchTerm ? 'No users found' : 'All users have account numbers'}
                    </p>
                    <p className="text-sm">
                      {searchTerm ? 'Try a different search' : 'Great job! All accounts are set up'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Enter Account Number */}
          {step === 2 && selectedUser && (
            <div className="space-y-6">
              {/* Selected User */}
              <div className="p-4 rounded-lg bg-muted border">
                <div className="flex items-center gap-3">
                  {selectedUser.profile_image_url ? (
                    <img
                      src={selectedUser.profile_image_url}
                      alt={selectedUser.full_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gold-600"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-white font-semibold text-2xl">
                      {selectedUser.full_name?.[0] || selectedUser.email[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Assigning to:</p>
                    <p className="font-semibold text-lg">{selectedUser.full_name || 'Unnamed User'}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                  >
                    Change
                  </Button>
                </div>
              </div>

              {/* Account Number Input */}
              <div>
                <Label htmlFor="accountNumber" className="text-base font-semibold">Account Number</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  A unique 10-15 digit account number (auto-generated, but you can customize)
                </p>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="accountNumber"
                    type="text"
                    placeholder="CPXXXXXXXXXX"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.toUpperCase())}
                    className="pl-10 text-xl h-14 font-mono font-semibold tracking-wider"
                    required
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAccountNumber(generateAccountNumber())}
                  >
                    🔄 Generate New
                  </Button>
                  <p className="text-xs text-muted-foreground py-2">
                    Format: 10-15 alphanumeric characters (A-Z, 0-9)
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-900 dark:text-green-100">
                    <p className="font-semibold mb-1">Ready to Assign</p>
                    <p>
                      <strong>{selectedUser.full_name || selectedUser.email}</strong> will be assigned account number <strong className="font-mono">{accountNumber}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !accountNumber || accountNumber.length < 10}
                  variant="gold"
                  className="flex-1 gap-2 text-lg h-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Confirm & Assign
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}

