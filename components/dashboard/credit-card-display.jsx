"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Eye, EyeOff, Copy, Wifi } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

export function CreditCardDisplay({ card }) {
  const [showDetails, setShowDetails] = useState(true)

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  const getCardStyle = () => {
    const styles = {
      platinum: {
        gradient: 'from-slate-600 via-slate-700 to-slate-800',
        textColor: 'text-white',
        chipColor: 'from-yellow-400 to-yellow-500',
        badgeColor: 'bg-slate-500 text-white'
      },
      gold: {
        gradient: 'from-amber-500 via-yellow-500 to-yellow-600',
        textColor: 'text-white',
        chipColor: 'from-yellow-300 to-yellow-400',
        badgeColor: 'bg-yellow-600 text-white'
      },
      black: {
        gradient: 'from-gray-900 via-black to-gray-900',
        textColor: 'text-white',
        chipColor: 'from-yellow-400 to-yellow-500',
        badgeColor: 'bg-black text-white'
      }
    }
    return styles[card.card_type] || styles.platinum
  }

  const getNetworkLogo = () => {
    const networks = {
      visa: 'VISA',
      mastercard: 'Mastercard',
      amex: 'AMEX',
      discover: 'Discover'
    }
    return networks[card.card_network] || 'VISA'
  }

  const style = getCardStyle()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Front Card */}
        <div className="relative group w-full">
          <div className="relative w-full max-w-[400px] mx-auto aspect-[1.586/1] rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 group-hover:scale-105">
            <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`}>
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/20 via-transparent to-black/20"></div>
              
              {/* Card content */}
              <div className="relative h-full p-4 sm:p-6 flex flex-col">
                {/* Bank name - top */}
                <div className="mb-2 sm:mb-4">
                  <p className={`text-base sm:text-lg font-bold ${style.textColor} opacity-90`}>
                    CAPITALPATH
                  </p>
                </div>

                {/* Top section */}
                <div className="flex justify-between items-start mb-6 sm:mb-12">
                  {/* Real EMV Chip */}
                  <div className="relative w-10 h-8 sm:w-14 sm:h-10 rounded-lg bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg border border-yellow-600">
                    {/* Chip contact pattern */}
                    <div className="absolute inset-1">
                      {/* Top row of contacts */}
                      <div className="flex justify-between mb-1">
                        <div className="w-2 h-1 bg-yellow-800 rounded-sm"></div>
                        <div className="w-2 h-1 bg-yellow-800 rounded-sm"></div>
                        <div className="w-2 h-1 bg-yellow-800 rounded-sm"></div>
                        <div className="w-2 h-1 bg-yellow-800 rounded-sm"></div>
                      </div>
                      {/* Middle row of contacts */}
                      <div className="flex justify-between mb-1">
                        <div className="w-2 h-1 bg-yellow-800 rounded-sm"></div>
                        <div className="w-2 h-1 bg-yellow-800 rounded-sm"></div>
                        <div className="w-2 h-1 bg-yellow-800 rounded-sm"></div>
                        <div className="w-2 h-1 bg-yellow-800 rounded-sm"></div>
                      </div>
                      {/* Bottom row of contacts */}
                      <div className="flex justify-between">
                        <div className="w-2 h-1 bg-yellow-800 rounded-sm"></div>
                        <div className="w-2 h-1 bg-yellow-800 rounded-sm"></div>
                        <div className="w-2 h-1 bg-yellow-800 rounded-sm"></div>
                        <div className="w-2 h-1 bg-yellow-800 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                  <div className={`text-base sm:text-xl font-bold ${style.textColor} pr-8 sm:pr-16`}>
                    {getNetworkLogo()}
                  </div>
                </div>

                {/* Card number - centered */}
                <div className="flex-1 flex items-center justify-center">
                  <p className={`text-sm sm:text-xl font-mono font-semibold tracking-wider sm:tracking-widest ${style.textColor}`}>
                    {showDetails ? (card.card_number || '1234 5678 9012 3456') : '•••• •••• •••• ••••'}
                  </p>
                </div>

                {/* Bottom section */}
                <div className="flex justify-between items-end mb-6 sm:mb-12">
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-base font-medium ${style.textColor} truncate`}>
                      {card.card_holder_name || 'JOHN DOE'}
                    </p>
                  </div>
                  <div className="text-right ml-2 sm:ml-4 flex-shrink-0">
                    <p className={`text-xs sm:text-base font-medium ${style.textColor}`}>
                      {showDetails ? (card.expiry_date || '12/28') : '••/••'}
                    </p>
                  </div>
                </div>


                {/* Card type badge - top right */}
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${style.badgeColor} shadow-lg`}>
                    {card.card_type?.toUpperCase() || 'PLATINUM'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Card */}
        <div className="relative group w-full">
          <div className="relative w-full max-w-[400px] mx-auto aspect-[1.586/1] rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 group-hover:scale-105">
            <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`}>
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/20 via-transparent to-black/20"></div>
              
              <div className="relative h-full p-4 sm:p-6 pt-12 sm:pt-16">
                {/* Magnetic stripe */}
                <div className="absolute top-6 sm:top-8 left-0 right-0 h-8 sm:h-12 bg-black"></div>
                
                {/* Signature panel */}
                <div className="bg-white rounded-lg p-2 sm:p-3 mb-4 sm:mb-8">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 h-6 bg-gray-100 rounded border border-dashed border-gray-300 mr-3"></div>
                    <div className="bg-white border border-gray-300 rounded px-2 py-1">
                      <span className="text-sm font-bold text-gray-900">
                        {showDetails ? (card.cvv || '123') : '•••'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card info - clean and minimal */}
                <div className="space-y-3 sm:space-y-6">
                  <div>
                    <button
                      onClick={() => handleCopy(card.card_number, 'Card number')}
                      className={`font-mono text-xs sm:text-lg ${style.textColor} hover:opacity-80 flex items-center gap-2`}
                    >
                      {showDetails ? (card.card_number || '1234 5678 9012 3456') : '•••• •••• •••• ••••'}
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>

                  <div className="flex justify-end items-center">
                    <div className="flex flex-col items-center">
                      <Wifi className={`h-4 w-4 sm:h-6 sm:w-6 rotate-90 ${style.textColor} opacity-60`} />
                      <span className={`text-[10px] sm:text-xs ${style.textColor} opacity-50 mt-1`}>CONTACTLESS</span>
                    </div>
                  </div>
                </div>

                {/* Bottom info - fixed position */}
                <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className={`p-2 rounded-lg transition-colors ${style.textColor} hover:bg-white/10`}
                  >
                    {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-xl">
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Credit Limit</p>
          <p className="font-semibold text-xs sm:text-base">{formatCurrency(parseFloat(card.credit_limit))}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Available</p>
          <p className="font-semibold text-xs sm:text-base text-green-600">
            {formatCurrency(parseFloat(card.available_credit))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Status</p>
          <Badge variant={card.status === 'active' ? 'success' : 'destructive'} className="text-[10px] sm:text-xs">
            {card.status.toUpperCase()}
          </Badge>
        </div>
      </div>
    </div>
  )
}