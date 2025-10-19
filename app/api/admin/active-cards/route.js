import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request) {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken || adminToken.value !== 'admin_authenticated') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all active credit cards with user details
    const { data: cards, error } = await supabaseAdmin
      .from('credit_cards')
      .select(`
        *,
        users:user_id (
          email
        )
      `)
      .eq('status', 'active')
      .order('issued_at', { ascending: false })

    if (error) {
      console.error('Error fetching active cards:', error)
      return NextResponse.json({ error: "Failed to fetch active cards" }, { status: 500 })
    }

    // Format the response to include user email
    const formattedCards = cards.map(card => ({
      ...card,
      user_email: card.users?.email
    }))

    return NextResponse.json({ success: true, cards: formattedCards || [] })
  } catch (error) {
    console.error('Error fetching active cards:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

