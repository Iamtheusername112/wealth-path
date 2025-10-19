# 🧪 Test KYC Upload - Step by Step

## ✅ Your Setup is Complete!

Storage bucket configured with policies ✓  
Now let's test the upload!

---

## 🎯 Quick Test (5 Minutes)

### **Step 1: Prepare Test Files**

Get 3 small images for testing (each < 2MB):
- **Profile photo** - Any selfie or photo of you
- **ID front** - Photo of your ID/passport front
- **ID back** - Photo of ID/passport back (or use same as front for testing)

**💡 Tip:** Use smaller files (1-2MB) for first test to ensure it works!

---

### **Step 2: Go to Sign-Up Page**

1. Open http://localhost:3000
2. Click **"Get Started"** 
3. You'll see:
   - ✨ Animated stepper (Step 1/4)
   - Clerk sign-up form

---

### **Step 3: Create Account**

1. Enter your email
2. Create a password
3. Clerk will send verification email
4. Verify your email
5. Auto-redirected to **`/kyc`**

---

### **Step 4: Complete KYC Form**

You'll see:
- ✨ Animated stepper (Step 2/4)
- KYC verification form

**Fill in:**
1. Full Name
2. Date of Birth
3. Address
4. City, State, ZIP
5. Country

---

### **Step 5: Upload Files**

#### **Profile Photo:**
1. Click the camera upload area
2. Select your selfie/profile photo
3. You'll see:
   - ✅ Preview in circular frame
   - ✅ File size displayed (e.g., "✓ 1.5 MB")
   - ✅ Gold border around preview

#### **ID Document (Front):**
1. Click "Upload ID Document (Front)"
2. Select your ID front photo/PDF
3. You'll see:
   - ✅ File name displayed
   - ✅ File size shown (e.g., "✓ 2.3 MB")

#### **ID Document (Back) - Optional:**
1. Click "Upload ID Document (Back)"
2. Select your ID back photo/PDF
3. File size will show

---

### **Step 6: Submit**

1. Click **"Submit KYC Verification"**
2. You'll see:
   - 📤 Toast: "Uploading files..."
   - ⏳ Button shows "Submitting..."
   - ✅ Success toast after upload

---

## 🐛 If You Get the Error Again

### **Error: "Unexpected end of multipart data"**

**Try This First:**

#### **1. Use MUCH Smaller Files**
- Use files under 500KB each
- Take screenshots instead of camera photos
- Compress images online: tinypng.com

#### **2. Check File Sizes**
Look at the green file size text that appears after upload:
- **Profile photo**: Should show "✓ 1.2 MB" or similar
- **ID front**: Should show file size
- **ID back**: Should show file size

**If any file is over 5MB**, compress it first!

#### **3. Upload One at a Time Test**
Try uploading ONLY:
- Profile photo + ID front (skip ID back)
- See if that works

#### **4. Check Your Internet**
- Slow connection can cause timeout
- Try on better WiFi
- Or use mobile hotspot

---

## 📊 What File Sizes Work Best

| File Type | Recommended | Maximum |
|-----------|-------------|---------|
| **Profile Photo** | 500KB - 2MB | 10MB |
| **ID Front** | 1MB - 3MB | 10MB |
| **ID Back** | 1MB - 3MB | 10MB |
| **Total** | Under 10MB | 25MB |

---

## ✅ Signs It's Working

You'll see:
1. ✅ File sizes display in green after upload
2. ✅ Profile photo preview shows
3. ✅ Toast message: "Uploading..."
4. ✅ Success message
5. ✅ Redirect to dashboard or pending screen

---

## 🔍 Debugging Steps

### **Check Browser Console:**
1. Press **F12**
2. Go to **Console** tab
3. Try submitting
4. Look for red error messages
5. Share with me if you see errors

### **Check Network:**
1. Press **F12**
2. Go to **Network** tab
3. Try submitting
4. Look for `/api/kyc/submit` request
5. Check if it shows red (failed)
6. Click on it to see details

### **Check Terminal:**
Look in your terminal where `npm run dev` is running:
- Should show: "Form data received: ..."
- Look for error messages
- Share any errors you see

---

## 💡 Quick Fixes

### **Fix 1: Use Tiny Files**
```bash
# For testing, use files under 1MB each
# This eliminates size-related issues
```

### **Fix 2: Restart Everything**
```bash
# Stop dev server (Ctrl+C)
# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

### **Fix 3: Test Without ID Back**
```bash
# ID back is optional
# Try uploading just:
# - Profile photo
# - ID front
```

---

## 🎯 Expected Behavior

**After clicking "Submit KYC Verification":**

1. Button disables
2. Shows "Submitting..."
3. Toast: "Uploading files..."
4. Upload happens (5-30 seconds depending on file size)
5. Success toast: "KYC verification submitted successfully!"
6. Redirects to dashboard
7. Shows "KYC pending" message

---

## ✅ If It Works

You'll be redirected and see:
```
KYC Verification Required

Your KYC verification is currently under review.
You'll be able to access your dashboard once it's approved.
```

**Perfect!** That means upload worked! 🎉

---

## 🆘 If Still Failing

**Share with me:**
1. File sizes you're trying to upload
2. Error message in browser console (F12)
3. Error in terminal
4. What step it fails at

I'll help you fix it! 💪

---

**Try uploading with SMALL files first (under 2MB each) to test!** 🚀

