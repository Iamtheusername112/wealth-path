# 🎯 What You Need to Get CapitalPath Running

## Simple 3-Step Setup

---

## Step 1️⃣: Get Clerk Keys (2 minutes)

### Go to: **https://clerk.com**

1. **Sign up** (it's free!)
2. Click **"Create Application"**
3. Name it: **"CapitalPath"**
4. You'll immediately see your keys:

```
📋 Copy these 2 values:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_xxxxx...
CLERK_SECRET_KEY = sk_test_xxxxx...
```

**That's it for Clerk!** ✅ No other configuration needed!

---

## Step 2️⃣: Get Supabase Keys (3 minutes)

### Go to: **https://app.supabase.com**

1. **Click "New Project"**
   - Name: **CapitalPath**
   - Password: (choose a strong one)
   - Region: (pick closest to you)

2. **Wait ~2 minutes** for project to be ready

3. **Run Database Schema**:
   - Go to **SQL Editor**
   - Click "New Query"
   - Copy entire `supabase-schema.sql` file
   - Paste and click **"Run"**

4. **Create Storage Bucket**:
   - Go to **Storage**
   - Click **"Create bucket"**
   - Name: `kyc-documents`
   - Make it **private** (toggle OFF public)
   - Click **"Create"**

5. **Get Your Keys**:
   - Go to **Settings** → **API**
   - You'll see:

```
📋 Copy these 3 values:

NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGci... (keep secret!)
```

---

## Step 3️⃣: Create .env.local File

### In your project root, create a file named: `.env.local`

Paste this EXACT content and fill in your keys:

\`\`\`env
# CLERK (2 keys from clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=paste_your_clerk_publishable_key_here
CLERK_SECRET_KEY=paste_your_clerk_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/kyc

# SUPABASE (3 keys from app.supabase.com)
NEXT_PUBLIC_SUPABASE_URL=paste_your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here
\`\`\`

**Save the file!**

---

## ✅ That's It!

Now run:

\`\`\`bash
npm run dev
\`\`\`

Visit: **http://localhost:3000**

---

## 🎨 What You'll Experience

### **Beautiful Sign-Up Flow:**
1. Click "Get Started"
2. See animated progress stepper (Step 1/4)
3. Clerk's beautiful sign-up form
4. Email verification (automatic)

### **KYC Verification:**
1. Auto-redirected to KYC page
2. See progress stepper (Step 2/4)
3. Fill personal info
4. **Upload profile photo** 📸 (NEW!)
5. Upload ID documents (max 10MB each)
6. Submit for review

### **Admin Approval:**
1. Admin reviews in `/admin` panel
2. Views documents and profile photo
3. Approves or rejects

### **Dashboard Access:**
1. User gets approved
2. Sees profile photo on dashboard
3. Progress stepper shows Step 3/4
4. Can add funds and invest

### **Celebration:**
1. Complete first investment
2. Confetti animation! 🎉
3. Profile photo displayed
4. Ready to grow wealth!

---

## 📊 Quick Reference

| Service | What For | # of Keys | Time |
|---------|----------|-----------|------|
| **Clerk** | Authentication | 2 keys | 2 min |
| **Supabase** | Database & Storage | 3 keys | 3 min |
| **Total** | Everything | 5 keys | **5 min** |

---

## 🆘 Need Help?

### Clerk Issues:
- **Docs**: https://clerk.com/docs
- **Support**: https://clerk.com/support

### Supabase Issues:
- **Docs**: https://supabase.com/docs
- **Discord**: https://discord.supabase.com

### CapitalPath Issues:
- Check **CLERK_COMPLETE.md** for detailed guide
- Check **ENV_TEMPLATE.md** for env var examples
- Check **README.md** for full documentation

---

## 🎯 Just 3 Things to Remember:

1. ✅ **Clerk** = Authentication (2 keys)
2. ✅ **Supabase** = Database (3 keys)
3. ✅ **.env.local** = Put keys here

**That's all you need!** 🚀

---

**Total Setup Time: 5-10 minutes**  
**Difficulty: Easy**  
**Result: Production-ready banking app! 💰**

