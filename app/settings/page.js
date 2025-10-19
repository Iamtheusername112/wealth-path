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

  // Fetch user data from database (use admin client)
  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', clerkUser.id)
    .single()

  // Generate signed URL for profile image
  let profileImageUrl = dbUser?.profile_image_url
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
    profileImageUrl: profileImageUrl || user.profileImageUrl,
    imageUrl: profileImageUrl || user.imageUrl,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mergedUser} />
      <SettingsContent 
        user={mergedUser}
        clerkUser={user}
      />
    </div>
  )
}

