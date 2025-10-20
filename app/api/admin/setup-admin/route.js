import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// ONE-TIME SETUP: Add current user as admin
// ⚠️ DELETE THIS FILE AFTER SETUP FOR SECURITY
export async function POST(request) {
  try {
    const { userId: authUserId } = await auth()

    if (!authUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get current user from Clerk
    const user = await currentUser()
    const email = user.emailAddresses[0].emailAddress

    // Check if already admin
    const { data: existingAdmin } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()

    if (existingAdmin) {
      return NextResponse.json({ 
        success: true,
        message: "Already an admin",
        email,
        role: existingAdmin.role
      })
    }

    // Add as admin
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

    if (error) {
      console.error('Error creating admin:', error)
      return NextResponse.json({ 
        error: "Failed to create admin",
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Admin access granted!",
      email,
      role: newAdmin.role,
      instructions: "You can now access Balance Control and Manage Investments tabs. Please delete the file app/api/admin/setup-admin/route.js for security."
    })

  } catch (error) {
    console.error('Setup admin error:', error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}

