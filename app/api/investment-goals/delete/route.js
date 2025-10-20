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
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Goal ID is required" }, { status: 400 })
    }

    // Verify ownership and delete
    const { error } = await supabaseAdmin
      .from('investment_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting goal:', error)
      return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete goal error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

