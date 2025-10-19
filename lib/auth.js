import { currentUser } from "@clerk/nextjs/server"
import { supabase } from "./supabase"

export async function getAuthUser() {
  const user = await currentUser()
  return user
}

export async function getUserWithKYC() {
  const clerkUser = await getAuthUser()
  
  if (!clerkUser) {
    return null
  }

  try {
    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', clerkUser.id)
      .single()

    return dbUser
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function isKYCApproved() {
  const user = await getUserWithKYC()
  return user && user.kyc_status === 'approved'
}

export async function isAdmin(email) {
  const { data } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single()

  return !!data
}

