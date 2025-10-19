"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDateTime } from "@/lib/utils"

export function TransactionManagement({ transactions, users }) {
  const getUserEmail = (userId) => {
    const user = users.find(u => u.id === userId)
    return user?.email || 'Unknown'
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case 'deposit':
        return <Badge variant="success">Deposit</Badge>
      case 'withdrawal':
        return <Badge variant="warning">Withdrawal</Badge>
      case 'transfer':
        return <Badge>Transfer</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Management</CardTitle>
        <CardDescription>View all platform transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {getUserEmail(transaction.user_id)}
                </TableCell>
                <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(parseFloat(transaction.amount))}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {transaction.description || 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant={transaction.status === 'completed' ? 'success' : 'pending'}>
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(transaction.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {transactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found
          </div>
        )}
      </CardContent>
    </Card>
  )
}

