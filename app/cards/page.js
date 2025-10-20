import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { CardsSection } from "@/components/dashboard/cards-section"

export default async function CardsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Get user data
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (!user) {
    redirect('/onboarding-complete')
  }

  // Check KYC status
  if (user.kyc_status !== 'approved') {
    redirect('/kyc')
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 pb-20 sm:pb-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Credit Cards</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your premium CapitalPath credit cards
        </p>
      </div>

      <CardsSection userId={userId} user={user} />
    </div>
  )
}

