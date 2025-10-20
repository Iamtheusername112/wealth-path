import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id
    const { id, title, description, target_amount, target_date, category } = await request.json()

    if (!id || !title || !target_amount) {
      return NextResponse.json({ error: "ID, title, and target amount are required" }, { status: 400 })
    }

    // Verify ownership
    const { data: existingGoal } = await supabaseAdmin
      .from('investment_goals')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existingGoal || existingGoal.user_id !== userId) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    // Update goal
    const { data: goal, error } = await supabaseAdmin
      .from('investment_goals')
      .update({
        title,
        description,
        target_amount: parseFloat(target_amount),
        target_date: target_date || null,
        category: category || 'other'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating goal:', error)
      return NextResponse.json({ error: "Failed to update goal" }, { status: 500 })
    }

    return NextResponse.json({ success: true, goal })

  } catch (error) {
    console.error('Update goal error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

