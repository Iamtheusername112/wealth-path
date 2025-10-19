"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  FileCheck, 
  DollarSign, 
  TrendingUp,
  Shield
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { UserManagement } from "./user-management"
import { KYCManagement } from "./kyc-management"
import { TransactionManagement } from "./transaction-management"
import { CardRequestManagement } from "./card-request-management"

export function AdminContent({ users, kycDocuments, transactions, investments }) {
  const [activeTab, setActiveTab] = useState("overview")

  const stats = {
    totalUsers: users.length,
    pendingKYC: users.filter(u => u.kyc_status === 'pending').length,
    approvedKYC: users.filter(u => u.kyc_status === 'approved').length,
    totalTransactions: transactions.length,
    totalInvestments: investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8 text-gold-600" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Manage users, KYC verifications, and platform activity</p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              {stats.totalUsers}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending KYC</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-yellow-600" />
              {stats.pendingKYC}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Transactions</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              {stats.totalTransactions}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Investments</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              {formatCurrency(stats.totalInvestments)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview" active={activeTab === "overview"}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" active={activeTab === "users"}>
            Users
          </TabsTrigger>
          <TabsTrigger value="kyc" active={activeTab === "kyc"}>
            KYC Verification
          </TabsTrigger>
          <TabsTrigger value="transactions" active={activeTab === "transactions"}>
            Transactions
          </TabsTrigger>
          <TabsTrigger value="cards" active={activeTab === "cards"}>
            Credit Cards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
                <CardDescription>Key metrics and recent activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Approved Users</p>
                      <p className="text-sm text-muted-foreground">Active KYC verified accounts</p>
                    </div>
                    <Badge variant="success" className="text-lg px-4 py-2">
                      {stats.approvedKYC}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Pending Verifications</p>
                      <p className="text-sm text-muted-foreground">Awaiting KYC review</p>
                    </div>
                    <Badge variant="warning" className="text-lg px-4 py-2">
                      {stats.pendingKYC}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Recent Transactions</p>
                      <p className="text-sm text-muted-foreground">Last 24 hours</p>
                    </div>
                    <Badge className="text-lg px-4 py-2">
                      {transactions.filter(t => {
                        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
                        return new Date(t.created_at) > dayAgo
                      }).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement users={users} />
        </TabsContent>

        <TabsContent value="kyc">
          <KYCManagement users={users} kycDocuments={kycDocuments} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionManagement transactions={transactions} users={users} />
        </TabsContent>

        <TabsContent value="cards">
          <CardRequestManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}

