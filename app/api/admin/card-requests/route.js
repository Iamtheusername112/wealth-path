import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { generateCreditCard } from "@/lib/generate-credit-card"

export async function GET(request) {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken || adminToken.value !== 'admin_authenticated') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all credit card requests with user details
    const { data: requests, error } = await supabaseAdmin
      .from('credit_card_requests')
      .select(`
        *,
        users:user_id (
          id,
          email,
          full_name,
          kyc_status
        )
      `)
      .order('requested_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching card requests:', error)
      return NextResponse.json({ error: "Failed to fetch card requests", details: error.message }, { status: 500 })
    }

    console.log('✅ Fetched credit card requests:', requests?.length || 0, 'requests')
    console.log('📋 Requests data:', JSON.stringify(requests, null, 2))

    return NextResponse.json({ success: true, requests: requests || [] })
  } catch (error) {
    console.error('Error fetching card requests:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken || adminToken.value !== 'admin_authenticated') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { requestId, action, cardType = 'platinum', cardNetwork = 'visa' } = await request.json()

    if (!requestId || !action) {
      return NextResponse.json({ error: "Request ID and action are required" }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (!['visa', 'mastercard', 'amex', 'discover'].includes(cardNetwork)) {
      return NextResponse.json({ error: "Invalid card network" }, { status: 400 })
    }

    // Get the card request
    const { data: cardRequest, error: requestError } = await supabaseAdmin
      .from('credit_card_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (requestError || !cardRequest) {
      return NextResponse.json({ error: "Card request not found" }, { status: 404 })
    }

    if (cardRequest.status !== 'pending') {
      return NextResponse.json({ error: "This request has already been processed" }, { status: 400 })
    }

    // Get user details
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', cardRequest.user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (action === 'approve') {
      // Generate credit card details
      const cardDetails = generateCreditCard(user.full_name || user.email, cardType, cardNetwork)

      // Determine credit limit based on card type
      const creditLimits = {
        platinum: 10000,
        gold: 20000,
        black: 50000,
      }
      const creditLimit = creditLimits[cardType] || 10000

      // Create credit card
      const { data: creditCard, error: cardError } = await supabaseAdmin
        .from('credit_cards')
        .insert([
          {
            user_id: cardRequest.user_id,
            card_number: cardDetails.cardNumber,
            card_holder_name: cardDetails.cardHolderName,
            expiry_date: cardDetails.expiryDate,
            cvv: cardDetails.cvv,
            card_type: cardType,
            card_network: cardNetwork,
            status: 'active',
            credit_limit: creditLimit,
            available_credit: creditLimit,
            issued_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (cardError) {
        console.error('Error creating credit card:', cardError)
        return NextResponse.json({ error: "Failed to create credit card" }, { status: 500 })
      }

      // Update request status
      await supabaseAdmin
        .from('credit_card_requests')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
          processed_by: null, // We don't track individual admin IDs in this simple setup
        })
        .eq('id', requestId)

      // Notify user about approval
      await supabaseAdmin
        .from('notifications')
        .insert([
          {
            user_id: cardRequest.user_id,
            message: `Congratulations! Your ${cardType} credit card has been approved and is now available in your cards section.`,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ])

      return NextResponse.json({ 
        success: true, 
        message: "Credit card request approved successfully",
        creditCard 
      })
    } else {
      // Reject the request
      await supabaseAdmin
        .from('credit_card_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: null, // We don't track individual admin IDs in this simple setup
        })
        .eq('id', requestId)

      // Notify user about rejection
      await supabaseAdmin
        .from('notifications')
        .insert([
          {
            user_id: cardRequest.user_id,
            message: `Your credit card request has been reviewed and could not be approved at this time. Please contact support for more information.`,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ])

      return NextResponse.json({ 
        success: true, 
        message: "Credit card request rejected"
      })
    }
  } catch (error) {
    console.error('Error processing card request:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

