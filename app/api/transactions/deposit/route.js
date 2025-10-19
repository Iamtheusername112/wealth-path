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

    const { userId, amount, method, destinationAccount } = await request.json()

    if (userId !== authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!destinationAccount) {
      return NextResponse.json({ error: "Destination account number is required" }, { status: 400 })
    }

    // Check if user account is active
    const userStatus = await checkUserStatus(userId)
    console.log('Deposit API: User status check for', userId, '- Active:', userStatus.isActive, 'Status:', userStatus.status)
    
    if (!userStatus.isActive) {
      console.log('Deposit API: Blocking deactivated user from making deposit')
      return NextResponse.json({ 
        error: "Your account has been deactivated. Please contact support for assistance.",
        accountDeactivated: true 
      }, { status: 403 })
    }

    // Get sender's info
    const { data: sender, error: senderError } = await supabaseAdmin
      .from('users')
      .select('account_number, email, full_name, balance')
      .eq('id', userId)
      .single()

    if (senderError || !sender) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Extract bank details from method string
    const methodParts = method.split(' - ')
    const sourceBankName = methodParts[0] || 'Bank Account'
    const sourceAccountLast4 = methodParts[1] ? methodParts[1].replace('****', '') : '0000'

    // Check if destination is the user's OWN account (requires admin approval)
    // OR if it's another account (goes through anyway)
    const isOwnAccount = sender.account_number && sender.account_number === destinationAccount

    if (isOwnAccount) {
      // SCENARIO 1: Depositing to OWN account → Requires admin approval
      
      // Create a PENDING deposit request
      const { data: depositRequest, error: requestError } = await supabaseAdmin
        .from('deposit_requests')
        .insert([
          {
            user_id: userId,
            amount: amount,
            source_bank_name: sourceBankName,
            source_account_last4: sourceAccountLast4,
            destination_account: destinationAccount,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (requestError) {
        console.error('Deposit request error:', requestError)
        return NextResponse.json({ error: "Failed to create deposit request" }, { status: 500 })
      }

      // Notify user about pending approval
      await supabaseAdmin
        .from('notifications')
        .insert([
          {
            user_id: userId,
            message: `Your deposit of $${amount.toFixed(2)} is pending admin approval.`,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ])

      return NextResponse.json({ 
        success: true, 
        depositRequest,
        requiresApproval: true,
        message: "Deposit request submitted. Awaiting admin approval."
      })
    } else {
      // SCENARIO 2: Sending to ANOTHER account → Goes through immediately
      
      // Try to find the recipient by account number
      const { data: recipient } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('account_number', destinationAccount)
        .single()

      // If recipient exists in our system, credit their account
      if (recipient) {
        // Update recipient balance
        const newRecipientBalance = parseFloat(recipient.balance || 0) + parseFloat(amount)
        await supabaseAdmin
          .from('users')
          .update({ balance: newRecipientBalance })
          .eq('id', recipient.id)

        // Create transaction for recipient (deposit)
        await supabaseAdmin
          .from('transactions')
          .insert([
            {
              user_id: recipient.id,
              type: 'deposit',
              amount: amount,
              description: `Transfer from ${sender.full_name || sender.email} via ${sourceBankName}`,
              status: 'completed',
              created_at: new Date().toISOString(),
            },
          ])

        // Notify recipient
        await supabaseAdmin
          .from('notifications')
          .insert([
            {
              user_id: recipient.id,
              message: `You have received $${amount.toFixed(2)} from ${sender.full_name || sender.email}.`,
              is_read: false,
              created_at: new Date().toISOString(),
            },
          ])
      }

      // Create transaction for sender (always, even if recipient not in system)
      await supabaseAdmin
        .from('transactions')
        .insert([
          {
            user_id: userId,
            type: 'transfer',
            amount: amount,
            description: `Transfer to account ${destinationAccount} from ${sourceBankName}`,
            recipient_id: recipient?.id || null,
            status: 'completed',
            created_at: new Date().toISOString(),
          },
        ])

      // Notify sender
      await supabaseAdmin
        .from('notifications')
        .insert([
          {
            user_id: userId,
            message: recipient 
              ? `You have transferred $${amount.toFixed(2)} to ${recipient.full_name || recipient.email}.`
              : `You have transferred $${amount.toFixed(2)} to account ${destinationAccount}.`,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ])

      return NextResponse.json({ 
        success: true,
        requiresApproval: false,
        message: recipient
          ? `Transfer of $${amount.toFixed(2)} to ${recipient.full_name || recipient.email} completed successfully.`
          : `Transfer of $${amount.toFixed(2)} to account ${destinationAccount} completed successfully.`,
        recipient: recipient ? {
          name: recipient.full_name || recipient.email,
          accountNumber: destinationAccount
        } : {
          accountNumber: destinationAccount
        }
      })
    }
  } catch (error) {
    console.error('Deposit error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

