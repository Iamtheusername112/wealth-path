import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { Navbar } from "@/components/navbar"
import { SettingsContent } from "@/components/settings/settings-content"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { serializeUser } from "@/lib/serialize-user"

export default async function SettingsPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect("/sign-in")
  }

  const user = serializeUser(clerkUser)

  // Get user data from database
  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', clerkUser.id)
    .single()

  if (!dbUser || dbUser.kyc_status !== 'approved') {
    redirect('/kyc')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={{ ...user, ...dbUser }} />
      
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 pb-20 sm:pb-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your CapitalPath account settings
          </p>
        </div>
        
        <SettingsContent user={{ ...user, ...dbUser }} />
      </div>
    </div>
  )
}