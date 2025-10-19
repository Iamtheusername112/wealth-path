import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema helper functions
export async function getUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateUserKYCStatus(userId, status) {
  const { data, error } = await supabase
    .from('users')
    .update({ kyc_status: status })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createTransaction(transaction) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getTransactions(userId, limit = 10) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export async function createInvestment(investment) {
  const { data, error } = await supabase
    .from('investments')
    .insert([investment])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getInvestments(userId) {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function uploadKYCDocument(userId, file, documentType) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${documentType}_${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('kyc-documents')
    .upload(fileName, file)
  
  if (error) throw error
  
  const { data: urlData } = supabase.storage
    .from('kyc-documents')
    .getPublicUrl(fileName)
  
  return urlData.publicUrl
}

export async function createKYCDocument(document) {
  const { data, error } = await supabase
    .from('kyc_documents')
    .insert([document])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getNotifications(userId, limit = 10) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export async function markNotificationAsRead(notificationId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

