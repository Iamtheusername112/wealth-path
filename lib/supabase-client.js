// Client-side Supabase client for browser uploads
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Upload file directly to Supabase storage from browser
export async function uploadFileToSupabase(file, userId, fileType) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${fileType}_${Date.now()}.${fileExt}`
    
    const { data, error } = await supabaseClient.storage
      .from('kyc-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      throw error
    }

    const { data: urlData } = supabaseClient.storage
      .from('kyc-documents')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  } catch (error) {
    console.error(`Failed to upload ${fileType}:`, error)
    throw error
  }
}

