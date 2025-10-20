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
    const { title, description, target_amount, target_date, category } = await request.json()

    if (!title || !target_amount) {
      return NextResponse.json({ error: "Title and target amount are required" }, { status: 400 })
    }

    // Create goal
    const { data: goal, error } = await supabaseAdmin
      .from('investment_goals')
      .insert([
        {
          user_id: userId,
          title,
          description,
          target_amount: parseFloat(target_amount),
          target_date: target_date || null,
          category: category || 'other',
          current_amount: 0,
          status: 'active'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating goal:', error)
      return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
    }

    return NextResponse.json({ success: true, goal })

  } catch (error) {
    console.error('Create goal error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

