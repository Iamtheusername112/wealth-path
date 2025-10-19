# CapitalPath Quick Start Guide

Get CapitalPath running in **5 minutes**! ⚡

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free)
- A Kinde account (free)

---

## Step 1: Install Dependencies (1 minute)

\`\`\`bash
npm install
\`\`\`

---

## Step 2: Set Up Supabase (2 minutes)

### Create Project
1. Go to [supabase.com](https://supabase.com) → "New Project"
2. Name: **CapitalPath**
3. Create project

### Run Schema
1. Go to **SQL Editor** in Supabase
2. Click "New Query"
3. Copy entire contents of `supabase-schema.sql`
4. Click "Run"

### Create Storage
1. Go to **Storage** → "Create Bucket"
2. Name: `kyc-documents`
3. Make it **private**

### Get Credentials
1. Go to **Settings** → **API**
2. Copy:
   - Project URL
   - anon public key
   - service_role key

---

## Step 3: Set Up Kinde (1 minute)

### Create Application
1. Go to [kinde.com](https://kinde.com) → Sign up
2. Create new application (Back-end web)
3. Add URLs:
   - Callback: `http://localhost:3000/api/auth/kinde_callback`
   - Logout: `http://localhost:3000`

### Get Credentials
Copy from your Kinde app:
- Domain
- Client ID
- Client Secret

---

## Step 4: Configure Environment (30 seconds)

\`\`\`bash
# Copy example file
cp .env.local.example .env.local
\`\`\`

Edit `.env.local` with your credentials:

\`\`\`env
KINDE_CLIENT_ID=your_client_id
KINDE_CLIENT_SECRET=your_secret
KINDE_ISSUER_URL=https://your-domain.kinde.com

NEXT_PUBLIC_SUPABASE_URL=https://your-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
\`\`\`

---

## Step 5: Run the App (30 seconds)

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

---

## Step 6: Create Admin User (30 seconds)

In Supabase SQL Editor:

\`\`\`sql
INSERT INTO admins (email, role) 
VALUES ('your-email@example.com', 'super_admin');
\`\`\`

---

## 🎉 You're Done!

### Try These Features:

1. **Register** → Click "Get Started"
2. **Complete KYC** → Upload documents
3. **Approve KYC** → Login as admin, go to `/admin`
4. **Add Funds** → Go to dashboard, add money
5. **Invest** → Browse investments, make a purchase
6. **Transfer** → Send money to another user

---

## Need Help?

- **Full Setup**: See [SETUP.md](./SETUP.md)
- **Features**: See [FEATURES.md](./FEATURES.md)
- **API Docs**: See [API.md](./API.md)
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Happy Banking! 💰**

