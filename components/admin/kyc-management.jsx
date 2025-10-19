"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import { CheckCircle, XCircle, ExternalLink, Eye, Image as ImageIcon, FileText, User } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export function KYCManagement({ users, kycDocuments }) {
  const router = useRouter()
  const [loading, setLoading] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [viewDocumentsOpen, setViewDocumentsOpen] = useState(false)

  const pendingUsers = users.filter(u => u.kyc_status === 'pending')

  const viewUserDetails = (user) => {
    setSelectedUser(user)
    setViewDocumentsOpen(true)
  }

  const handleKYCAction = async (userId, action) => {
    setLoading(userId)
    
    try {
      const response = await fetch('/api/admin/kyc-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`KYC ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to update KYC status')
      }
    } catch (error) {
      console.error('KYC action error:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(null)
    }
  }

  const getUserDocuments = (userId) => {
    return kycDocuments.filter(doc => doc.user_id === userId)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-gold-600" />
                KYC Verification Management
              </CardTitle>
              <CardDescription>Review and approve user identity verifications</CardDescription>
            </div>
            {pendingUsers.length > 0 && (
              <Badge variant="warning" className="text-base px-4 py-2">
                {pendingUsers.length} Pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pendingUsers.length > 0 ? (
            <div className="space-y-4">
              {pendingUsers.map((user) => {
                const docs = getUserDocuments(user.id)
                return (
                  <div key={user.id} className="p-6 rounded-lg border-2 hover:border-gold-600 transition-all bg-card">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* User Info */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* Profile Photo */}
                        {user.profile_image_url ? (
                          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gold-600 shadow-lg flex-shrink-0">
                            <img 
                              src={user.profile_image_url} 
                              alt={user.full_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                            {user.full_name?.[0] || user.email[0].toUpperCase()}
                          </div>
                        )}

                        {/* Details */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">{user.full_name || 'Unnamed User'}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Date of Birth</p>
                              <p className="font-medium">{user.dob ? formatDate(user.dob) : 'Not provided'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Submitted</p>
                              <p className="font-medium">{formatDate(user.updated_at || user.created_at)}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-muted-foreground">Address</p>
                              <p className="font-medium">{user.address || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Documents & Actions */}
                      <div className="flex flex-col gap-3 md:w-64">
                        {/* View Documents Button */}
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => viewUserDetails(user)}
                        >
                          <Eye className="h-4 w-4" />
                          View Documents ({docs.length})
                        </Button>

                        {/* Document Quick Links */}
                        <div className="flex flex-col gap-2">
                          {docs.map((doc, idx) => (
                            <a
                              key={doc.id}
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {doc.document_type} 
                            </a>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 mt-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                            onClick={() => handleKYCAction(user.id, 'approve')}
                            disabled={loading === user.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve KYC
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => handleKYCAction(user.id, 'reject')}
                            disabled={loading === user.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject KYC
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <CheckCircle className="h-20 w-20 mx-auto mb-4 text-green-500 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">All Clear!</h3>
              <p className="text-sm">No pending KYC verifications at this time</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer Modal */}
      <Dialog open={viewDocumentsOpen} onOpenChange={setViewDocumentsOpen}>
        <DialogContent onClose={() => setViewDocumentsOpen(false)} className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-6 w-6 text-gold-600" />
              KYC Documents - {selectedUser?.full_name || 'User'}
            </DialogTitle>
            <DialogDescription>
              Review uploaded documents and personal information
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 mt-4">
              {/* User Info Summary */}
              <div className="p-4 rounded-lg bg-muted">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Full Name</p>
                    <p className="font-semibold">{selectedUser.full_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-semibold">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date of Birth</p>
                    <p className="font-semibold">{selectedUser.dob ? formatDate(selectedUser.dob) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p className="font-semibold">{formatDate(selectedUser.updated_at || selectedUser.created_at)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-semibold">{selectedUser.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Profile Photo */}
              {selectedUser.profile_image_url && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-gold-600" />
                    Profile Photo
                  </h4>
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gold-600 shadow-xl bg-muted">
                        <img
                          src={selectedUser.profile_image_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-600 to-navy-800 text-white text-6xl font-bold">' + (selectedUser.full_name?.[0] || selectedUser.email[0].toUpperCase()) + '</div>'
                          }}
                        />
                      </div>
                      <a
                        href={selectedUser.profile_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* ID Documents */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gold-600" />
                  Identity Documents
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {getUserDocuments(selectedUser.id).map((doc) => (
                    <Card key={doc.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm capitalize">
                          {doc.document_type.replace('_', ' ')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          {doc.file_url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                            <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden group cursor-pointer">
                              <img
                                src={doc.file_url}
                                alt={doc.document_type}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  console.error('Image load error:', doc.file_url)
                                  e.target.onerror = null
                                  e.target.parentElement.innerHTML = '<div class="flex flex-col items-center justify-center h-full gap-2"><svg class="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p class="text-red-500 font-semibold">Failed to load</p><p class="text-xs text-muted-foreground">Click to open in new tab</p></div>'
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                                <ExternalLink className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-48 bg-muted rounded-lg flex flex-col items-center justify-center gap-3 hover:bg-accent transition-colors cursor-pointer">
                              <FileText className="h-16 w-16 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Click to view PDF</p>
                            </div>
                          )}
                        </a>
                        <div className="mt-3 flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(doc.uploaded_at)}
                          </p>
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            Open Full Size <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Verification Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    handleKYCAction(selectedUser.id, 'approve')
                    setViewDocumentsOpen(false)
                  }}
                  disabled={loading === selectedUser.id}
                  className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Approve Verification
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    handleKYCAction(selectedUser.id, 'reject')
                    setViewDocumentsOpen(false)
                  }}
                  disabled={loading === selectedUser.id}
                  className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Reject Verification
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
