import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request) {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken || adminToken.value !== 'admin_authenticated') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch pending counts
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('kyc_status')
      .eq('kyc_status', 'pending')

    const { data: deposits } = await supabaseAdmin
      .from('deposit_requests')
      .select('id')
      .eq('status', 'pending')

    const { data: cardRequests } = await supabaseAdmin
      .from('credit_card_requests')
      .select('id')
      .eq('status', 'pending')

    const { data: supportTickets } = await supabaseAdmin
      .from('support_tickets')
      .select('id')
      .in('status', ['open', 'in_progress'])

    return NextResponse.json({
      success: true,
      counts: {
        pendingKYC: users?.length || 0,
        pendingDeposits: deposits?.length || 0,
        pendingCardRequests: cardRequests?.length || 0,
        openSupportTickets: supportTickets?.length || 0,
      }
    })
  } catch (error) {
    console.error('Error fetching pending counts:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
