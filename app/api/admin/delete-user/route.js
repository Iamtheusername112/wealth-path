import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request) {
  try {
    // Check admin authentication via cookie
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken || adminToken.value !== 'admin_authenticated') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { userId: targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    console.log(`Admin deleting user ${targetUserId}`)

    // Get user info before deletion for logging
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user's uploaded files from storage
    const { data: userFiles } = await supabaseAdmin.storage
      .from('kyc-documents')
      .list(targetUserId)

    if (userFiles && userFiles.length > 0) {
      const filePaths = userFiles.map(file => `${targetUserId}/${file.name}`)
      await supabaseAdmin.storage
        .from('kyc-documents')
        .remove(filePaths)
    }

    // Delete all related data (cascade delete should handle this, but let's be explicit)
    // Note: The foreign key cascade will delete transactions, investments, notifications, kyc_documents automatically
    
    // Delete the user (this will cascade delete all related records)
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', targetUserId)

    if (deleteError) {
      console.error('User deletion error:', deleteError)
      return NextResponse.json({ 
        error: "Failed to delete user. Please try again." 
      }, { status: 500 })
    }

    console.log(`Successfully deleted user: ${userData.email}`)

    return NextResponse.json({ 
      success: true, 
      message: "User and all associated data deleted successfully",
      deletedUser: {
        email: userData.email,
        name: userData.full_name
      }
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

