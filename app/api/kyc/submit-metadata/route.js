import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { supabase } from "@/lib/supabase"

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { userId: authUserId } = await auth()
    const user = await currentUser()

    if (!authUserId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    const {
      userId,
      email,
      fullName,
      dob,
      address,
      city,
      state,
      zipCode,
      country,
      documentType,
      profilePhotoUrl,
      frontUrl,
      backUrl,
    } = body

    // Verify user ID matches
    if (userId !== authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log('Saving KYC metadata for user:', authUserId)

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single()

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
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
      // Create new user
      const { error: insertError } = await supabase
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

    // Store KYC documents
    if (frontUrl) {
      await supabase
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
    }

    if (backUrl) {
      await supabase
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
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert([
        {
          user_id: authUserId,
          message: 'Your KYC verification has been submitted and is under review.',
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])

    return NextResponse.json({ 
      success: true, 
      message: "KYC submitted successfully" 
    })
  } catch (error) {
    console.error('KYC metadata save error:', error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

