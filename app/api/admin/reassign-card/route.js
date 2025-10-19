import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken || adminToken.value !== 'admin_authenticated') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { cardId, newCardType, cardNetwork } = await request.json()

    if (!cardId || !newCardType) {
      return NextResponse.json({ error: "Card ID and new card type are required" }, { status: 400 })
    }

    if (!['platinum', 'gold', 'black'].includes(newCardType)) {
      return NextResponse.json({ error: "Invalid card type" }, { status: 400 })
    }

    if (cardNetwork && !['visa', 'mastercard', 'amex', 'discover'].includes(cardNetwork)) {
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

    // Determine new credit limit based on card type
    const creditLimits = {
      platinum: 10000,
      gold: 20000,
      black: 50000,
    }
    const newCreditLimit = creditLimits[newCardType]

    // Prepare update object
    const updateData = {
      card_type: newCardType,
      credit_limit: newCreditLimit,
      available_credit: newCreditLimit, // Reset available credit
    }

    // If network is also being changed, keep it the same
    if (cardNetwork) {
      updateData.card_network = cardNetwork
    }

    // Update card type and credit limit
    const { data: updatedCard, error: updateError } = await supabaseAdmin
      .from('credit_cards')
      .update(updateData)
      .eq('id', cardId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating card:', updateError)
      return NextResponse.json({ error: "Failed to update card" }, { status: 500 })
    }

    // Notify user about the upgrade/change
    await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: existingCard.user_id,
          message: `Your credit card has been upgraded to ${newCardType.toUpperCase()} with a new credit limit of $${newCreditLimit.toLocaleString()}.`,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    return NextResponse.json({ 
      success: true, 
      message: `Card successfully reassigned to ${newCardType}`,
      card: updatedCard 
    })
  } catch (error) {
    console.error('Error reassigning card:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

