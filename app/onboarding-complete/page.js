import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { OnboardingCompleteContent } from "@/components/onboarding-complete-content"
import { Navbar } from "@/components/navbar"
import { serializeUser } from "@/lib/serialize-user"
import { supabase } from "@/lib/supabase"

export default async function OnboardingCompletePage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect("/sign-in")
  }
  
  const user = serializeUser(clerkUser)

  // Check KYC status
  const { data: dbUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', clerkUser.id)
    .single()

  // If not approved, redirect to KYC
  if (!dbUser || dbUser.kyc_status !== 'approved') {
    redirect("/kyc")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <OnboardingCompleteContent user={dbUser} />
    </div>
  )
}

