import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { checkUserStatus } from "@/lib/check-user-status"

export async function POST(request) {
  try {
    const { userId: authUserId } = await auth()

    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, amount, method } = await request.json()

    if (userId !== authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Check if user account is active
    const userStatus = await checkUserStatus(userId)
    if (!userStatus.isActive) {
      return NextResponse.json({ 
        error: "Your account has been deactivated. Please contact support for assistance.",
        accountDeactivated: true 
      }, { status: 403 })
    }

    // Get current user balance (use admin client to bypass RLS)
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single()

    if (fetchError || !currentUser) {
      console.error('User fetch error:', fetchError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (parseFloat(currentUser.balance || 0) < parseFloat(amount)) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    const newBalance = parseFloat(currentUser.balance || 0) - parseFloat(amount)

    // Update user balance (use admin client)
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId)

    if (updateError) {
      console.error('Balance update error:', updateError)
      return NextResponse.json({ error: "Failed to update balance" }, { status: 500 })
    }

    // Create transaction record (use admin client)
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type: 'withdrawal',
          amount: amount,
          description: `Withdrawal via ${method}`,
          status: 'completed',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (transactionError) {
      console.error('Transaction create error:', transactionError)
      return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
    }

    // Create notification (use admin client)
    await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: userId,
          message: `You have withdrawn $${amount} from your account.`,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    return NextResponse.json({ success: true, transaction, newBalance })
  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

