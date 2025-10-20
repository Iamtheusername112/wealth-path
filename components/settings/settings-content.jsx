"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Shield, Bell, Camera, Loader2, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { LinkedBanksSection } from "./linked-banks-section"
import { BankingDetails } from "./banking-details"

export function SettingsContent({ user, clerkUser }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  
  const [profileData, setProfileData] = useState({
    fullName: user?.full_name || '',
    address: user?.address || '',
  })
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(
    user?.profileImageUrl || user?.profile_image_url || user?.imageUrl || null
  )

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    setUploadingPhoto(true)

    try {
      const formData = new FormData()
      formData.append('userId', user.id)
      formData.append('profilePhoto', file)

      const response = await fetch('/api/settings/update-photo', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setProfilePhotoPreview(data.photoUrl)
        toast.success("Profile photo updated successfully")
        router.refresh()
      } else {
        toast.error("Failed to update profile photo")
      }
    } catch (error) {
      console.error('Photo update error:', error)
      toast.error("An error occurred")
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/settings/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          fullName: profileData.fullName,
          address: profileData.address,
        }),
      })

      if (response.ok) {
        toast.success("Profile updated successfully")
        router.refresh()
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto gap-1 sm:gap-2 flex-nowrap">
          <TabsTrigger value="profile" active={activeTab === "profile"} className="flex-shrink-0">
            <User className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="banking" active={activeTab === "banking"} className="flex-shrink-0">
            <Building2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Banking</span>
          </TabsTrigger>
          <TabsTrigger value="security" active={activeTab === "security"} className="flex-shrink-0">
            <Shield className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" active={activeTab === "preferences"} className="flex-shrink-0">
            <Bell className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="shadow-lg shadow-black/10">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
              <CardDescription className="text-sm sm:text-base">Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-6">
                {/* Profile Photo Section */}
                <div className="flex flex-col items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-gold-600 shadow-lg bg-muted">
                      {profilePhotoPreview ? (
                        <img 
                          src={profilePhotoPreview} 
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {uploadingPhoto && (
                      <div className="absolute inset-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="profile-photo-upload"
                      disabled={uploadingPhoto}
                    />
                    <label htmlFor="profile-photo-upload">
                      <Button 
                        type="button" 
                        variant="outline" 
                        asChild
                        disabled={uploadingPhoto}
                        className="text-xs sm:text-sm"
                      >
                        <span className="cursor-pointer">
                          <Camera className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Change Profile Photo</span>
                          <span className="sm:hidden">Change Photo</span>
                        </span>
                      </Button>
                    </label>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 text-center">
                      JPG, PNG or WebP (max 10MB)
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={clerkUser?.email || ''}
                disabled
              />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="text"
                    value={user?.dob || 'Not set'}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact support to change your date of birth
                  </p>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  />
                </div>

                <div>
                  <Label>KYC Status</Label>
                  <div className="mt-2">
                    <Badge variant={
                      user?.kyc_status === 'approved' ? 'success' : 
                      user?.kyc_status === 'pending' ? 'warning' : 
                      'destructive'
                    }>
                      {user?.kyc_status || 'Not Submitted'}
                    </Badge>
                  </div>
                </div>

                {user?.account_number && (
                  <div>
                    <Label className="text-sm sm:text-base">Your Account Number</Label>
                    <div className="mt-2 p-3 sm:p-4 rounded-lg border-2 border-gold-600/20 bg-gold-50 dark:bg-gold-950/10">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(user.account_number)
                          toast.success('Account number copied!', {
                            description: user.account_number
                          })
                        }}
                        className="group flex items-center justify-between w-full hover:opacity-80 transition-opacity min-h-[44px]"
                      >
                        <p className="font-mono text-base sm:text-xl font-bold text-gold-700 dark:text-gold-400 tracking-wider truncate pr-2">
                          {user.account_number}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                            Click to copy
                          </span>
                          <svg 
                            className="h-5 w-5 text-gold-600 opacity-0 group-hover:opacity-100 transition-opacity" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={loading} variant="gold" className="w-full sm:w-auto">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banking">
          <div className="space-y-4 sm:space-y-6">
            <BankingDetails user={user} />
            <LinkedBanksSection userId={user?.id} />
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card className="shadow-lg shadow-black/10">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Security Settings</CardTitle>
              <CardDescription className="text-sm sm:text-base">Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="p-3 sm:p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Password</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Password is managed through Clerk authentication
                </p>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Manage Password
                </Button>
              </div>

              <div className="p-3 sm:p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Two-Factor Authentication</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Add an extra layer of security to your account
                </p>
                <Badge className="text-xs">Coming Soon</Badge>
              </div>

              <div className="p-3 sm:p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Active Sessions</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Manage your active login sessions
                </p>
                <Badge className="text-xs">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="shadow-lg shadow-black/10">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Notification Preferences</CardTitle>
              <CardDescription className="text-sm sm:text-base">Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base">Transaction Alerts</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Get notified of all transactions
                  </p>
                </div>
                <Badge variant="success" className="text-xs w-fit">Enabled</Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base">Investment Updates</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Receive updates on your investments
                  </p>
                </div>
                <Badge variant="success" className="text-xs w-fit">Enabled</Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base">Marketing Emails</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Promotional offers and news
                  </p>
                </div>
                <Badge className="text-xs w-fit">Disabled</Badge>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground pt-2">
                Advanced notification preferences coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

