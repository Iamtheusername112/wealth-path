import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request) {
  try {
    const { userId: authUserId } = await auth()

    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      userId,
      bankName,
      bankCountry,
      bankCode,
      currency,
      accountType,
      accountHolderName,
      accountNumberLast4,
      routingNumber,
      swiftCode,
      iban,
      isVerified
    } = await request.json()

    if (userId !== authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if this is the user's first bank account
    const { data: existingAccounts } = await supabaseAdmin
      .from('linked_bank_accounts')
      .select('id')
      .eq('user_id', userId)

    const isPrimary = !existingAccounts || existingAccounts.length === 0

    // Insert the new linked bank account
    const { data: linkedAccount, error } = await supabaseAdmin
      .from('linked_bank_accounts')
      .insert([
        {
          user_id: userId,
          bank_name: bankName,
          bank_country: bankCountry,
          bank_code: bankCode,
          account_type: accountType,
          account_holder_name: accountHolderName,
          account_number_last4: accountNumberLast4,
          routing_number: routingNumber,
          swift_code: swiftCode,
          iban: iban,
          currency: currency,
          is_verified: isVerified || false,
          is_primary: isPrimary,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Link bank error:', error)
      return NextResponse.json({ error: "Failed to link bank account" }, { status: 500 })
    }

    // Create notification
    await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: userId,
          message: `${bankName} account (${accountNumberLast4}) has been linked successfully.`,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    return NextResponse.json({ success: true, account: linkedAccount })
  } catch (error) {
    console.error('Link bank error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

