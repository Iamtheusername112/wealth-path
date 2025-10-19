# 🚀 Just Do This to Get CapitalPath Running

## 3 Simple Steps:

---

## 1️⃣ Get Clerk Keys (2 min)

Go to: **https://clerk.com**
- Sign up (free)
- Create app: "CapitalPath"
- Copy these 2 keys:
  ```
  pk_test_xxxxx... (Publishable key)
  sk_test_xxxxx... (Secret key)
  ```

---

## 2️⃣ Get Supabase Keys (3 min)

Go to: **https://app.supabase.com**
- Create project: "CapitalPath"
- Go to **SQL Editor** → Run `supabase-schema.sql` file
- Go to **Storage** → Create bucket: `kyc-documents` (private)
- Go to **Settings** → **API** → Copy these 3 keys:
  ```
  https://xxxxx.supabase.co (URL)
  eyJhbGci... (anon key)
  eyJhbGci... (service_role key)
  ```

---

## 3️⃣ Create `.env.local` File

Create file named `.env.local` in root folder:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=paste_pk_test_key_here
CLERK_SECRET_KEY=paste_sk_test_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/kyc

NEXT_PUBLIC_SUPABASE_URL=paste_https_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_service_key_here
```

**Save it!**

---

## ▶️ Run the App

```bash
npm run dev
```

**Visit:** http://localhost:3000

---

## ✅ That's It!

You now have:
- ✅ Banking platform
- ✅ 5 investment categories
- ✅ KYC verification
- ✅ Profile photo upload
- ✅ Beautiful animations
- ✅ Admin dashboard

**Total time: 5-10 minutes**

---

**Need more details?** See:
- `WHAT_YOU_NEED.md` - Detailed setup
- `START_HERE_CLERK.md` - Full guide
- `README.md` - Complete docs

