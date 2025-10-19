"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MessageSquare, Send, CheckCircle, Loader2, UserCheck, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

export function SupportTicketManagement({ initialTickets = [] }) {
  const [tickets, setTickets] = useState(initialTickets)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState('respond') // 'respond' or 'resolve'
  const [adminResponse, setAdminResponse] = useState("")
  const [reactivateAccount, setReactivateAccount] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchTickets()
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchTickets()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/admin/support-tickets')
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    }
  }

  const openTicket = (ticket) => {
    setSelectedTicket(ticket)
    setAdminResponse("")
    setModalAction('respond')
    setReactivateAccount(false)
    setModalOpen(true)
  }

  const handleRespond = async () => {
    if (!selectedTicket || !adminResponse.trim()) {
      toast.error("Please provide a response")
      return
    }

    setProcessing(true)

    try {
      const response = await fetch('/api/admin/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          action: 'respond',
          response: adminResponse,
          reactivateAccount,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Response sent successfully', {
          description: reactivateAccount ? 'User account has been reactivated' : 'User has been notified'
        })
        fetchTickets()
        setModalOpen(false)
        setSelectedTicket(null)
        setAdminResponse("")
        setReactivateAccount(false)
      } else {
        toast.error(data.error || "Failed to send response")
      }
    } catch (error) {
      console.error('Respond error:', error)
      toast.error("An error occurred")
    } finally {
      setProcessing(false)
    }
  }

  const handleResolve = async (ticket) => {
    setSelectedTicket(ticket)
    setModalAction('resolve')
    setReactivateAccount(ticket.category === 'account_reactivation' && ticket.users?.status === 'deactivated')
    setAdminResponse("") // Clear response for resolve action
    setModalOpen(true)
  }

  const handleResolveConfirm = async () => {
    if (!selectedTicket) return

    setProcessing(true)

    try {
      const response = await fetch('/api/admin/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          action: 'resolve',
          reactivateAccount,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Ticket marked as resolved', {
          description: reactivateAccount ? 'User account has been reactivated' : undefined
        })
        fetchTickets()
        setModalOpen(false)
        setSelectedTicket(null)
        setReactivateAccount(false)
      } else {
        toast.error(data.error || "Failed to resolve ticket")
      }
    } catch (error) {
      console.error('Resolve error:', error)
      toast.error("An error occurred")
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge variant="warning">Open</Badge>
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>
      case 'high':
        return <Badge className="bg-orange-600">High</Badge>
      case 'normal':
        return <Badge variant="default">Normal</Badge>
      case 'low':
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  const getCategoryBadge = (category) => {
    const categoryMap = {
      account_reactivation: { label: 'Account Reactivation', color: 'bg-red-600' },
      technical_issue: { label: 'Technical Issue', color: 'bg-blue-600' },
      billing: { label: 'Billing', color: 'bg-green-600' },
      general: { label: 'General', color: 'bg-gray-600' },
      other: { label: 'Other', color: 'bg-purple-600' },
    }

    const cat = categoryMap[category] || { label: category, color: 'bg-gray-600' }
    return <Badge className={cat.color}>{cat.label}</Badge>
  }

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress')
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed')

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gold-600" />
            Support Tickets
            {openTickets.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {openTickets.length} Open
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manage user support requests and account reactivation tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Open Tickets */}
            {openTickets.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Open Tickets</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{ticket.users?.full_name || 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground">{ticket.users?.email}</span>
                            {ticket.users?.status === 'deactivated' && (
                              <Badge variant="destructive" className="mt-1 w-fit text-xs">Deactivated</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryBadge(ticket.category)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{ticket.subject}</TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(ticket.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openTicket(ticket)}
                              disabled={processing}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Respond
                            </Button>
                            {ticket.status === 'in_progress' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResolve(ticket)}
                                disabled={processing}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Resolve
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Resolved Tickets */}
            {resolvedTickets.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Resolved Tickets ({resolvedTickets.length})</h3>
                <div className="text-sm text-muted-foreground">
                  {resolvedTickets.length} ticket(s) have been resolved
                </div>
              </div>
            )}

            {tickets.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-1">No support tickets</p>
                <p className="text-sm">Tickets will appear here when users submit support requests</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Respond Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {modalAction === 'resolve' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Resolve Support Ticket
                </>
              ) : (
                <>
                  <MessageSquare className="h-5 w-5" />
                  Respond to Support Ticket
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedTicket ? (
                `Ticket from ${selectedTicket.users?.full_name || 'Unknown User'} - ${selectedTicket.category?.replace('_', ' ').toUpperCase() || 'N/A'}`
              ) : (
                'Loading...'
              )}
            </DialogDescription>
            {selectedTicket && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-medium">{selectedTicket.users?.full_name || 'Unknown User'}</span>
                {getCategoryBadge(selectedTicket.category)}
                {getPriorityBadge(selectedTicket.priority)}
              </div>
            )}
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Subject:</p>
                <p className="text-sm">{selectedTicket.subject}</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">User Message:</p>
                <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>

              {selectedTicket.admin_response && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Previous Response:</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.admin_response}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Responded on {formatDate(selectedTicket.responded_at)}
                  </p>
                </div>
              )}

              {modalAction === 'respond' && (
                <div className="space-y-2">
                  <Label htmlFor="response">Your Response *</Label>
                  <Textarea
                    id="response"
                    placeholder="Type your response to the user..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    required
                    disabled={processing}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    The user will receive a notification with your response. Use "Resolve" to close the ticket.
                  </p>
                </div>
              )}

              {modalAction === 'resolve' && selectedTicket.category === 'account_reactivation' && selectedTicket.users?.status === 'deactivated' && (
                <div className="flex items-start space-x-2 bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <Checkbox
                    id="reactivate"
                    checked={reactivateAccount}
                    onCheckedChange={setReactivateAccount}
                    disabled={processing}
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="reactivate"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                    >
                      <UserCheck className="h-4 w-4 text-green-600" />
                      Reactivate user account
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Check this box to restore full access to the user's account when resolving this ticket.
                    </p>
                  </div>
                </div>
              )}

              {modalAction === 'resolve' && (
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> Resolving this ticket will mark it as complete. The user will be notified{reactivateAccount ? ' and their account will be reactivated' : ''}.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={processing}>
              Cancel
            </Button>
            {modalAction === 'respond' ? (
              <Button onClick={handleRespond} disabled={processing}>
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Response
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleResolveConfirm} disabled={processing} className="bg-green-600 hover:bg-green-700">
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve Ticket
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
