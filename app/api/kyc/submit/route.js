import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { supabase } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase-admin"

// Increase max file upload size to 20MB
export const maxDuration = 60 // 60 seconds
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { userId: authUserId } = await auth()
    const user = await currentUser()

    if (!authUserId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let formData
    try {
      formData = await request.formData()
    } catch (parseError) {
      console.error('FormData parsing error:', parseError)
      return NextResponse.json(
        { error: "Failed to parse form data. Please try again with smaller files." },
        { status: 400 }
      )
    }
    
    const formUserId = formData.get('userId')
    const email = user.emailAddresses?.[0]?.emailAddress
    const fullName = formData.get('fullName')
    const dob = formData.get('dob')
    const address = formData.get('address')
    const city = formData.get('city')
    const state = formData.get('state')
    const zipCode = formData.get('zipCode')
    const country = formData.get('country')
    const documentType = formData.get('documentType')
    const documentFront = formData.get('documentFront')
    const documentBack = formData.get('documentBack')
    const profilePhoto = formData.get('profilePhoto')

    console.log('Processing KYC for user:', authUserId, {
      hasProfilePhoto: !!profilePhoto,
      hasFront: !!documentFront,
      hasBack: !!documentBack,
    })

    console.log('Form data received:', {
      formUserId,
      email,
      fullName,
      hasDocumentFront: !!documentFront,
      hasDocumentBack: !!documentBack,
      hasProfilePhoto: !!profilePhoto,
    })

    // Verify user ID matches
    if (formUserId !== authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate required files
    if (!documentFront || !profilePhoto) {
      return NextResponse.json(
        { error: "Profile photo and ID document (front) are required" },
        { status: 400 }
      )
    }

    // Upload documents to Supabase storage using admin client (bypasses RLS)
    const uploadDocument = async (file, type) => {
      if (!file) return null
      
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${authUserId}/${type}_${Date.now()}.${fileExt}`
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Use supabaseAdmin to bypass RLS policies
        const { data, error } = await supabaseAdmin.storage
          .from('kyc-documents')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false
          })

        if (error) {
          console.error('Upload error:', error)
          throw error
        }

        const { data: urlData } = supabaseAdmin.storage
          .from('kyc-documents')
          .getPublicUrl(fileName)

        return urlData.publicUrl
      } catch (err) {
        console.error(`Failed to upload ${type}:`, err)
        throw err
      }
    }

    let frontUrl = null
    let backUrl = null
    let profilePhotoUrl = null

    try {
      if (documentFront) {
        frontUrl = await uploadDocument(documentFront, 'front')
      }
      if (documentBack) {
        backUrl = await uploadDocument(documentBack, 'back')
      }
      if (profilePhoto) {
        profilePhotoUrl = await uploadDocument(profilePhoto, 'profile')
      }
    } catch (uploadError) {
      console.error('Document upload failed:', uploadError)
      return NextResponse.json(
        { error: "Failed to upload documents. Please try again." },
        { status: 500 }
      )
    }

    // Check if user already exists (use admin client to bypass RLS)
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single()

    if (existingUser) {
      // Update existing user (use admin client)
      const { error: updateError } = await supabaseAdmin
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

      if (updateError) {
        console.error('User update error:', updateError)
        return NextResponse.json(
          { error: "Failed to update user record" },
          { status: 500 }
        )
      }
    } else {
      // Create new user (use admin client to bypass RLS)
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert([
          {
            id: authUserId,
            email: email,
            full_name: fullName,
            dob: dob,
            address: `${address}, ${city}, ${state} ${zipCode}, ${country}`,
            profile_image_url: profilePhotoUrl,
            kyc_status: 'pending',
            balance: 0,
            created_at: new Date().toISOString(),
          },
        ])

      if (insertError) {
        console.error('User insert error:', insertError)
        return NextResponse.json(
          { error: "Failed to create user record" },
          { status: 500 }
        )
      }
    }

    // Store KYC documents (use admin client)
    if (frontUrl) {
      const { error: docError } = await supabaseAdmin
        .from('kyc_documents')
        .insert([
          {
            user_id: authUserId,
            document_type: documentType,
            file_url: frontUrl,
            status: 'pending',
            uploaded_at: new Date().toISOString(),
          },
        ])

      if (docError) {
        console.error('KYC document insert error:', docError)
      }
    }

    if (backUrl) {
      const { error: docError } = await supabaseAdmin
        .from('kyc_documents')
        .insert([
          {
            user_id: authUserId,
            document_type: `${documentType}_back`,
            file_url: backUrl,
            status: 'pending',
            uploaded_at: new Date().toISOString(),
          },
        ])

      if (docError) {
        console.error('KYC document back insert error:', docError)
      }
    }

    // Create notification (use admin client)
    await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: authUserId,
          message: 'Your KYC verification has been submitted and is under review.',
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    return NextResponse.json({ success: true, message: "KYC submitted successfully" })
  } catch (error) {
    console.error('KYC submission error:', error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
