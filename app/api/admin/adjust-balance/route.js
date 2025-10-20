import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// Admin endpoint to credit or debit user balance
export async function POST(request) {
  try {
    const { userId: authUserId } = await auth()

    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await currentUser()
    const { data: admin } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', adminUser.emailAddresses[0].emailAddress)
      .single()

    if (!admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { userId, action, amount, reason } = await request.json()

    if (!userId || !action || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    if (action !== 'credit' && action !== 'debit') {
      return NextResponse.json({ error: "Action must be 'credit' or 'debit'" }, { status: 400 })
    }

    // Get current user balance
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('balance, full_name, email')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      console.error('User fetch error:', fetchError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentBalance = parseFloat(user.balance || 0)
    let newBalance

    if (action === 'credit') {
      // Add to balance
      newBalance = currentBalance + parseFloat(amount)
    } else {
      // Deduct from balance
      newBalance = currentBalance - parseFloat(amount)
      
      // Prevent negative balance
      if (newBalance < 0) {
        return NextResponse.json({ 
          error: "Insufficient balance",
          details: `User has $${currentBalance}, cannot debit $${amount}` 
        }, { status: 400 })
      }
    }

    // Update user balance
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Balance update error:', updateError)
      return NextResponse.json({ error: "Failed to update balance" }, { status: 500 })
    }

    // Create transaction record
    const transactionType = action === 'credit' ? 'deposit' : 'withdrawal'
    const description = reason 
      ? `Admin ${action}: ${reason}` 
      : `Admin ${action} by ${adminUser.emailAddresses[0].emailAddress}`

    await supabaseAdmin
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type: transactionType,
          amount: parseFloat(amount),
          description: description,
          status: 'completed',
          created_at: new Date().toISOString(),
        },
      ])

    // Create notification for user
    const notificationMessage = action === 'credit'
      ? `Your account has been credited with $${amount}${reason ? ': ' + reason : ''}`
      : `Your account has been debited $${amount}${reason ? ': ' + reason : ''}`

    await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: userId,
          message: notificationMessage,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    return NextResponse.json({ 
      success: true,
      action,
      amount: parseFloat(amount),
      previousBalance: currentBalance,
      newBalance,
      userName: user.full_name,
      userEmail: user.email
    })

  } catch (error) {
    console.error('Admin balance adjustment error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

