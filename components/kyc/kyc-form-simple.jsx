"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Upload, Loader2, Camera, X } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

export function KYCFormSimple({ user, existingUser }) {
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
      // File size limit: 3MB (reduced for better compatibility)
      if (file.size > 3 * 1024 * 1024) {
        toast.error("File size must be less than 3MB. Please compress your image at tinypng.com")
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

      toast.info("Converting files for upload...")

      // Convert files to base64
      const profilePhotoBase64 = documents.profilePhoto 
        ? await fileToBase64(documents.profilePhoto) 
        : null
      
      const documentFrontBase64 = documents.front 
        ? await fileToBase64(documents.front) 
        : null
      
      const documentBackBase64 = documents.back 
        ? await fileToBase64(documents.back) 
        : null

      toast.info("Uploading to server...")

      const response = await fetch('/api/kyc/submit-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          dob: formData.dob,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          documentType: formData.documentType,
          profilePhotoBase64,
          documentFrontBase64,
          documentBackBase64,
        }),
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('Failed to parse response:', jsonError)
        toast.error("Server error. Files might be too large. Please use files under 2MB each.")
        setLoading(false)
        return
      }

      if (response.ok) {
        toast.success("KYC verification submitted successfully!")
        router.push("/dashboard")
        router.refresh()
      } else {
        toast.error(data.error || "Failed to submit KYC verification")
      }
    } catch (error) {
      console.error('KYC submission error:', error)
      toast.error("An error occurred. Please try again with smaller files.")
    } finally {
      setLoading(false)
    }
  }

  // Don't show form if already pending or approved
  if (existingUser && (existingUser.kyc_status === 'pending' || existingUser.kyc_status === 'approved')) {
    return null
  }

  const totalSize = (documents.profilePhoto?.size || 0) + 
                   (documents.front?.size || 0) + 
                   (documents.back?.size || 0)

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
          {/* File size warning */}
          {totalSize > 10 * 1024 * 1024 && (
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                ⚠️ Total file size: {formatFileSize(totalSize)}. For best results, keep total under 10MB.
              </p>
            </div>
          )}

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
                    accept="image/jpeg,image/jpg,image/png,image/webp"
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
                        JPG, PNG or WebP (max 3MB - compress at tinypng.com if needed)
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
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
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
                    PNG, JPG (max 5MB recommended)
                  </p>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upload ID Document (Back)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
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
                    PNG, JPG (max 5MB recommended)
                  </p>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 <strong>Tip:</strong> Use smaller files (under 2MB each) for faster, reliable uploads. 
              Compress large images at tinypng.com if needed.
            </p>
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

