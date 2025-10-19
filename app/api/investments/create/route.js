import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request) {
  try {
    const { userId: authUserId } = await auth()

    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, category, assetName, assetSymbol, amount, quantity, purchasePrice } = await request.json()

    if (userId !== authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Get current user balance (use admin client to bypass RLS)
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single()

    if (fetchError || !currentUser) {
      console.error('User fetch error:', fetchError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (parseFloat(currentUser.balance || 0) < parseFloat(amount)) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    const newBalance = parseFloat(currentUser.balance || 0) - parseFloat(amount)

    // Update user balance (use admin client)
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId)

    if (updateError) {
      console.error('Balance update error:', updateError)
      return NextResponse.json({ error: "Failed to update balance" }, { status: 500 })
    }

    // Create investment record (use admin client)
    const { data: investment, error: investmentError } = await supabaseAdmin
      .from('investments')
      .insert([
        {
          user_id: userId,
          category: category,
          asset_name: assetName,
          amount: amount,
          quantity: quantity,
          purchase_price: purchasePrice,
          current_price: purchasePrice,
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (investmentError) {
      console.error('Investment create error:', investmentError)
      // Rollback balance update
      await supabase
        .from('users')
        .update({ balance: currentUser.balance })
        .eq('id', userId)
      return NextResponse.json({ error: "Failed to create investment" }, { status: 500 })
    }

    // Create transaction record (use admin client)
    await supabaseAdmin
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type: 'withdrawal',
          amount: amount,
          description: `Investment in ${assetName} (${assetSymbol})`,
          status: 'completed',
          created_at: new Date().toISOString(),
        },
      ])

    // Create notification (use admin client)
    await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: userId,
          message: `You have invested $${amount} in ${assetName}.`,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    return NextResponse.json({ success: true, investment, newBalance })
  } catch (error) {
    console.error('Investment error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

