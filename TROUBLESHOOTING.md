# 🔧 Troubleshooting Guide

## Common Issues & Solutions

---

## ❌ Error: "Unexpected end of multipart data"

### **Possible Causes:**

1. **Files are too large**
2. **Network timeout**
3. **Supabase storage not configured**
4. **Browser/network issue**

### **Solutions:**

#### **Solution 1: Check File Sizes**
Make sure each file is **under 10MB**:
- Profile photo: < 10MB
- ID front: < 10MB
- ID back: < 10MB

**How to check:**
- Right-click file → Properties → Size
- Or use smaller files for testing

#### **Solution 2: Try Smaller Files First**
For testing, use smaller images (1-2MB):
- Take a screenshot
- Use a compressed photo
- Test if it works with small files first

#### **Solution 3: Restart Dev Server**
```bash
# Stop server (Ctrl+C in terminal)
npm run dev
```

#### **Solution 4: Clear Browser Cache**
- Press Ctrl+Shift+R (hard refresh)
- Or try in Incognito mode

#### **Solution 5: Check Supabase Storage**
1. Go to Supabase Dashboard
2. **Storage** → `kyc-documents` bucket
3. Verify it exists and is configured:
   - ❌ NOT public
   - ✅ 10MB size limit
   - ✅ Policies applied

#### **Solution 6: Test Upload Manually**
Try uploading a file directly in Supabase:
1. Go to **Storage** → `kyc-documents`
2. Click **"Upload file"**
3. Try uploading a test image
4. If this fails, there's a Supabase config issue

---

## ❌ Error: "Unauthorized" 

### **Solution:**
- Make sure you're logged in (signed in with Clerk)
- Clear cookies and sign in again
- Check Clerk is configured in `.env.local`

---

## ❌ Error: "Failed to parse form data"

### **Solution:**
1. **Check file types** - Only images and PDFs allowed
2. **Check file size** - Must be under 10MB each
3. **Try smaller files** - Test with 1-2MB files first
4. **Restart server** - Stop and start `npm run dev`

---

## ❌ Upload Works But Files Don't Show

### **Solution:**
Check Supabase storage policies:
1. Go to **Storage** → `kyc-documents` → **Policies**
2. You should have 2 policies:
   - One for SELECT (viewing)
   - One for INSERT (uploading)
3. If missing, add them (see main docs)

---

## 🧪 Quick Test

### **Test with Small File:**
1. Find a small image (< 1MB)
2. Use it as profile photo
3. Use it as ID front
4. Skip ID back (optional)
5. Try submitting

**If small files work:**
- The issue is file size
- Try compressing your images
- Use online tools to reduce size

**If small files fail:**
- Check server logs in terminal
- Check Supabase dashboard
- Verify storage bucket configuration

---

## 📊 Verify Your Setup

### **Checklist:**
- [ ] Clerk keys in `.env.local`
- [ ] Supabase keys in `.env.local`
- [ ] Storage bucket `kyc-documents` exists
- [ ] Bucket is PRIVATE
- [ ] File size limit is 10MB
- [ ] MIME types configured
- [ ] Storage policies added
- [ ] Dev server restarted after config changes

---

## 🆘 Still Having Issues?

### **Check Server Logs:**
Look in your terminal where `npm run dev` is running:
- Look for specific error messages
- Check what step is failing
- Note any warnings

### **Try This Debug Approach:**
1. **Test with NO files** - Does form submit?
2. **Add profile photo only** - Does it work?
3. **Add ID front only** - Does it work?
4. **Add both** - Does it work?

This will help identify which file is causing the issue.

---

## 💡 Common Fixes

### **1. File Too Large**
**Compress your images:**
- Use online tools: tinypng.com, compressor.io
- Or use phone camera at lower quality
- Or take screenshots instead of photos

### **2. Wrong File Type**
**Check file extensions:**
- ✅ .jpg, .jpeg, .png, .webp (photos)
- ✅ .pdf (documents)
- ❌ .heic, .bmp, .tiff (not supported)

### **3. Network Timeout**
**Try:**
- Better internet connection
- Smaller files
- Upload one at a time (if possible)

---

## 🔍 Advanced Debugging

### **Check Browser Console:**
1. Press F12
2. Go to **Console** tab
3. Try submitting form
4. Look for error messages

### **Check Network Tab:**
1. Press F12
2. Go to **Network** tab
3. Try submitting form
4. Look for failed request
5. Check request payload size

---

**Most issues are resolved by using smaller files (1-2MB) for testing!**

