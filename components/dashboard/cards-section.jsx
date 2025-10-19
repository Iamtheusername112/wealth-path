"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Plus, Loader2, Clock } from "lucide-react"
import { CreditCardDisplay } from "./credit-card-display"
import { RequestCardModal } from "./request-card-modal"
import { Badge } from "@/components/ui/badge"

export function CardsSection({ userId, user }) {
  const [cards, setCards] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  
  // Check if user account is active
  const isAccountActive = user?.status === 'active'

  const fetchCards = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/credit-cards/list')
      const data = await response.json()

      if (data.success) {
        setCards(data.cards || [])
        setPendingRequests(data.pendingRequests || [])
      } else {
        console.error('API error:', data)
        // Still set empty arrays so UI shows properly
        setCards([])
        setPendingRequests([])
      }
    } catch (error) {
      console.error('Error fetching cards:', error)
      // Still set empty arrays so UI shows properly
      setCards([])
      setPendingRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCards()
  }, [])

  const hasPendingRequest = pendingRequests.length > 0
  const hasCard = cards.length > 0

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading cards...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gold-600" />
                My Credit Cards
              </CardTitle>
              <CardDescription>Manage your premium credit cards</CardDescription>
            </div>
            {!hasCard && !hasPendingRequest && (
              <Button 
                variant="gold"
                onClick={() => setRequestModalOpen(true)}
                disabled={!isAccountActive}
                title={!isAccountActive ? "Account deactivated - contact support" : ""}
              >
                <Plus className="h-4 w-4 mr-2" />
                Request Card
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasPendingRequest && (
            <div className="mb-6 rounded-lg border border-yellow-600/20 bg-yellow-50 dark:bg-yellow-950/10 p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                    Request Pending
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Your credit card request is being reviewed by our admin team. 
                    You'll receive a notification once it's approved.
                  </p>
                  <div className="mt-3">
                    <Badge variant="warning">
                      Requested on {new Date(pendingRequests[0].requested_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasCard ? (
            <div className="grid md:grid-cols-2 gap-6">
              {cards.map((card) => (
                <CreditCardDisplay key={card.id} card={card} />
              ))}
            </div>
          ) : !hasPendingRequest ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-100 dark:bg-gold-950/20 mb-4">
                <CreditCard className="h-8 w-8 text-gold-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Credit Cards Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Request a premium CapitalPath credit card to enjoy exclusive benefits, 
                rewards, and a sleek metal card design.
              </p>
              <Button 
                variant="gold"
                size="lg"
                onClick={() => setRequestModalOpen(true)}
                disabled={!isAccountActive}
                title={!isAccountActive ? "Account deactivated - contact support" : ""}
              >
                <Plus className="h-5 w-5 mr-2" />
                Request Your First Card
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Always visible Go to Dashboard button outside the card */}
      <div className="flex justify-center">
        <Button 
          variant="gold"
          size="lg"
          onClick={() => window.location.href = '/dashboard'}
          className="min-w-[200px]"
        >
          Go to Dashboard
        </Button>
      </div>

      <RequestCardModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        userId={userId}
        onRequestSuccess={fetchCards}
      />
    </div>
  )
}

