import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized", count: 0 }, { status: 401 })
    }

    // Count unread notifications
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Unread count error:', error)
      return NextResponse.json({ success: true, count: 0 })
    }

    return NextResponse.json({ success: true, count: count || 0 })
  } catch (error) {
    console.error('Unread count error:', error)
    return NextResponse.json({ success: true, count: 0 })
  }
}

