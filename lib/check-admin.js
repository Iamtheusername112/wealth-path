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
      console.log('❌ No user found')
      return { isAdmin: false, user: null }
    }

    const email = user.emailAddresses[0].emailAddress
    console.log('🔍 Checking admin for email:', email)
    console.log('🔑 ADMIN_EMAIL env var:', process.env.ADMIN_EMAIL)

    // Check if user is already in admins table
    let { data: admin } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()

    console.log('📊 Admin in database:', admin ? 'Found' : 'Not found')

    // If not admin but email matches ADMIN_EMAIL env var, auto-create
    if (!admin && process.env.ADMIN_EMAIL) {
      console.log('🔄 Attempting auto-create admin...')
      const adminEmails = process.env.ADMIN_EMAIL.split(',').map(e => e.trim().toLowerCase())
      console.log('📧 Admin emails from env:', adminEmails)
      console.log('🎯 User email lowercase:', email.toLowerCase())
      
      if (adminEmails.includes(email.toLowerCase())) {
        console.log('✅ Email matches! Creating admin...')
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
          console.error('❌ Failed to auto-create admin:', error)
        }
      } else {
        console.log('❌ Email does not match ADMIN_EMAIL')
      }
    } else if (!admin) {
      console.log('❌ No ADMIN_EMAIL env var set')
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

