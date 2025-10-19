"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/lib/utils"
import { UserX, UserCheck, AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function UserManagement({ users, onUserUpdate }) {
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionType, setActionType] = useState(null) // 'activate' or 'deactivate'
  const [modalOpen, setModalOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  const getKYCBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Not Submitted</Badge>
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'deactivated':
        return <Badge variant="destructive">Deactivated</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const openModal = (user, action) => {
    setSelectedUser(user)
    setActionType(action)
    setModalOpen(true)
  }

  const handleAction = async () => {
    if (!selectedUser || !actionType) return

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/deactivate-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: selectedUser.id, 
          action: actionType 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user status')
      }

      toast.success('Success!', {
        description: data.message,
      })

      // Refresh user data
      if (onUserUpdate) {
        onUserUpdate()
      }

      setModalOpen(false)
      setSelectedUser(null)
      setActionType(null)
    } catch (error) {
      toast.error('Error', {
        description: error.message,
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View and manage all registered users</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>KYC Status</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getStatusBadge(user.status || 'active')}</TableCell>
                <TableCell>{getKYCBadge(user.kyc_status)}</TableCell>
                <TableCell>{formatCurrency(parseFloat(user.balance || 0))}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(user.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {user.status === 'deactivated' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal(user, 'activate')}
                        disabled={processing}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal(user, 'deactivate')}
                        disabled={processing}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Deactivate
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        )}
      </CardContent>

      {/* Deactivate/Activate User Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'deactivate' ? (
                <>
                  <UserX className="h-5 w-5 text-red-600" />
                  Deactivate Account
                </>
              ) : (
                <>
                  <UserCheck className="h-5 w-5 text-green-600" />
                  Activate Account
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedUser && (
                actionType === 'deactivate' ? (
                  `Are you sure you want to deactivate ${selectedUser.full_name || selectedUser.email}'s account? This will prevent them from accessing their account, deactivate any active credit cards, and send them a notification about the deactivation.`
                ) : (
                  `Are you sure you want to reactivate ${selectedUser.full_name || selectedUser.email}'s account? This will restore their access to the platform.`
                )
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction}
              disabled={processing}
              variant={actionType === 'deactivate' ? 'destructive' : 'default'}
              className={actionType === 'activate' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {actionType === 'deactivate' ? 'Deactivating...' : 'Activating...'}
                </>
              ) : (
                <>
                  {actionType === 'deactivate' ? (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Deactivate Account
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activate Account
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

