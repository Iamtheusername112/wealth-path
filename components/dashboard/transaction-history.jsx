"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  Download, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  Calendar,
  X
} from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { toast } from "sonner"

export function TransactionHistory({ transactions }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState("all") // all, today, week, month
  const [sortBy, setSortBy] = useState("newest") // newest, oldest, highest, lowest

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return []

    let filtered = [...transactions]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.amount?.toString().includes(searchTerm) ||
        t.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(t => t.type === typeFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.created_at)
        
        switch (dateRange) {
          case "today":
            return transactionDate >= today
          case "week":
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return transactionDate >= weekAgo
          case "month":
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return transactionDate >= monthAgo
          default:
            return true
        }
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at)
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at)
        case "highest":
          return parseFloat(b.amount) - parseFloat(a.amount)
        case "lowest":
          return parseFloat(a.amount) - parseFloat(b.amount)
        default:
          return 0
      }
    })

    return filtered
  }, [transactions, searchTerm, typeFilter, statusFilter, dateRange, sortBy])

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      toast.error("No transactions to export")
      return
    }

    const headers = ["Date", "Type", "Description", "Amount", "Status", "Reference"]
    const rows = filteredTransactions.map(t => [
      formatDateTime(t.created_at),
      t.type,
      t.description,
      t.amount,
      t.status,
      t.reference_number || ""
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success("Transactions exported successfully!")
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setStatusFilter("all")
    setDateRange("all")
    setSortBy("newest")
  }

  const hasActiveFilters = searchTerm || typeFilter !== "all" || statusFilter !== "all" || dateRange !== "all" || sortBy !== "newest"

  return (
    <Card className="shadow-lg shadow-black/10">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              {filteredTransactions.length} of {transactions?.length || 0} transactions
            </CardDescription>
          </div>
          <Button 
            onClick={exportToCSV} 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto"
            disabled={filteredTransactions.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Amount</SelectItem>
                <SelectItem value="lowest">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button 
              onClick={clearFilters} 
              variant="ghost" 
              size="sm"
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Transactions List */}
        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-lg font-medium mb-1">No transactions found</p>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters ? "Try adjusting your filters" : "No transactions yet"}
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const isPositive = transaction.type === 'deposit' || transaction.type === 'credit'
              const Icon = isPositive ? ArrowDownRight : ArrowUpRight
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-full ${isPositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      <Icon className={`h-4 w-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{transaction.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDateTime(transaction.created_at)}</span>
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs">
                          {transaction.type}
                        </Badge>
                        {transaction.reference_number && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{transaction.reference_number}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : '-'}{formatCurrency(Math.abs(parseFloat(transaction.amount)))}
                    </p>
                    <Badge 
                      variant={
                        transaction.status === 'completed' ? 'success' : 
                        transaction.status === 'pending' ? 'warning' : 
                        'destructive'
                      }
                      className="text-xs mt-1"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

