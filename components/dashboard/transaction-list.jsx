import { ArrowUpRight, ArrowDownRight, Send } from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function TransactionList({ transactions }) {
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      case 'transfer':
        return <Send className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600'
      case 'withdrawal':
        return 'text-red-600'
      case 'transfer':
        return 'text-blue-600'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {transactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="flex items-center justify-between p-3 sm:p-4 rounded-xl border hover:bg-accent/50 transition-all duration-200 shadow-lg shadow-black/10"
        >
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="p-2 rounded-full bg-accent flex-shrink-0">
              {getTransactionIcon(transaction.type)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium capitalize text-sm sm:text-base truncate">{transaction.type}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {formatDateTime(transaction.created_at)}
              </p>
              {transaction.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {transaction.description}
                </p>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <p className={`font-semibold text-sm sm:text-base ${getTransactionColor(transaction.type)}`}>
              {transaction.type === 'deposit' ? '+' : '-'}
              {formatCurrency(parseFloat(transaction.amount))}
            </p>
            <Badge variant={transaction.status === 'completed' ? 'success' : 'pending'} className="text-xs mt-1">
              {transaction.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

