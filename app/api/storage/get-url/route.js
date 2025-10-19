import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request) {
  try {
    let { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json({ error: "File path required" }, { status: 400 })
    }

    console.log('Original filePath:', filePath)

    // Extract file path from full Supabase URL if needed
    if (filePath.includes('/storage/v1/object/')) {
      // Extract path after '/kyc-documents/'
      const match = filePath.match(/\/kyc-documents\/(.+)/)
      if (match) {
        filePath = match[1]
        console.log('Extracted path:', filePath)
      }
    }

    // Remove any query parameters
    filePath = filePath.split('?')[0]

    // Generate a signed URL that expires in 1 hour
    const { data, error } = await supabaseAdmin.storage
      .from('kyc-documents')
      .createSignedUrl(filePath, 3600) // 3600 seconds = 1 hour

    if (error) {
      console.error('Error generating signed URL:', error)
      console.error('Attempted path:', filePath)
      return NextResponse.json({ error: error.message, path: filePath }, { status: 500 })
    }

    console.log('Signed URL generated successfully')
    return NextResponse.json({ url: data.signedUrl })
  } catch (error) {
    console.error('Get URL error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

