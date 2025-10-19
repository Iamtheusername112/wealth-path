import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { supabase } from "@/lib/supabase"

// Route segment config
export const maxDuration = 60
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { userId: authUserId } = await auth()
    const user = await currentUser()

    if (!authUserId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse JSON instead of FormData
    let body
    try {
      const text = await request.text()
      body = JSON.parse(text)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      return NextResponse.json(
        { error: "Failed to parse request. Files might be too large." },
        { status: 400 }
      )
    }
    
    const {
      fullName,
      dob,
      address,
      city,
      state,
      zipCode,
      country,
      documentType,
      profilePhotoBase64,
      documentFrontBase64,
      documentBackBase64,
    } = body

    console.log('Received KYC data for user:', authUserId)

    // Upload base64 files to Supabase
    const uploadBase64File = async (base64Data, type) => {
      if (!base64Data) return null
      
      try {
        // Remove data URL prefix if present
        const base64Content = base64Data.includes(',') 
          ? base64Data.split(',')[1] 
          : base64Data
        
        const buffer = Buffer.from(base64Content, 'base64')
        const ext = base64Data.match(/data:image\/(.*?);/)?.[1] || 'jpg'
        const fileName = `${authUserId}/${type}_${Date.now()}.${ext}`

        const { data, error } = await supabase.storage
          .from('kyc-documents')
          .upload(fileName, buffer, {
            contentType: `image/${ext}`,
            upsert: false
          })

        if (error) {
          console.error(`Upload error for ${type}:`, error)
          throw error
        }

        const { data: urlData } = supabase.storage
          .from('kyc-documents')
          .getPublicUrl(fileName)

        return urlData.publicUrl
      } catch (err) {
        console.error(`Failed to upload ${type}:`, err)
        throw err
      }
    }

    // Upload all files
    let profilePhotoUrl = null
    let frontUrl = null
    let backUrl = null

    try {
      if (profilePhotoBase64) {
        profilePhotoUrl = await uploadBase64File(profilePhotoBase64, 'profile')
      }
      if (documentFrontBase64) {
        frontUrl = await uploadBase64File(documentFrontBase64, 'front')
      }
      if (documentBackBase64) {
        backUrl = await uploadBase64File(documentBackBase64, 'back')
      }
    } catch (uploadError) {
      console.error('File upload failed:', uploadError)
      return NextResponse.json(
        { error: "Failed to upload files. Please try smaller files." },
        { status: 500 }
      )
    }

    const email = user.emailAddresses?.[0]?.emailAddress

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single()

    if (existingUser) {
      // Update user
      await supabase
        .from('users')
        .update({
          full_name: fullName,
          dob: dob,
          address: `${address}, ${city}, ${state} ${zipCode}, ${country}`,
          profile_image_url: profilePhotoUrl || existingUser.profile_image_url,
          kyc_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUserId)
    } else {
      // Create user
      await supabase
        .from('users')
        .insert([{
          id: authUserId,
          email: email,
          full_name: fullName,
          dob: dob,
          address: `${address}, ${city}, ${state} ${zipCode}, ${country}`,
          profile_image_url: profilePhotoUrl,
          kyc_status: 'pending',
          balance: 0,
          created_at: new Date().toISOString(),
        }])
    }

    // Store KYC documents
    if (frontUrl) {
      await supabase.from('kyc_documents').insert([{
        user_id: authUserId,
        document_type: documentType,
        file_url: frontUrl,
        status: 'pending',
        uploaded_at: new Date().toISOString(),
      }])
    }

    if (backUrl) {
      await supabase.from('kyc_documents').insert([{
        user_id: authUserId,
        document_type: `${documentType}_back`,
        file_url: backUrl,
        status: 'pending',
        uploaded_at: new Date().toISOString(),
      }])
    }

    // Create notification
    await supabase.from('notifications').insert([{
      user_id: authUserId,
      message: 'Your KYC verification has been submitted and is under review.',
      is_read: false,
      created_at: new Date().toISOString(),
    }])

    return NextResponse.json({ 
      success: true, 
      message: "KYC submitted successfully" 
    })
  } catch (error) {
    console.error('KYC submission error:', error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

