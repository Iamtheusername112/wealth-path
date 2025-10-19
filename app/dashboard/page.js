import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { Navbar } from "@/components/navbar"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { OnboardingStepper } from "@/components/onboarding-stepper"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { serializeUser } from "@/lib/serialize-user"

export default async function DashboardPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect("/sign-in")
  }
  
  const user = serializeUser(clerkUser)

  // Check KYC status (use admin client to bypass RLS)
  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', clerkUser.id)
    .single()

  if (!dbUser) {
    redirect("/kyc")
  }

  if (dbUser.kyc_status !== 'approved') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">KYC Verification Required</h1>
            {dbUser.kyc_status === 'pending' && (
              <p className="text-muted-foreground mb-6">
                Your KYC verification is currently under review. You'll be able to access your dashboard once it's approved.
              </p>
            )}
            {dbUser.kyc_status === 'rejected' && (
              <>
                <p className="text-muted-foreground mb-6">
                  Your KYC verification was rejected. Please submit your documents again.
                </p>
                <a href="/kyc" className="text-gold-600 hover:underline">
                  Resubmit KYC Documents
                </a>
              </>
            )}
            {!dbUser.kyc_status && (
              <>
                <p className="text-muted-foreground mb-6">
                  Please complete your KYC verification to access your dashboard.
                </p>
                <a href="/kyc" className="text-gold-600 hover:underline">
                  Complete KYC Verification
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Fetch user's transactions (use admin client)
  const { data: transactions } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('user_id', clerkUser.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch user's investments (use admin client)
  const { data: investments } = await supabaseAdmin
    .from('investments')
    .select('*')
    .eq('user_id', clerkUser.id)
    .order('created_at', { ascending: false })

  // Fetch user's deposit requests (use admin client)
  const { data: depositRequests } = await supabaseAdmin
    .from('deposit_requests')
    .select('*')
    .eq('user_id', clerkUser.id)
    .order('created_at', { ascending: false })

  // Check if user has made any investments (Step 4)
  const hasInvestments = investments && investments.length > 0
  const currentStep = hasInvestments ? 4 : 3 // Step 3: Fund Account, Step 4: Start Investing

  // Generate signed URL for profile image
  let profileImageUrl = dbUser.profile_image_url
  if (profileImageUrl) {
    try {
      let filePath = profileImageUrl
      if (profileImageUrl.includes('/storage/v1/object/')) {
        const match = profileImageUrl.match(/\/kyc-documents\/(.+)/)
        if (match) {
          filePath = match[1].split('?')[0]
        }
      }

      const { data, error } = await supabaseAdmin.storage
        .from('kyc-documents')
        .createSignedUrl(filePath, 3600)

      if (!error && data) {
        profileImageUrl = data.signedUrl
      }
    } catch (error) {
      console.error('Error generating signed URL for profile image:', error)
    }
  }

  // Merge database user data with Clerk user
  const mergedUser = {
    ...user,
    ...dbUser,
    profileImageUrl: profileImageUrl || user.profileImageUrl, // Use uploaded photo or Clerk photo
    imageUrl: profileImageUrl || user.imageUrl,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mergedUser} />
      
      {/* Beautiful Onboarding Stepper */}
      <OnboardingStepper currentStep={currentStep} />
      
      <DashboardContent 
        user={mergedUser} 
        transactions={transactions || []} 
        investments={investments || []}
        depositRequests={depositRequests || []}
      />
    </div>
  )
}

