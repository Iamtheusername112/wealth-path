import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request) {
  try {
    const { userId: authUserId } = await auth()

    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's credit cards
    const { data: cards, error: cardsError } = await supabaseAdmin
      .from('credit_cards')
      .select('*')
      .eq('user_id', authUserId)
      .order('created_at', { ascending: false })

    if (cardsError) {
      console.error('Error fetching credit cards:', cardsError)
      return NextResponse.json({ error: "Failed to fetch credit cards" }, { status: 500 })
    }

    // Get pending requests
    const { data: pendingRequests, error: requestsError } = await supabaseAdmin
      .from('credit_card_requests')
      .select('*')
      .eq('user_id', authUserId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false })

    if (requestsError) {
      console.error('Error fetching credit card requests:', requestsError)
    }

    return NextResponse.json({ 
      success: true, 
      cards: cards || [],
      pendingRequests: pendingRequests || []
    })
  } catch (error) {
    console.error('Error fetching credit cards:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

