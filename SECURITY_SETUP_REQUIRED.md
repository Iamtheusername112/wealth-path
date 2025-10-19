# 🔐 SECURITY SETUP - IMMEDIATE ACTION REQUIRED

## ⚠️ CRITICAL: Admin Credentials Removed from Code

The hardcoded admin credentials have been **removed** from the source code for security.

### 📝 What Changed

**Before (INSECURE):**
```javascript
const ADMIN_EMAIL = 'pathinfowealth@gmail.com'
const ADMIN_PASSWORD = 'wealth@_12113831'
```

**After (SECURE):**
```javascript
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
```

---

## 🚀 SETUP REQUIRED

Add these two environment variables to your `.env.local` file:

```env
# Admin Login Credentials (KEEP SECRET!)
ADMIN_EMAIL=pathinfowealth@gmail.com
ADMIN_PASSWORD=wealth@_12113831
```

---

## 📋 Complete .env.local Template

Create a file called `.env.local` in your project root with ALL these variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/kyc

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Credentials (KEEP SECRET!)
ADMIN_EMAIL=pathinfowealth@gmail.com
ADMIN_PASSWORD=wealth@_12113831
```

---

## ✅ Security Checklist

- [x] ~~Hardcoded credentials removed from source code~~
- [ ] `.env.local` file created with admin credentials
- [ ] `.env` files added to `.gitignore` (already done ✓)
- [ ] Changed admin password from default
- [ ] Never commit `.env.local` to git
- [ ] Use different credentials for production

---

## 🔒 IMPORTANT SECURITY NOTES

### 1. Change the Default Password
The current password `wealth@_12113831` should be changed to something more secure:
```env
ADMIN_PASSWORD=YourNewSecurePasswordHere123!@#
```

### 2. Never Commit Secrets
- `.env.local` is already in `.gitignore` ✓
- Never push secrets to GitHub
- Use different credentials for production

### 3. Production Deployment
When deploying to production (Vercel, etc.):
- Add environment variables in the hosting platform's dashboard
- Use strong, unique passwords
- Consider using a password manager

---

## 🚨 If Credentials Were Already Pushed to Git

If you already pushed the hardcoded credentials to GitHub:

1. **Change the password immediately**
2. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch app/api/admin/login/route.js" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** (⚠️ dangerous):
   ```bash
   git push origin --force --all
   ```

---

## 📖 How to Use

1. Create `.env.local` in project root
2. Copy the template above
3. Fill in your actual values
4. Restart your dev server: `npm run dev`
5. Admin login will now work at `/admin-login`

---

## ✓ Done!

Once you've added the environment variables, your admin login will work securely without exposing credentials in your code!

