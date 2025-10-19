// Admin Supabase client with service role key (bypasses RLS)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Upload file with admin privileges (bypasses RLS)
export async function uploadFileAsAdmin(file, userId, fileType) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${fileType}_${Date.now()}.${fileExt}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

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
  } catch (error) {
    console.error(`Failed to upload ${fileType}:`, error)
    throw error
  }
}

