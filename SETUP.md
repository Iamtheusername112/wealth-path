# CapitalPath Setup Guide

Complete step-by-step guide to set up CapitalPath from scratch.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A Supabase account (free tier works)
- A Kinde account (free tier works)

## Step 1: Project Setup

\`\`\`bash
# Navigate to project directory
cd capital-path

# Install dependencies
npm install
\`\`\`

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: CapitalPath
   - Database Password: (save this securely)
   - Region: Choose closest to your users

### 2.2 Run Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste and click "Run"

### 2.3 Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click "Create Bucket"
3. Name: `kyc-documents`
4. Toggle "Public bucket" to OFF (private)
5. Click "Create"

### 2.4 Configure Storage Policies

In the Storage bucket settings, add these policies:

**Policy for authenticated uploads:**
\`\`\`sql
CREATE POLICY "Users can upload own KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
\`\`\`

**Policy for authenticated reads:**
\`\`\`sql
CREATE POLICY "Users can read own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
\`\`\`

### 2.5 Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (use for NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (use for NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role** key (use for SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!

## Step 3: Kinde Authentication Setup

### 3.1 Create Kinde Account

1. Go to [kinde.com](https://kinde.com)
2. Sign up for a free account
3. Complete onboarding

### 3.2 Create Application

1. In Kinde dashboard, click "Add Application"
2. Choose "Back-end web"
3. Name: CapitalPath
4. Click "Save"

### 3.3 Configure Application URLs

In your Kinde application settings:

**Allowed callback URLs:**
\`\`\`
http://localhost:3000/api/auth/kinde_callback
\`\`\`

**Allowed logout redirect URLs:**
\`\`\`
http://localhost:3000
\`\`\`

### 3.4 Get Kinde Credentials

In your Kinde application, go to **Details** and copy:
- **Domain** (use for KINDE_ISSUER_URL as https://YOUR-DOMAIN.kinde.com)
- **Client ID** (use for KINDE_CLIENT_ID)
- **Client Secret** (use for KINDE_CLIENT_SECRET)

## Step 4: Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Kinde Authentication
KINDE_CLIENT_ID=your_client_id_here
KINDE_CLIENT_SECRET=your_client_secret_here
KINDE_ISSUER_URL=https://your-domain.kinde.com
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
\`\`\`

**Important**: 
- Replace all placeholder values with your actual credentials
- Never commit `.env.local` to version control
- Keep your service role key secret

## Step 5: Create Admin User

After setting up the database, create an admin user:

1. Go to Supabase **SQL Editor**
2. Run this query (replace with your email):

\`\`\`sql
INSERT INTO admins (email, role) 
VALUES ('your-email@example.com', 'super_admin');
\`\`\`

## Step 6: Run the Application

\`\`\`bash
npm run dev
\`\`\`

The app should now be running at [http://localhost:3000](http://localhost:3000)

## Step 7: Test the Application

### 7.1 Create a Test User

1. Navigate to http://localhost:3000
2. Click "Get Started"
3. Register with a test email
4. Complete the registration

### 7.2 Complete KYC

1. After registration, you'll be redirected to KYC page
2. Fill in personal information
3. Upload a test document (any image/PDF)
4. Submit

### 7.3 Approve KYC (as Admin)

1. Log out and login with your admin email
2. Navigate to http://localhost:3000/admin
3. Go to "KYC Verification" tab
4. Approve the pending KYC request

### 7.4 Test Banking Features

1. Log back in as your test user
2. Navigate to Dashboard
3. Try:
   - Adding funds
   - Viewing transactions
   - Making a withdrawal

### 7.5 Test Investments

1. Go to Investments page
2. Browse different categories
3. Try investing in an asset
4. Check your portfolio

## Step 8: Production Deployment

### 8.1 Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add all environment variables (update URLs for production)
6. Deploy

### 8.2 Update Kinde URLs

In Kinde dashboard, add production URLs:

**Allowed callback URLs:**
\`\`\`
https://your-domain.vercel.app/api/auth/kinde_callback
\`\`\`

**Allowed logout redirect URLs:**
\`\`\`
https://your-domain.vercel.app
\`\`\`

### 8.3 Update Environment Variables for Production

In Vercel environment variables:
\`\`\`env
KINDE_SITE_URL=https://your-domain.vercel.app
KINDE_POST_LOGOUT_REDIRECT_URL=https://your-domain.vercel.app
KINDE_POST_LOGIN_REDIRECT_URL=https://your-domain.vercel.app/dashboard
\`\`\`

## Troubleshooting

### Kinde Authentication Issues

**Problem**: "Redirect URL not allowed"
- **Solution**: Ensure callback URLs are correctly set in Kinde dashboard

**Problem**: "Invalid client"
- **Solution**: Double-check KINDE_CLIENT_ID and KINDE_CLIENT_SECRET

### Supabase Issues

**Problem**: "relation does not exist"
- **Solution**: Run the schema SQL file again

**Problem**: "permission denied"
- **Solution**: Check Row-Level Security policies are properly set

**Problem**: Cannot upload KYC documents
- **Solution**: Verify storage bucket exists and policies are configured

### General Issues

**Problem**: "Module not found"
- **Solution**: Run `npm install` again

**Problem**: Changes not reflecting
- **Solution**: Clear `.next` folder and restart dev server

## Next Steps

- Customize the UI colors in `tailwind.config.js`
- Add more investment opportunities in `components/investments/investment-opportunities.jsx`
- Integrate real market data APIs
- Add email notifications
- Implement 2FA

## Support

If you encounter issues:
1. Check this guide again
2. Review error messages in console
3. Check Supabase and Kinde dashboard logs
4. Ensure all environment variables are set correctly

---

**You're all set! 🎉**

