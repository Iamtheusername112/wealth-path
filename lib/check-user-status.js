import { supabaseAdmin } from '@/lib/supabase-admin'

export async function checkUserStatus(userId) {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('status')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return { isActive: false, error: 'User not found' }
    }

    return { 
      isActive: user.status === 'active', 
      status: user.status,
      error: null 
    }
  } catch (error) {
    console.error('Error checking user status:', error)
    return { isActive: false, error: 'Failed to check user status' }
  }
}

export function isUserActive(user) {
  return user?.status === 'active'
}
