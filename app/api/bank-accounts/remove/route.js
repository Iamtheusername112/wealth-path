import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request) {
  try {
    const { userId: authUserId } = await auth()

    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { accountId } = await request.json()

    if (!accountId) {
      return NextResponse.json({ error: "Account ID required" }, { status: 400 })
    }

    // Verify the account belongs to the user before deleting
    const { data: account, error: fetchError } = await supabaseAdmin
      .from('linked_bank_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', authUserId)
      .single()

    if (fetchError || !account) {
      return NextResponse.json({ error: "Account not found or unauthorized" }, { status: 404 })
    }

    // Delete the linked bank account
    const { error: deleteError } = await supabaseAdmin
      .from('linked_bank_accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', authUserId)

    if (deleteError) {
      console.error('Delete bank account error:', deleteError)
      return NextResponse.json({ error: "Failed to remove bank account" }, { status: 500 })
    }

    // Create notification
    await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: authUserId,
          message: `${account.bank_name} account (****${account.account_number_last4}) has been removed.`,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    return NextResponse.json({ 
      success: true, 
      message: "Bank account removed successfully",
      removedAccount: {
        bankName: account.bank_name,
        accountNumberLast4: account.account_number_last4
      }
    })
  } catch (error) {
    console.error('Remove bank account error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

