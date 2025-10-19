import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabase } from "@/lib/supabase"

export async function POST(request) {
  try {
    const { userId: authUserId } = await auth()

    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const userId = formData.get('userId')
    const profilePhoto = formData.get('profilePhoto')

    if (userId !== authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!profilePhoto) {
      return NextResponse.json({ error: "No photo provided" }, { status: 400 })
    }

    // Upload profile photo to Supabase storage
    const fileExt = profilePhoto.name.split('.').pop()
    const fileName = `${userId}/profile_${Date.now()}.${fileExt}`
    const bytes = await profilePhoto.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { data, error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, buffer, {
        contentType: profilePhoto.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(fileName)

    const photoUrl = urlData.publicUrl

    // Update user profile_image_url
    const { error: updateError } = await supabase
      .from('users')
      .update({
        profile_image_url: photoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Profile photo update error:', updateError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ success: true, photoUrl })
  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

