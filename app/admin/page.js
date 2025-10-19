import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { PremiumAdminContent } from "@/components/admin/premium-admin-content"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { supabaseAdmin } from "@/lib/supabase-admin"

export default async function AdminPage() {
  // Check admin authentication via cookie
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')

  if (!adminToken || adminToken.value !== 'admin_authenticated') {
    redirect("/admin-login")
  }

  // Fetch all users (use admin client)
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch all KYC documents (use admin client)
  const { data: kycDocuments } = await supabaseAdmin
    .from('kyc_documents')
    .select('*')
    .order('uploaded_at', { ascending: false })

  // Fetch all transactions (use admin client)
  const { data: transactions } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch all investments (use admin client)
  const { data: investments } = await supabaseAdmin
    .from('investments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch all deposit requests (use admin client)
  const { data: depositRequests } = await supabaseAdmin
    .from('deposit_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch all credit card requests (use admin client)
  const { data: cardRequests } = await supabaseAdmin
    .from('credit_card_requests')
    .select('*')
    .order('requested_at', { ascending: false })
    .limit(100)

  // Fetch all support tickets (use admin client)
  const { data: supportTickets } = await supabaseAdmin
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  // Generate signed URLs for all profile images and KYC documents
  const generateSignedUrl = async (url) => {
    if (!url) return null
    
    try {
      // Extract file path from full Supabase URL
      let filePath = url
      if (url.includes('/storage/v1/object/')) {
        const match = url.match(/\/kyc-documents\/(.+)/)
        if (match) {
          filePath = match[1].split('?')[0]
        }
      }

      // Generate signed URL
      const { data, error } = await supabaseAdmin.storage
        .from('kyc-documents')
        .createSignedUrl(filePath, 3600) // 1 hour expiry

      if (error) {
        console.error('Signed URL error for', filePath, ':', error)
        return url // Return original if signing fails
      }

      return data.signedUrl
    } catch (error) {
      console.error('Error generating signed URL:', error)
      return url
    }
  }

  // Generate signed URLs for all users' profile images
  const usersWithSignedUrls = await Promise.all(
    (users || []).map(async (user) => ({
      ...user,
      profile_image_url: user.profile_image_url 
        ? await generateSignedUrl(user.profile_image_url)
        : null
    }))
  )

  // Generate signed URLs for all KYC documents
  const kycDocsWithSignedUrls = await Promise.all(
    (kycDocuments || []).map(async (doc) => ({
      ...doc,
      file_url: await generateSignedUrl(doc.file_url)
    }))
  )

  // Calculate pending counts for navbar
  const pendingKYC = usersWithSignedUrls.filter(u => u.kyc_status === 'pending').length
  const pendingDeposits = depositRequests?.filter(d => d.status === 'pending').length || 0
  const pendingCardRequests = cardRequests?.filter(c => c.status === 'pending').length || 0
  const openSupportTickets = supportTickets?.filter(t => t.status === 'open' || t.status === 'in_progress').length || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <AdminNavbar 
        pendingKYC={pendingKYC}
        pendingDeposits={pendingDeposits}
        pendingCardRequests={pendingCardRequests}
      />
      <PremiumAdminContent
        users={usersWithSignedUrls}
        kycDocuments={kycDocsWithSignedUrls}
        transactions={transactions || []}
        investments={investments || []}
        depositRequests={depositRequests || []}
        cardRequests={cardRequests || []}
        supportTickets={supportTickets || []}
      />
    </div>
  )
}

