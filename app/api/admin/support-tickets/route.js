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

    // Fetch all support tickets with user information
    const { data: tickets, error } = await supabaseAdmin
      .from('support_tickets')
      .select(`
        *,
        users:user_id (
          id,
          email,
          full_name,
          status
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching support tickets:', error)
      return NextResponse.json({ error: "Failed to fetch support tickets" }, { status: 500 })
    }

    return NextResponse.json({ success: true, tickets: tickets || [] })
  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken || adminToken.value !== 'admin_authenticated') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { ticketId, action, response, reactivateAccount } = await request.json()

    if (!ticketId || !action) {
      return NextResponse.json({ error: "Ticket ID and action are required" }, { status: 400 })
    }

    // Get ticket details
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('support_tickets')
      .select('*, users:user_id(*)')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    if (action === 'respond') {
      if (!response) {
        return NextResponse.json({ error: "Response is required" }, { status: 400 })
      }

      // Update ticket with admin response
      const { data: updatedTicket, error: updateError } = await supabaseAdmin
        .from('support_tickets')
        .update({
          admin_response: response,
          responded_by: 'Admin',
          responded_at: new Date().toISOString(),
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating ticket:', updateError)
        return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 })
      }

      // Notify user about the response
      await supabaseAdmin
        .from('notifications')
        .insert([
          {
            user_id: ticket.user_id,
            message: `Admin has responded to your support ticket: "${ticket.subject}". Check your ticket for details.`,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ])

      return NextResponse.json({ 
        success: true, 
        message: "Response sent successfully. User has been notified.",
        ticket: updatedTicket
      })
    } else if (action === 'resolve') {
      // Mark ticket as resolved
      const { data: updatedTicket, error: updateError } = await supabaseAdmin
        .from('support_tickets')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .select()
        .single()

      if (updateError) {
        console.error('Error resolving ticket:', updateError)
        return NextResponse.json({ error: "Failed to resolve ticket" }, { status: 500 })
      }

      // If reactivating account when resolving
      if (reactivateAccount) {
        await supabaseAdmin
          .from('users')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', ticket.user_id)

        // Notify user about reactivation
        await supabaseAdmin
          .from('notifications')
          .insert([
            {
              user_id: ticket.user_id,
              message: `Great news! Your account has been reactivated. You can now access all features. Your support ticket "${ticket.subject}" has been resolved.`,
              is_read: false,
              created_at: new Date().toISOString(),
            },
          ])
      } else {
        // Notify user about ticket resolution only
        await supabaseAdmin
          .from('notifications')
          .insert([
            {
              user_id: ticket.user_id,
              message: `Your support ticket "${ticket.subject}" has been resolved.`,
              is_read: false,
              created_at: new Date().toISOString(),
            },
          ])
      }

      return NextResponse.json({ 
        success: true, 
        message: reactivateAccount ? "Ticket resolved and account reactivated" : "Ticket marked as resolved",
        ticket: updatedTicket,
        accountReactivated: reactivateAccount
      })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error('Support ticket management error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
