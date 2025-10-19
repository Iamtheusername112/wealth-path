import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request) {
  try {
    const { userId: authUserId } = await auth()

    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await request.json()

    if (userId !== authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already has a credit card
    const { data: existingCard } = await supabaseAdmin
      .from('credit_cards')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingCard) {
      return NextResponse.json({ error: "You already have a credit card" }, { status: 400 })
    }

    // Check if user has a pending request
    const { data: pendingRequest } = await supabaseAdmin
      .from('credit_card_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single()

    if (pendingRequest) {
      return NextResponse.json({ error: "You already have a pending credit card request" }, { status: 400 })
    }

    // Check KYC status
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('kyc_status, full_name')
      .eq('id', userId)
      .single()

    if (!user || user.kyc_status !== 'approved') {
      return NextResponse.json({ error: "KYC verification required to request a credit card" }, { status: 400 })
    }

    // Create credit card request
    const { data: cardRequest, error: requestError } = await supabaseAdmin
      .from('credit_card_requests')
      .insert([
        {
          user_id: userId,
          status: 'pending',
          requested_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (requestError) {
      console.error('Credit card request error:', requestError)
      return NextResponse.json({ error: "Failed to create credit card request" }, { status: 500 })
    }

    // Notify user about the request
    await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: userId,
          message: `Your credit card request has been submitted and is pending admin approval.`,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    // Get all admins to notify them
    const { data: admins } = await supabaseAdmin
      .from('admins')
      .select('email')

    // Log admin notification (since we don't have email service)
    console.log('🔔 NEW CREDIT CARD REQUEST:')
    console.log(`User: ${user.full_name} (${userId})`)
    console.log(`Request ID: ${cardRequest.id}`)
    console.log(`Admins to notify: ${admins?.map(a => a.email).join(', ') || 'None'}`)
    console.log(`Check admin dashboard: /admin -> Credit Cards tab`)

    return NextResponse.json({ 
      success: true, 
      cardRequest,
      message: "Credit card request submitted successfully. You'll be notified once approved."
    })
  } catch (error) {
    console.error('Credit card request error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

