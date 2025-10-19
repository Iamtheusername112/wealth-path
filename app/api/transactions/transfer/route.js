import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { supabase } from "@/lib/supabase"

export async function POST(request) {
  try {
    const { userId: authUserId } = await auth()
    const user = await currentUser()

    if (!authUserId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, amount, recipientEmail, description } = await request.json()

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

    // Find recipient
    const { data: recipient } = await supabase
      .from('users')
      .select('*')
      .eq('email', recipientEmail)
      .single()

    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
    }

    if (recipient.id === userId) {
      return NextResponse.json({ error: "Cannot transfer to yourself" }, { status: 400 })
    }

    // Get current user balance
    const { data: currentUser } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single()

    if (parseFloat(currentUser.balance) < parseFloat(amount)) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    const newSenderBalance = parseFloat(currentUser.balance) - parseFloat(amount)
    const newRecipientBalance = parseFloat(recipient.balance) + parseFloat(amount)

    // Update sender balance
    const { error: senderUpdateError } = await supabase
      .from('users')
      .update({ balance: newSenderBalance })
      .eq('id', userId)

    if (senderUpdateError) {
      console.error('Sender balance update error:', senderUpdateError)
      return NextResponse.json({ error: "Failed to update sender balance" }, { status: 500 })
    }

    // Update recipient balance
    const { error: recipientUpdateError } = await supabase
      .from('users')
      .update({ balance: newRecipientBalance })
      .eq('id', recipient.id)

    if (recipientUpdateError) {
      console.error('Recipient balance update error:', recipientUpdateError)
      // Rollback sender balance
      await supabase
        .from('users')
        .update({ balance: currentUser.balance })
        .eq('id', userId)
      return NextResponse.json({ error: "Failed to update recipient balance" }, { status: 500 })
    }

    // Create transaction record for sender
    const { data: senderTransaction, error: senderTransactionError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type: 'transfer',
          amount: amount,
          description: description || `Transfer to ${recipientEmail}`,
          recipient_id: recipient.id,
          status: 'completed',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (senderTransactionError) {
      console.error('Sender transaction create error:', senderTransactionError)
    }

    // Create transaction record for recipient (as deposit)
    await supabase
      .from('transactions')
      .insert([
        {
          user_id: recipient.id,
          type: 'deposit',
          amount: amount,
          description: description || `Transfer from ${user.emailAddresses?.[0]?.emailAddress}`,
          status: 'completed',
          created_at: new Date().toISOString(),
        },
      ])

    // Create notifications
    await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          message: `You have transferred $${amount} to ${recipientEmail}.`,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    await supabase
      .from('notifications')
      .insert([
        {
          user_id: recipient.id,
          message: `You have received $${amount} from ${user.emailAddresses?.[0]?.emailAddress}.`,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    return NextResponse.json({ success: true, transaction: senderTransaction, newBalance: newSenderBalance })
  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

