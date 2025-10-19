import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request) {
  try {
    // Check admin authentication via cookie
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken || adminToken.value !== 'admin_authenticated') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { depositId, action, adminNotes } = await request.json()

    if (!depositId || !action) {
      return NextResponse.json({ error: "Deposit ID and action are required" }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Get deposit request details
    const { data: depositRequest, error: fetchError } = await supabaseAdmin
      .from('deposit_requests')
      .select('*')
      .eq('id', depositId)
      .single()

    if (fetchError || !depositRequest) {
      return NextResponse.json({ error: "Deposit request not found" }, { status: 404 })
    }

    if (depositRequest.status !== 'pending') {
      return NextResponse.json({ error: "Deposit request already processed" }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    if (action === 'approve') {
      // Get current user balance
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('balance, email, full_name')
        .eq('id', depositRequest.user_id)
        .single()

      if (userError || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const newBalance = parseFloat(user.balance || 0) + parseFloat(depositRequest.amount)

      // Update user balance
      const { error: balanceError } = await supabaseAdmin
        .from('users')
        .update({ balance: newBalance })
        .eq('id', depositRequest.user_id)

      if (balanceError) {
        console.error('Balance update error:', balanceError)
        return NextResponse.json({ error: "Failed to update balance" }, { status: 500 })
      }

      // Create completed transaction record
      await supabaseAdmin
        .from('transactions')
        .insert([
          {
            user_id: depositRequest.user_id,
            type: 'deposit',
            amount: depositRequest.amount,
            description: `Deposit from ${depositRequest.source_bank_name} (****${depositRequest.source_account_last4}) - Admin Approved`,
            status: 'completed',
            created_at: new Date().toISOString(),
          },
        ])

      // Send success notification
      await supabaseAdmin
        .from('notifications')
        .insert([
          {
            user_id: depositRequest.user_id,
            message: `Your deposit of $${parseFloat(depositRequest.amount).toFixed(2)} has been approved and added to your account.`,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ])
    } else {
      // Send rejection notification
      await supabaseAdmin
        .from('notifications')
        .insert([
          {
            user_id: depositRequest.user_id,
            message: `Your deposit request of $${parseFloat(depositRequest.amount).toFixed(2)} has been rejected. ${adminNotes ? 'Reason: ' + adminNotes : ''}`,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ])
    }

    // Update deposit request status
    const { error: updateError } = await supabaseAdmin
      .from('deposit_requests')
      .update({
        status: newStatus,
        admin_notes: adminNotes || null,
        approved_by: 'admin@capitalpath.com',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', depositId)

    if (updateError) {
      console.error('Deposit request update error:', updateError)
      return NextResponse.json({ error: "Failed to update deposit request" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      status: newStatus,
      message: `Deposit ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    })
  } catch (error) {
    console.error('Deposit action error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

