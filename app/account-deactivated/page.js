import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Mail, Phone } from "lucide-react"
import { AccountDeactivatedContent } from "@/components/support/account-deactivated-content"

export default async function AccountDeactivatedPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Check user status
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('status, full_name, email')
    .eq('id', userId)
    .single()

  // If user is active, redirect to dashboard
  if (user?.status === 'active') {
    redirect("/dashboard")
  }

  return <AccountDeactivatedContent userId={userId} user={user} />
}
