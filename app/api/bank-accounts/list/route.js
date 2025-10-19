import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request) {
  try {
    const { userId: authUserId } = await auth()

    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's linked bank accounts
    const { data: accounts, error } = await supabaseAdmin
      .from('linked_bank_accounts')
      .select('*')
      .eq('user_id', authUserId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch bank accounts error:', error)
      return NextResponse.json({ error: "Failed to fetch bank accounts" }, { status: 500 })
    }

    return NextResponse.json({ accounts: accounts || [] })
  } catch (error) {
    console.error('Fetch bank accounts error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

