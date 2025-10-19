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
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-accent">
              {getTransactionIcon(transaction.type)}
            </div>
            <div>
              <p className="font-medium capitalize">{transaction.type}</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(transaction.created_at)}
              </p>
              {transaction.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {transaction.description}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
              {transaction.type === 'deposit' ? '+' : '-'}
              {formatCurrency(parseFloat(transaction.amount))}
            </p>
            <Badge variant={transaction.status === 'completed' ? 'success' : 'pending'} className="text-xs">
              {transaction.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

