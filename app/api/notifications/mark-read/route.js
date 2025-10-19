import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request) {
  try {
    const { userId: authUserId } = await auth()

    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { notificationIds } = await request.json()

    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .in('id', notificationIds)
        .eq('user_id', authUserId)

      if (error) {
        console.error('Mark read error:', error)
        return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
      }
    } else {
      // Mark all user's notifications as read
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', authUserId)
        .eq('is_read', false)

      if (error) {
        console.error('Mark all read error:', error)
        return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark read error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
