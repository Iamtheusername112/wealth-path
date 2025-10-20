"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

export function BankingDetails({ user }) {
  const [copiedField, setCopiedField] = useState(null)

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`${fieldName} copied!`, {
      description: text
    })
    setTimeout(() => setCopiedField(null), 2000)
  }

  const bankingFields = [
    {
      label: "Account Holder Name",
      value: user?.full_name || user?.email,
      key: "account_name",
      icon: "👤"
    },
    {
      label: "Account Number",
      value: user?.account_number,
      key: "account_number",
      icon: "🔢"
    },
    {
      label: "SWIFT/BIC Code",
      value: user?.swift_code,
      key: "swift_code",
      icon: "🌍",
      description: "For international transfers"
    },
    {
      label: "IBAN",
      value: user?.iban,
      key: "iban",
      icon: "🏦",
      description: "International Bank Account Number"
    },
    {
      label: "Routing Number (ABA)",
      value: user?.routing_number,
      key: "routing_number",
      icon: "🔀",
      description: "For US domestic transfers"
    },
    {
      label: "Sort Code",
      value: user?.sort_code,
      key: "sort_code",
      icon: "🇬🇧",
      description: "For UK transfers"
    },
    {
      label: "Bank Name",
      value: "CapitalPath Financial",
      key: "bank_name",
      icon: "🏛️"
    },
    {
      label: "Bank Branch",
      value: user?.bank_branch || "CapitalPath Main Branch",
      key: "bank_branch",
      icon: "📍"
    },
    {
      label: "Bank Address",
      value: user?.bank_address || "1 CapitalPath Plaza, Financial District, New York, NY 10004",
      key: "bank_address",
      icon: "📮"
    }
  ]

  const hasCredentials = user?.account_number

  return (
    <Card className="shadow-lg shadow-black/10">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-gold-600" />
              Banking Details
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">Your CapitalPath account information for transfers</CardDescription>
          </div>
          {hasCredentials && (
            <div className="px-3 py-1 bg-green-100 dark:bg-green-950/30 border border-green-300 dark:border-green-800 rounded-full w-fit">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400">✓ Active</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {hasCredentials ? (
          <div className="space-y-4">
            {/* Info Banner */}
            <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                <strong>Share these details</strong> to receive money from external banks or other financial institutions.
              </p>
            </div>

            {/* Banking Credentials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {bankingFields.map((field) => (
                field.value && (
                  <div
                    key={field.key}
                    className="p-3 sm:p-4 rounded-lg border-2 hover:border-gold-600/50 transition-all bg-gradient-to-br from-card to-muted/30 group"
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-lg sm:text-xl flex-shrink-0">{field.icon}</span>
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{field.label}</p>
                          {field.description && (
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground italic hidden sm:block">{field.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(field.value, field.label)}
                        className="p-1.5 rounded hover:bg-accent transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Click to copy"
                      >
                        {copiedField === field.label ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground group-hover:text-gold-600" />
                        )}
                      </button>
                    </div>
                    <p className={`font-semibold truncate ${field.key === 'account_number' || field.key === 'iban' || field.key === 'swift_code' ? 'font-mono text-sm sm:text-base' : 'text-xs sm:text-sm'} ${field.key === 'account_number' ? 'text-gold-600 text-base sm:text-lg' : ''}`}>
                      {field.value}
                    </p>
                  </div>
                )
              ))}
            </div>

            {/* Wire Transfer Instructions */}
            <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-gradient-to-br from-navy-50 to-gold-50 dark:from-navy-950/20 dark:to-gold-950/20 border-2 border-gold-600/20 rounded-lg">
              <h4 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-gold-600" />
                Wire Transfer Instructions
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p className="text-muted-foreground">Bank Name:</p>
                  <p className="font-semibold truncate">CapitalPath Financial</p>
                  
                  <p className="text-muted-foreground">Account Name:</p>
                  <p className="font-semibold truncate">{user?.full_name || user?.email}</p>
                  
                  <p className="text-muted-foreground">Account Number:</p>
                  <p className="font-mono font-bold text-gold-600 truncate">{user?.account_number}</p>
                  
                  <p className="text-muted-foreground">SWIFT Code:</p>
                  <p className="font-mono font-semibold truncate">{user?.swift_code}</p>
                  
                  <p className="text-muted-foreground">Routing Number:</p>
                  <p className="font-mono font-semibold truncate">{user?.routing_number}</p>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-[10px] sm:text-xs text-yellow-900 dark:text-yellow-100">
                ⚠️ <strong>Security:</strong> Never share these details via unsecured channels. Always verify the recipient before sharing banking information.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">Banking Details Not Available</p>
            <p className="text-sm text-muted-foreground mb-4">
              Your banking details will be generated automatically once:
            </p>
            <div className="inline-block text-left mb-6">
              <p className="text-sm text-muted-foreground">1. ✅ Your KYC is approved</p>
              <p className="text-sm text-muted-foreground">2. ✅ Admin assigns your account number</p>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Please complete KYC verification and wait for admin approval
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

