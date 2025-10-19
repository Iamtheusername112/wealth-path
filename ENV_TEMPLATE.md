# 📝 .env.local Template for CapitalPath

## Copy this EXACT content to your `.env.local` file:

\`\`\`env
# ============================================
# CLERK AUTHENTICATION
# Get from: https://clerk.com
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/kyc

# ============================================
# SUPABASE DATABASE & STORAGE
# Get from: https://app.supabase.com
# ============================================
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
\`\`\`

---

## 🔑 How to Get These Values

### CLERK (2 minutes):

1. Go to **https://clerk.com**
2. Sign up/login
3. Click **"Create Application"**
4. Name: "CapitalPath"
5. After creation, you'll see:
   - **Publishable key** → Copy to `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret key** (click "Show") → Copy to `CLERK_SECRET_KEY`

### SUPABASE (3 minutes):

1. Go to **https://app.supabase.com**
2. Click **"New Project"**
3. Name: "CapitalPath"
4. Wait for project to be ready
5. Go to **SQL Editor** → Run `supabase-schema.sql`
6. Go to **Storage** → Create bucket: `kyc-documents` (private)
7. Go to **Settings** → **API**:
   - **Project URL** → Copy to `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → Copy to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → Copy to `SUPABASE_SERVICE_ROLE_KEY`

---

## ✅ Example (with fake values):

\`\`\`env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuY2FwaXRhbHBhdGguY29tJA
CLERK_SECRET_KEY=sk_test_MTIzNDU2Nzg5MGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/kyc

NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTAwMDAwMDAsImV4cCI6MTg0NTAwMDAwMH0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MDAwMDAwMCwiZXhwIjoxODQ1MDAwMDAwfQ
\`\`\`

---

## ⚠️ Important Notes

1. **Never commit** `.env.local` to git (it's already in .gitignore)
2. **Keep secret keys safe** - Don't share service_role key
3. **Update for production** - Change URLs when deploying
4. **All 9 variables required** - App won't work without them

---

## 🧪 Verify Setup

After creating `.env.local`:

\`\`\`bash
# Run the app
npm run dev

# You should see:
# ✓ No environment variable errors
# ✓ App starts successfully
# ✓ Can visit http://localhost:3000
\`\`\`

---

## 🆘 Troubleshooting

**Error: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not defined"**
- ✅ Check you created `.env.local` (not `.env`)
- ✅ Check file is in root directory (next to package.json)
- ✅ Restart dev server after creating file

**Error: "Invalid publishable key"**
- ✅ Copy the key exactly from Clerk (no spaces)
- ✅ Use the key that starts with `pk_test_`

**Error: "Invalid supabaseUrl"**
- ✅ URL must start with `https://`
- ✅ Format: `https://[project-id].supabase.co`
- ✅ No trailing slash

---

**Once `.env.local` is set up, you're ready to go! 🚀**

