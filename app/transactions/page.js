import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { TransactionHistory } from "@/components/dashboard/transaction-history"

export const metadata = {
  title: "Transactions - CapitalPath",
  description: "View and manage your transaction history",
}

export default async function TransactionsPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const userId = user.id

  // Fetch user data
  const { data: userData, error: userError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  if (userError || !userData) {
    console.error("Error fetching user:", userError)
    redirect("/sign-in")
  }

  // Check if user is deactivated
  if (userData.status === 'deactivated') {
    redirect('/account-deactivated')
  }

  // Fetch transactions
  const { data: transactions, error: transactionsError } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (transactionsError) {
    console.error("Error fetching transactions:", transactionsError)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gold-600/5">
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 pb-20 sm:pb-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Transactions</h1>
            <p className="text-muted-foreground">
              View and filter your complete transaction history
            </p>
          </div>

          {/* Transaction History */}
          <TransactionHistory transactions={transactions || []} />
        </div>
      </div>
    </div>
  )
}

