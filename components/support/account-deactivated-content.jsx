"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Mail, Phone, MessageSquare } from "lucide-react"
import { SupportTicketModal } from "./support-ticket-modal"

export function AccountDeactivatedContent({ userId, user }) {
  const [ticketModalOpen, setTicketModalOpen] = useState(false)

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Account Deactivated</CardTitle>
            <CardDescription className="text-base">
              Your account has been deactivated by an administrator.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                We're sorry, but your account access has been temporarily suspended. 
                This may be due to security concerns, policy violations, or other administrative reasons.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">What this means:</p>
                <ul className="text-sm text-muted-foreground space-y-1 text-left">
                  <li>• You cannot access your dashboard</li>
                  <li>• All transactions are suspended</li>
                  <li>• Credit cards are deactivated</li>
                  <li>• Account features are disabled</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-medium mb-3">Need help? Contact our support team:</p>
                
                <div className="space-y-2">
                  <Button 
                    variant="default" 
                    className="w-full bg-gold-600 hover:bg-gold-700"
                    onClick={() => setTicketModalOpen(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Request Account Reactivation
                  </Button>

                  <div className="text-xs text-muted-foreground my-2">or</div>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <a href="mailto:support@capitalpath.com" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      support@capitalpath.com
                    </a>
                  </Button>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <a href="tel:+1-800-CAPITAL" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      1-800-CAPITAL
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center pt-4 border-t">
              <Button variant="ghost" asChild>
                <a href="/sign-in">Sign Out</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <SupportTicketModal 
        open={ticketModalOpen}
        onOpenChange={setTicketModalOpen}
        userId={userId}
        defaultCategory="account_reactivation"
        defaultSubject="Request to Reactivate My Account"
      />
    </>
  )
}
