import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { generateCreditCard } from "@/lib/generate-credit-card"

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken || adminToken.value !== 'admin_authenticated') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { cardId, newCardNetwork } = await request.json()

    if (!cardId || !newCardNetwork) {
      return NextResponse.json({ error: "Card ID and new network are required" }, { status: 400 })
    }

    if (!['visa', 'mastercard', 'amex', 'discover'].includes(newCardNetwork)) {
      return NextResponse.json({ error: "Invalid card network" }, { status: 400 })
    }

    // Get existing card
    const { data: existingCard, error: fetchError } = await supabaseAdmin
      .from('credit_cards')
      .select('*')
      .eq('id', cardId)
      .single()

    if (fetchError || !existingCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }

    // Generate new card number with the new network
    const cardDetails = generateCreditCard(
      existingCard.card_holder_name, 
      existingCard.card_type, 
      newCardNetwork
    )

    // Update card with new network and card number
    const { data: updatedCard, error: updateError } = await supabaseAdmin
      .from('credit_cards')
      .update({
        card_network: newCardNetwork,
        card_number: cardDetails.cardNumber,
        cvv: cardDetails.cvv, // New CVV for new card
      })
      .eq('id', cardId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating card network:', updateError)
      return NextResponse.json({ error: "Failed to update card network" }, { status: 500 })
    }

    // Get user info for notification
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name')
      .eq('id', existingCard.user_id)
      .single()

    // Notify user about the network change
    await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: existingCard.user_id,
          message: `Your credit card network has been changed to ${newCardNetwork.toUpperCase()}. Your new card number and CVV are now available in your Cards section.`,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    return NextResponse.json({ 
      success: true, 
      message: `Card network changed to ${newCardNetwork.toUpperCase()}`,
      card: updatedCard 
    })
  } catch (error) {
    console.error('Error reassigning card network:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

