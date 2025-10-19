import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken || adminToken.value !== 'admin_authenticated') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: "User ID and action are required" }, { status: 400 })
    }

    if (!['activate', 'deactivate'].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be 'activate' or 'deactivate'" }, { status: 400 })
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, status')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user status
    const newStatus = action === 'activate' ? 'active' : 'deactivated'
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user status:', updateError)
      return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
    }

    // If deactivating, also deactivate any active credit cards
    if (action === 'deactivate') {
      const { error: cardError } = await supabaseAdmin
        .from('credit_cards')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'active')

      if (cardError) {
        console.error('Error deactivating user cards:', cardError)
        // Don't fail the request if cards can't be deactivated
      }
    }

    // Notify user about status change
    await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: userId,
          message: action === 'activate' 
            ? 'Your account has been reactivated by an administrator.' 
            : 'Your account has been deactivated by an administrator. Please contact support if you believe this is an error.',
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    const message = action === 'activate' 
      ? `User ${user.full_name} has been reactivated successfully.`
      : `User ${user.full_name} has been deactivated successfully.`

    console.log(`✅ Admin action: ${action} user ${user.full_name} (${user.email})`)

    return NextResponse.json({ 
      success: true, 
      message,
      user: updatedUser
    })

  } catch (error) {
    console.error('Deactivate user error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
