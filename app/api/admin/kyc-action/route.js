import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { generateBankingCredentials } from "@/lib/generate-banking-credentials"

export async function POST(request) {
  try {
    // Check admin authentication via cookie
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken || adminToken.value !== 'admin_authenticated') {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    console.log(`Admin ${action}ing KYC for user ${userId}`)

    // Get user's current account number
    const { data: currentUser } = await supabaseAdmin
      .from('users')
      .select('account_number, email, full_name, swift_code')
      .eq('id', userId)
      .single()

    // Prepare update data
    let updateData = { kyc_status: newStatus }

    // If approving KYC and user has account number but no banking credentials, generate them
    if (action === 'approve' && currentUser?.account_number && !currentUser?.swift_code) {
      const credentials = generateBankingCredentials(currentUser.account_number, 'US')
      updateData = {
        ...updateData,
        ...credentials
      }
      console.log(`Generated banking credentials for user ${currentUser.email}`)
    }

    // Update user KYC status and banking credentials (use admin client)
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (updateError) {
      console.error('KYC status update error:', updateError)
      return NextResponse.json({ error: "Failed to update KYC status" }, { status: 500 })
    }

    // Update KYC documents status (use admin client)
    await supabaseAdmin
      .from('kyc_documents')
      .update({ status: newStatus })
      .eq('user_id', userId)

    // Create notification (use admin client)
    await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: userId,
          message: `Your KYC verification has been ${newStatus}.`,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    console.error('KYC action error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
