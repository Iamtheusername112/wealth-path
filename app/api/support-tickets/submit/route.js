import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subject, message, category = 'general' } = await request.json()

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })
    }

    // Get user info
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('full_name, email, status')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Determine priority based on category and user status
    let priority = 'normal'
    if (category === 'account_reactivation' || user.status === 'deactivated') {
      priority = 'high'
    }

    // Create support ticket
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('support_tickets')
      .insert([
        {
          user_id: userId,
          subject,
          message,
          category,
          status: 'open',
          priority,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (ticketError) {
      console.error('Ticket creation error:', ticketError)
      return NextResponse.json({ error: "Failed to create support ticket" }, { status: 500 })
    }

    // Notify user about ticket creation
    await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: userId,
          message: `Your support ticket "${subject}" has been submitted. Our team will respond shortly.`,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    // Log for admin notification (in production, this would be an email/notification service)
    console.log('🎫 NEW SUPPORT TICKET:')
    console.log(`User: ${user.full_name || user.email} (${userId})`)
    console.log(`Category: ${category}`)
    console.log(`Priority: ${priority}`)
    console.log(`Subject: ${subject}`)
    console.log(`Ticket ID: ${ticket.id}`)
    console.log(`Check admin dashboard: /admin -> Support Tickets tab`)

    return NextResponse.json({ 
      success: true, 
      ticket,
      message: "Support ticket submitted successfully" 
    })
  } catch (error) {
    console.error('Support ticket submission error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
