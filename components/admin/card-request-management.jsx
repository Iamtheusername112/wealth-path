"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  User,
  Mail,
  Calendar,
  Edit,
  Settings
} from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CardRequestManagement() {
  const [requests, setRequests] = useState([])
  const [activeCards, setActiveCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [modalType, setModalType] = useState(null) // 'type' or 'network'
  const [modalOpen, setModalOpen] = useState(false)
  const [newCardType, setNewCardType] = useState('')
  const [newCardNetwork, setNewCardNetwork] = useState('')

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/admin/card-requests')
      const data = await response.json()

      console.log('Card requests response:', data) // Debug log

      if (data.success) {
        console.log('Setting requests:', data.requests) // Debug log
        setRequests(data.requests || [])
      } else {
        console.error('API returned error:', data.error)
        toast.error(data.error || 'Failed to fetch card requests')
      }
    } catch (error) {
      console.error('Error fetching card requests:', error)
      toast.error('Failed to fetch card requests')
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveCards = async () => {
    try {
      const response = await fetch('/api/admin/active-cards')
      const data = await response.json()

      if (data.success) {
        setActiveCards(data.cards || [])
      }
    } catch (error) {
      console.error('Error fetching active cards:', error)
    }
  }

  useEffect(() => {
    fetchRequests()
    fetchActiveCards()
  }, [])

  const handleAction = async (requestId, action, cardType = 'platinum', cardNetwork = 'visa') => {
    setProcessingId(requestId)
    try {
      const response = await fetch('/api/admin/card-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId, action, cardType, cardNetwork }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request')
      }

      toast.success('Success!', {
        description: data.message,
      })
      fetchRequests()
      fetchActiveCards()
    } catch (error) {
      toast.error('Error', {
        description: error.message,
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReassignCard = async (cardId, newCardType, cardNetwork) => {
    setProcessingId(cardId)
    try {
      const response = await fetch('/api/admin/reassign-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardId, newCardType, cardNetwork }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reassign card')
      }

      toast.success('Card Type Updated!', {
        description: data.message,
      })
      fetchActiveCards()
    } catch (error) {
      toast.error('Error', {
        description: error.message,
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReassignCardNetwork = async (cardId, newCardNetwork) => {
    setProcessingId(cardId)
    try {
      const response = await fetch('/api/admin/reassign-card-network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardId, newCardNetwork }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change card network')
      }

      toast.success('Card Network Updated!', {
        description: data.message,
      })
      fetchActiveCards()
    } catch (error) {
      toast.error('Error', {
        description: error.message,
      })
    } finally {
      setProcessingId(null)
    }
  }

  const openModal = (card, type) => {
    setSelectedCard(card)
    setModalType(type)
    setNewCardType(card.card_type)
    setNewCardNetwork(card.card_network || 'visa')
    setModalOpen(true)
  }

  const handleModalSubmit = async () => {
    if (!selectedCard) return

    if (modalType === 'type') {
      await handleReassignCard(selectedCard.id, newCardType, newCardNetwork)
    } else if (modalType === 'network') {
      await handleReassignCardNetwork(selectedCard.id, newCardNetwork)
    }

    setModalOpen(false)
    setSelectedCard(null)
    setModalType(null)
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'destructive',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const processedRequests = requests.filter(r => r.status !== 'pending')

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading card requests...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Cards - Reassignment Section */}
      {activeCards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Active Cards
              <Badge variant="default" className="ml-2">
                {activeCards.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Manage and reassign card types for existing cardholders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Change Type</TableHead>
                  <TableHead>Change Network</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-medium">
                      {card.card_holder_name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {card.user_email || card.user_id}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="default"
                        className={
                          card.card_type === 'black' ? 'bg-black' :
                          card.card_type === 'gold' ? 'bg-yellow-600' :
                          'bg-slate-600'
                        }
                      >
                        {card.card_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {(card.card_network || 'visa').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      ${card.credit_limit.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(card.issued_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal(card, 'type')}
                        disabled={processingId === card.id}
                        className="w-24 h-8 text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Change
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal(card, 'network')}
                        disabled={processingId === card.id}
                        className="w-24 h-8 text-xs"
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Change
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-yellow-600" />
            Pending Card Requests
            {pendingRequests.length > 0 && (
              <Badge variant="warning" className="ml-2">
                {pendingRequests.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Review and approve credit card requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending card requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 hover:border-gold-600/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {request.users?.full_name || 'Unknown User'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {request.users?.email}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Requested: {new Date(request.requested_at).toLocaleString()}
                          </span>
                        </div>
                        <Badge variant={
                          request.users?.kyc_status === 'approved' ? 'success' : 'warning'
                        }>
                          KYC: {request.users?.kyc_status || 'unknown'}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-24">Card Type:</span>
                          <Select 
                            defaultValue="platinum"
                            onValueChange={(value) => {
                              request.selectedCardType = value
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="platinum">Platinum ($10k)</SelectItem>
                              <SelectItem value="gold">Gold ($20k)</SelectItem>
                              <SelectItem value="black">Black ($50k)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-24">Card Network:</span>
                          <Select 
                            defaultValue="visa"
                            onValueChange={(value) => {
                              request.selectedCardNetwork = value
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="visa">Visa</SelectItem>
                              <SelectItem value="mastercard">Mastercard</SelectItem>
                              <SelectItem value="amex">American Express</SelectItem>
                              <SelectItem value="discover">Discover</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                        onClick={() => handleAction(
                          request.id, 
                          'approve', 
                          request.selectedCardType || 'platinum',
                          request.selectedCardNetwork || 'visa'
                        )}
                        disabled={processingId === request.id || request.users?.kyc_status !== 'approved'}
                        title={request.users?.kyc_status !== 'approved' ? 'KYC must be approved first' : 'Approve request'}
                      >
                        {processingId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => handleAction(request.id, 'reject')}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Requests History */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
            <CardDescription>Previously processed card requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedRequests.slice(0, 10).map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.users?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {request.users?.email}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(request.requested_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {request.processed_at 
                        ? new Date(request.processed_at).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Change Card Type/Network Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {modalType === 'type' ? 'Change Card Type' : 'Change Card Network'}
            </DialogTitle>
            <DialogDescription>
              {selectedCard && (
                <>
                  Update {selectedCard.card_holder_name}'s card {modalType === 'type' ? 'type' : 'network'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {modalType === 'type' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Type</label>
                <Select value={newCardType} onValueChange={setNewCardType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platinum">Platinum ($10,000 limit)</SelectItem>
                    <SelectItem value="gold">Gold ($20,000 limit)</SelectItem>
                    <SelectItem value="black">Black ($50,000 limit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {modalType === 'network' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Network</label>
                <Select value={newCardNetwork} onValueChange={setNewCardNetwork}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="amex">American Express</SelectItem>
                    <SelectItem value="discover">Discover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {modalType === 'type' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Network</label>
                <Select value={newCardNetwork} onValueChange={setNewCardNetwork}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="amex">American Express</SelectItem>
                    <SelectItem value="discover">Discover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleModalSubmit}
              disabled={processingId === selectedCard?.id}
            >
              {processingId === selectedCard?.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                `Update ${modalType === 'type' ? 'Type' : 'Network'}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

