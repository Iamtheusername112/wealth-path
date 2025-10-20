import { currentUser } from "@clerk/nextjs/server"
import { supabaseAdmin } from "./supabase-admin"

/**
 * Check if the current user is an admin
 * Auto-creates admin if email matches ADMIN_EMAIL env var
 */
export async function checkAdmin() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { isAdmin: false, user: null }
    }

    const email = user.emailAddresses[0].emailAddress

    // Check if user is already in admins table
    let { data: admin } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()

    // If not admin but email matches ADMIN_EMAIL env var, auto-create
    if (!admin && process.env.ADMIN_EMAIL) {
      const adminEmails = process.env.ADMIN_EMAIL.split(',').map(e => e.trim().toLowerCase())
      
      if (adminEmails.includes(email.toLowerCase())) {
        // Auto-create admin
        const { data: newAdmin, error } = await supabaseAdmin
          .from('admins')
          .insert([
            {
              email: email,
              role: 'admin',
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single()

        if (!error) {
          console.log(`✅ Auto-created admin: ${email}`)
          admin = newAdmin
        } else {
          console.error('Failed to auto-create admin:', error)
        }
      }
    }

    return {
      isAdmin: !!admin,
      user: user,
      admin: admin
    }
  } catch (error) {
    console.error('Error checking admin:', error)
    return { isAdmin: false, user: null }
  }
}

/**
 * Middleware to require admin access
 * Returns error response if not admin
 */
export async function requireAdmin() {
  const { isAdmin, user } = await checkAdmin()

  if (!isAdmin) {
    return {
      authorized: false,
      response: {
        error: "Admin access required. Add your email to ADMIN_EMAIL environment variable.",
        status: 403
      }
    }
  }

  return {
    authorized: true,
    user
  }
}

