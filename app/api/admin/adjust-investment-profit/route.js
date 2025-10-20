import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase-admin"

// Admin endpoint to adjust investment profit/loss
export async function POST(request) {
  try {
    // Check admin authentication via cookie
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken || adminToken.value !== 'admin_authenticated') {
      return NextResponse.json({ 
        error: "Unauthorized. Please login at /admin-login" 
      }, { status: 401 })
    }

    const { investmentId, action, amount, newCurrentPrice, reason } = await request.json()

    if (!investmentId || !action) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    // Get investment details
    const { data: investment, error: fetchError } = await supabaseAdmin
      .from('investments')
      .select('*')
      .eq('id', investmentId)
      .single()

    if (fetchError || !investment) {
      console.error('Investment fetch error:', fetchError)
      return NextResponse.json({ error: "Investment not found" }, { status: 404 })
    }

    let updatedInvestment

    if (action === 'adjust_price') {
      // Update current price (market value)
      if (!newCurrentPrice || newCurrentPrice <= 0) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 })
      }

      const { data, error: updateError } = await supabaseAdmin
        .from('investments')
        .update({ 
          current_price: parseFloat(newCurrentPrice),
          updated_at: new Date().toISOString()
        })
        .eq('id', investmentId)
        .select()
        .single()

      if (updateError) {
        console.error('Price update error:', updateError)
        return NextResponse.json({ error: "Failed to update price" }, { status: 500 })
      }

      updatedInvestment = data

      // Calculate profit/loss
      const purchaseValue = parseFloat(investment.purchase_price || 0) * parseFloat(investment.quantity || 0)
      const currentValue = parseFloat(newCurrentPrice) * parseFloat(investment.quantity || 0)
      const profitLoss = currentValue - purchaseValue
      const profitLossPercent = purchaseValue > 0 ? ((profitLoss / purchaseValue) * 100).toFixed(2) : 0

      // Create notification
      const message = profitLoss >= 0
        ? `Your ${investment.asset_name} investment value increased! Current profit: $${profitLoss.toFixed(2)} (${profitLossPercent}%)${reason ? ' - ' + reason : ''}`
        : `Your ${investment.asset_name} investment value changed. Current status: -$${Math.abs(profitLoss).toFixed(2)} (${profitLossPercent}%)${reason ? ' - ' + reason : ''}`

      await supabaseAdmin
        .from('notifications')
        .insert([
          {
            user_id: investment.user_id,
            message: message,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ])

      return NextResponse.json({ 
        success: true,
        investment: updatedInvestment,
        profitLoss: profitLoss,
        profitLossPercent: profitLossPercent
      })

    } else if (action === 'add_profit' || action === 'subtract_loss') {
      // Directly adjust investment amount
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
      }

      const currentAmount = parseFloat(investment.amount || 0)
      let newAmount

      if (action === 'add_profit') {
        newAmount = currentAmount + parseFloat(amount)
      } else {
        newAmount = currentAmount - parseFloat(amount)
        if (newAmount < 0) {
          return NextResponse.json({ 
            error: "Cannot subtract more than investment amount",
            details: `Current amount: $${currentAmount}, trying to subtract: $${amount}` 
          }, { status: 400 })
        }
      }

      const { data, error: updateError } = await supabaseAdmin
        .from('investments')
        .update({ 
          amount: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', investmentId)
        .select()
        .single()

      if (updateError) {
        console.error('Amount update error:', updateError)
        return NextResponse.json({ error: "Failed to update amount" }, { status: 500 })
      }

      updatedInvestment = data

      // Create notification
      const message = action === 'add_profit'
        ? `Great news! Your ${investment.asset_name} investment gained $${amount}. New value: $${newAmount.toFixed(2)}${reason ? ' - ' + reason : ''}`
        : `Your ${investment.asset_name} investment value adjusted: -$${amount}. New value: $${newAmount.toFixed(2)}${reason ? ' - ' + reason : ''}`

      await supabaseAdmin
        .from('notifications')
        .insert([
          {
            user_id: investment.user_id,
            message: message,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ])

      return NextResponse.json({ 
        success: true,
        investment: updatedInvestment,
        oldAmount: currentAmount,
        newAmount: newAmount,
        change: action === 'add_profit' ? amount : -amount
      })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

  } catch (error) {
    console.error('Adjust investment profit error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

