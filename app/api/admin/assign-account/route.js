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
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { userId, accountNumber } = await request.json()

    if (!userId || !accountNumber) {
      return NextResponse.json({ error: "User ID and account number are required" }, { status: 400 })
    }

    // Validate account number format (alphanumeric, 10-15 characters)
    const accountNumberRegex = /^[A-Z0-9]{10,15}$/
    if (!accountNumberRegex.test(accountNumber)) {
      return NextResponse.json({ 
        error: "Invalid account number format. Must be 10-15 alphanumeric characters." 
      }, { status: 400 })
    }

    // Check if account number already exists
    const { data: existingAccount } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('account_number', accountNumber)
      .single()

    if (existingAccount) {
      return NextResponse.json({ 
        error: `Account number already assigned to ${existingAccount.email}` 
      }, { status: 409 })
    }

    // Get user info
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate complete banking credentials
    const credentials = generateBankingCredentials(accountNumber, 'US')

    // Assign account number and banking credentials to user
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        account_number: accountNumber,
        ...credentials,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Account number assignment error:', updateError)
      return NextResponse.json({ error: "Failed to assign account number" }, { status: 500 })
    }

    // Create notification for user
    await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: userId,
          message: `Your CapitalPath account has been fully set up! Account number: ${accountNumber}. Check Settings to view all your banking details.`,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    console.log(`Account number ${accountNumber} assigned to user ${user.email}`)

    return NextResponse.json({ 
      success: true, 
      message: "Account number assigned successfully",
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        account_number: accountNumber
      }
    })
  } catch (error) {
    console.error('Assign account number error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

