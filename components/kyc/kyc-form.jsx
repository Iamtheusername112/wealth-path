"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Upload, Loader2, Camera, X, FileCheck } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export function KYCForm({ user, existingUser }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : '',
    dob: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    documentType: 'passport',
  })
  const [documents, setDocuments] = useState({
    front: null,
    back: null,
    profilePhoto: null,
  })
  const [previewUrls, setPreviewUrls] = useState({
    front: null,
    back: null,
    profilePhoto: null,
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0]
    if (file) {
      // Increased file size limit to 20MB
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File size must be less than 20MB")
        return
      }
      
      // Validate image types for profile photo
      if (type === 'profilePhoto') {
        if (!file.type.startsWith('image/')) {
          toast.error("Profile photo must be an image")
          return
        }
      }
      
      setDocuments({
        ...documents,
        [type]: file,
      })
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrls({
        ...previewUrls,
        [type]: url,
      })
    }
  }

  const removeFile = (type) => {
    setDocuments({
      ...documents,
      [type]: null,
    })
    setPreviewUrls({
      ...previewUrls,
      [type]: null,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.fullName || !formData.dob || !formData.address) {
        toast.error("Please fill in all required fields")
        setLoading(false)
        return
      }

      if (!documents.front) {
        toast.error("Please upload at least the front of your ID document")
        setLoading(false)
        return
      }

      if (!documents.profilePhoto) {
        toast.error("Please upload a profile photo")
        setLoading(false)
        return
      }

      // Double-check file sizes before upload
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (documents.profilePhoto && documents.profilePhoto.size > maxSize) {
        toast.error("Profile photo must be less than 10MB")
        setLoading(false)
        return
      }
      if (documents.front && documents.front.size > maxSize) {
        toast.error("ID document (front) must be less than 10MB")
        setLoading(false)
        return
      }
      if (documents.back && documents.back.size > maxSize) {
        toast.error("ID document (back) must be less than 10MB")
        setLoading(false)
        return
      }

      // Calculate total upload size
      const totalSize = (documents.profilePhoto?.size || 0) + 
                       (documents.front?.size || 0) + 
                       (documents.back?.size || 0)
      
      if (totalSize > 25 * 1024 * 1024) { // 25MB total
        toast.error("Total file size is too large. Please use smaller files or compress them.")
        setLoading(false)
        return
      }

      // Show upload progress
      toast.info(`Uploading ${totalSize > 1024 * 1024 ? formatFileSize(totalSize) : 'files'}...`)

      const formDataToSend = new FormData()
      formDataToSend.append('userId', user.id)
      formDataToSend.append('email', user.emailAddresses?.[0]?.emailAddress || user.email)
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('dob', formData.dob)
      formDataToSend.append('address', formData.address)
      formDataToSend.append('city', formData.city)
      formDataToSend.append('state', formData.state)
      formDataToSend.append('zipCode', formData.zipCode)
      formDataToSend.append('country', formData.country)
      formDataToSend.append('documentType', formData.documentType)
      
      if (documents.front) {
        formDataToSend.append('documentFront', documents.front)
      }
      if (documents.back) {
        formDataToSend.append('documentBack', documents.back)
      }
      if (documents.profilePhoto) {
        formDataToSend.append('profilePhoto', documents.profilePhoto)
      }

      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("KYC verification submitted successfully!")
        // Hard redirect to ensure data is refreshed
        window.location.href = "/kyc"
      } else {
        toast.error(data.error || "Failed to submit KYC verification")
      }
    } catch (error) {
      console.error('KYC submission error:', error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Don't show form if already pending or approved
  if (existingUser && (existingUser.kyc_status === 'pending' || existingUser.kyc_status === 'approved')) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Please provide accurate information as it appears on your government-issued ID
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Legal Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main Street"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                />
              </div>

              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="NY"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="10001"
                />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="United States"
                />
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className="space-y-2">
              <Label>Profile Photo *</Label>
              <div className="flex flex-col items-center gap-4">
                {previewUrls.profilePhoto ? (
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gold-600 shadow-lg">
                      <Image
                        src={previewUrls.profilePhoto}
                        alt="Profile preview"
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('profilePhoto')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center bg-muted/50">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                
                <div className="w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'profilePhoto')}
                    className="hidden"
                    id="profile-photo"
                  />
                  <label htmlFor="profile-photo" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-gold-600 transition-colors">
                      <Camera className="h-8 w-8 mx-auto mb-2 text-gold-600" />
                      <p className="text-sm font-medium text-foreground">
                        {documents.profilePhoto ? "Change Photo" : "Upload Profile Photo"}
                      </p>
                      {documents.profilePhoto && (
                        <p className="text-xs text-green-600 font-semibold mt-1">
                          ✓ {formatFileSize(documents.profilePhoto.size)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG or WebP (max 20MB)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="documentType">Document Type *</Label>
              <Select
                id="documentType"
                name="documentType"
                value={formData.documentType}
                onChange={handleInputChange}
                required
              >
                <option value="passport">Passport</option>
                <option value="national_id">National ID</option>
                <option value="drivers_license">Driver's License</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload ID Document (Front) *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'front')}
                  className="hidden"
                  id="document-front"
                />
                <label htmlFor="document-front" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {documents.front ? documents.front.name : "Click to upload front of document"}
                  </p>
                  {documents.front && (
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      ✓ {formatFileSize(documents.front.size)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, or PDF (max 20MB)
                  </p>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upload ID Document (Back)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'back')}
                  className="hidden"
                  id="document-back"
                />
                <label htmlFor="document-back" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {documents.back ? documents.back.name : "Click to upload back of document (if applicable)"}
                  </p>
                  {documents.back && (
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      ✓ {formatFileSize(documents.back.size)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, or PDF (max 20MB)
                  </p>
                </label>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading} variant="gold">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit KYC Verification"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

