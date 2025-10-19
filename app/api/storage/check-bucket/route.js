import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request) {
  try {
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    
    if (bucketsError) {
      return NextResponse.json({ 
        error: bucketsError.message,
        details: bucketsError 
      }, { status: 500 })
    }

    // Check if kyc-documents bucket exists
    const kycBucket = buckets.find(b => b.name === 'kyc-documents')
    
    if (!kycBucket) {
      return NextResponse.json({
        exists: false,
        message: "Bucket 'kyc-documents' not found",
        availableBuckets: buckets.map(b => b.name)
      })
    }

    // List files in the bucket
    const { data: files, error: filesError } = await supabaseAdmin.storage
      .from('kyc-documents')
      .list()

    if (filesError) {
      return NextResponse.json({
        exists: true,
        bucket: kycBucket,
        filesError: filesError.message
      })
    }

    return NextResponse.json({
      exists: true,
      bucket: kycBucket,
      files: files,
      totalFiles: files?.length || 0
    })
  } catch (error) {
    console.error('Check bucket error:', error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}

