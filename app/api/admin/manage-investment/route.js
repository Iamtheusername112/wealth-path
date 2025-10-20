import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase-admin"

// Admin endpoint to add, modify, or remove user investments
export async function POST(request) {
  try {
    // Check admin authentication via cookie (not Clerk)
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken || adminToken.value !== 'admin_authenticated') {
      return NextResponse.json({ 
        error: "Unauthorized. Please login at /admin-login" 
      }, { status: 401 })
    }

    const { action, userId, investmentData } = await request.json()

    if (!action || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let result

    switch (action) {
      case 'add':
        result = await addInvestment(userId, investmentData, user)
        break
      
      case 'update':
        result = await updateInvestment(investmentData, user)
        break
      
      case 'remove':
        result = await removeInvestment(investmentData.investmentId, userId, user)
        break
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Admin investment management error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add new investment for user
async function addInvestment(userId, investmentData, user) {
  const {
    category,
    assetName,
    assetSymbol,
    amount,
    quantity,
    purchasePrice,
    currentPrice,
    status = 'active',
    reason
  } = investmentData

  if (!category || !assetName || !amount || amount <= 0) {
    throw new Error("Invalid investment data")
  }

  // Create investment record
  const { data: investment, error: investmentError } = await supabaseAdmin
    .from('investments')
    .insert([
      {
        user_id: userId,
        category: category,
        asset_name: assetName,
        amount: parseFloat(amount),
        quantity: quantity ? parseFloat(quantity) : null,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
        current_price: currentPrice ? parseFloat(currentPrice) : purchasePrice ? parseFloat(purchasePrice) : null,
        status: status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (investmentError) {
    console.error('Investment create error:', investmentError)
    throw new Error("Failed to create investment")
  }

  // Create notification
  const message = reason
    ? `Admin added investment: ${assetName} ($${amount}) - ${reason}`
    : `Admin added ${assetName} investment ($${amount}) to your portfolio`

  await supabaseAdmin
    .from('notifications')
    .insert([
      {
        user_id: userId,
        message: message,
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ])

  return {
    success: true,
    action: 'add',
    investment,
    userName: user.full_name,
    userEmail: user.email
  }
}

// Update existing investment
async function updateInvestment(investmentData, user) {
  const {
    investmentId,
    amount,
    quantity,
    purchasePrice,
    currentPrice,
    status,
    reason
  } = investmentData

  if (!investmentId) {
    throw new Error("Investment ID required")
  }

  // Get existing investment
  const { data: existingInvestment, error: fetchError } = await supabaseAdmin
    .from('investments')
    .select('*')
    .eq('id', investmentId)
    .single()

  if (fetchError || !existingInvestment) {
    throw new Error("Investment not found")
  }

  // Build update object
  const updates = {
    updated_at: new Date().toISOString()
  }

  if (amount !== undefined) updates.amount = parseFloat(amount)
  if (quantity !== undefined) updates.quantity = parseFloat(quantity)
  if (purchasePrice !== undefined) updates.purchase_price = parseFloat(purchasePrice)
  if (currentPrice !== undefined) updates.current_price = parseFloat(currentPrice)
  if (status !== undefined) updates.status = status

  // Update investment
  const { data: updatedInvestment, error: updateError } = await supabaseAdmin
    .from('investments')
    .update(updates)
    .eq('id', investmentId)
    .select()
    .single()

  if (updateError) {
    console.error('Investment update error:', updateError)
    throw new Error("Failed to update investment")
  }

  // Create notification
  const message = reason
    ? `Admin updated your ${existingInvestment.asset_name} investment - ${reason}`
    : `Admin updated your ${existingInvestment.asset_name} investment`

  await supabaseAdmin
    .from('notifications')
    .insert([
      {
        user_id: existingInvestment.user_id,
        message: message,
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ])

  return {
    success: true,
    action: 'update',
    investment: updatedInvestment,
    userName: user.full_name,
    userEmail: user.email
  }
}

// Remove investment
async function removeInvestment(investmentId, userId, user) {
  if (!investmentId) {
    throw new Error("Investment ID required")
  }

  // Get investment details before deletion
  const { data: investment, error: fetchError } = await supabaseAdmin
    .from('investments')
    .select('*')
    .eq('id', investmentId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !investment) {
    throw new Error("Investment not found")
  }

  // Delete investment
  const { error: deleteError } = await supabaseAdmin
    .from('investments')
    .delete()
    .eq('id', investmentId)
    .eq('user_id', userId)

  if (deleteError) {
    console.error('Investment delete error:', deleteError)
    throw new Error("Failed to delete investment")
  }

  // Create notification
  await supabaseAdmin
    .from('notifications')
    .insert([
      {
        user_id: userId,
        message: `Admin removed your ${investment.asset_name} investment ($${investment.amount})`,
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ])

  return {
    success: true,
    action: 'remove',
    investment,
    userName: user.full_name,
    userEmail: user.email
  }
}

