import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { KYCForm } from "@/components/kyc/kyc-form"
import { Navbar } from "@/components/navbar"
import { OnboardingStepper } from "@/components/onboarding-stepper"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { serializeUser } from "@/lib/serialize-user"

export default async function KYCPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect("/sign-in")
  }
  
  const user = serializeUser(clerkUser)

  // Check if user exists in database (use admin client to bypass RLS)
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', clerkUser.id)
    .single()

  // If KYC is already approved, redirect to dashboard
  if (existingUser && existingUser.kyc_status === 'approved') {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      {/* Onboarding Stepper */}
      <OnboardingStepper currentStep={2} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your KYC Verification</h1>
            <p className="text-muted-foreground">
              We need to verify your identity to comply with financial regulations and keep your account secure.
            </p>
          </div>
          
          {existingUser && existingUser.kyc_status === 'pending' ? (
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                  Verification Submitted! ✅
                </h2>
                <p className="text-blue-800 dark:text-blue-200 mb-6">
                  Your KYC verification is currently under review by our team. You'll receive a notification once it's approved.
                </p>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">What happens next?</p>
                  <ul className="text-sm text-left space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">1.</span>
                      <span>Our team reviews your documents (usually within 24 hours)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">2.</span>
                      <span>You'll get an email notification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">3.</span>
                      <span>Once approved, you can access your dashboard</span>
                    </li>
                  </ul>
                </div>
                <a href="/notifications" className="text-blue-600 hover:underline text-sm font-medium">
                  Check Notifications →
                </a>
              </div>
            </div>
          ) : existingUser && existingUser.kyc_status === 'rejected' ? (
            <div>
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-900 dark:text-red-100">
                  Your KYC verification was rejected. Please submit again with correct information.
                </p>
              </div>
              <KYCForm user={user} existingUser={existingUser} />
            </div>
          ) : (
            <KYCForm user={user} existingUser={existingUser} />
          )}
        </div>
      </div>
    </div>
  )
}

