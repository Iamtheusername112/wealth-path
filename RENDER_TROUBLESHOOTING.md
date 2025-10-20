# 🔧 Render Deployment Troubleshooting

## Error: "Application error: a client-side exception has occurred"

This error means your app deployed successfully but crashed when loading in the browser.

---

## 🎯 **IMMEDIATE FIX - Most Likely Cause**

### **Issue: Missing or Wrong Environment Variables**

90% of the time, this is because Clerk can't initialize properly.

### **✅ SOLUTION:**

#### **Step 1: Verify ALL Environment Variables in Render**

1. Go to Render Dashboard: https://dashboard.render.com
2. Click your service (wealth-path)
3. Click **"Environment"** tab (left sidebar)
4. You MUST have these **6 variables** EXACTLY:

```bash
NODE_ENV
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

#### **Step 2: Check for Common Mistakes**

❌ **Wrong:**
- `NEXT_PUBLIC_CLERK_PUBLISABLE_KEY` (typo: missing H)
- `CLERK_PUBLISHABLE_KEY` (missing NEXT_PUBLIC_)
- Extra spaces before/after values
- Old or test keys from wrong environment

✅ **Correct:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (with H)
- Starts with `pk_test_` or `pk_live_`
- No spaces before or after

#### **Step 3: Get Fresh Keys from Clerk**

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Select your application
3. Click **"API Keys"** in sidebar
4. **IMPORTANT**: Make sure you're in the right environment:
   - Look for "Development" vs "Production" toggle at top
   - Use **Production keys** for Render!

5. Copy the keys:
   ```bash
   Publishable key: pk_live_xxxxx (or pk_test_ if testing)
   Secret key: sk_live_xxxxx (or sk_test_ if testing)
   ```

#### **Step 4: Update Render Environment Variables**

1. In Render → Environment tab
2. **Edit** (not delete!) each Clerk variable:
   - Click the variable name
   - Click "Edit"
   - Paste the NEW key
   - Click "Save Changes"

3. Do this for:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

#### **Step 5: Add Render URL to Clerk Allowed Origins**

This is **CRITICAL** and often forgotten:

1. In Clerk Dashboard → Your App
2. Go to **"Domains"** (or "API Keys" → "Settings")
3. Find **"Allowed Origins"** or **"Frontend API"** section
4. Click **"Add domain"** or **"Edit"**
5. Add your Render URL:
   ```
   https://wealth-path.onrender.com
   ```
6. **Save changes**

#### **Step 6: Clear Cache and Redeploy**

1. In Render Dashboard → Your service
2. Click **"Manual Deploy"** button (top right, blue)
3. Select **"Clear build cache & deploy"**
4. Wait 3-5 minutes for redeploy
5. Try accessing your app again!

---

## 🔍 **DIAGNOSTIC STEPS**

### **Check 1: Browser Console**

1. Open your app URL: https://wealth-path.onrender.com
2. **Right-click** → **"Inspect"** (or F12)
3. Click **"Console"** tab
4. Look for error messages

**Common Errors & Fixes:**

| Error Message | Cause | Fix |
|---------------|-------|-----|
| `Clerk: Missing publishableKey` | Env var not set | Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| `Clerk: Invalid publishableKey` | Wrong key or typo | Get fresh key from Clerk dashboard |
| `CORS error` | Domain not allowed | Add Render URL to Clerk allowed origins |
| `Failed to fetch` | Backend issue | Check Render logs |
| `NEXT_PUBLIC_SUPABASE_URL is not defined` | Missing env var | Add Supabase URL |

### **Check 2: Render Logs**

1. Render Dashboard → Your service
2. Click **"Logs"** tab
3. Scroll to most recent
4. Look for **RED** error messages

**Common Log Errors:**

```bash
# Missing env var
Error: CLERK_SECRET_KEY is not defined
→ Fix: Add CLERK_SECRET_KEY to Environment

# Invalid Clerk key
ClerkError: Invalid secret key
→ Fix: Get fresh key from Clerk dashboard

# Supabase error
Error: Invalid Supabase URL
→ Fix: Check NEXT_PUBLIC_SUPABASE_URL

# Build succeeded but runtime error
Server Error: Cannot read property...
→ Fix: Usually env var issue, check all 6
```

### **Check 3: Environment Variables Format**

Make sure your env vars look exactly like this:

```bash
# ✅ CORRECT FORMAT:
NODE_ENV=production

NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ1NjM4OTAsImV4cCI6MjAxMDEzOTg5MH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NDU2Mzg5MCwiZXhwIjoyMDEwMTM5ODkwfQ.yyyyyyyyyyyyyyyyyyyyyyyyyyyy

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZS5jb20k

CLERK_SECRET_KEY=sk_test_1234567890abcdefghijklmnopqrstuvwxyz
```

```bash
# ❌ WRONG FORMAT:
NODE_ENV = production  (extra spaces)
CLERK_PUBLISHABLE_KEY=pk_test_...  (missing NEXT_PUBLIC_)
NEXT_PUBLIC_CLERK_PUBLISABLE_KEY=...  (typo: PUBLISABLE)
```

---

## 🎯 **STEP-BY-STEP FIX PROCEDURE**

### **If you see "Application error" on the page:**

1. **Open browser console** (F12 → Console tab)
   - Screenshot the error
   - Look for what's "undefined" or "missing"

2. **Check Render logs** (Render Dashboard → Logs)
   - Look for ERROR messages
   - Screenshot relevant errors

3. **Verify all 6 environment variables exist**
   - Render → Environment tab
   - Count them: should be exactly 6

4. **Get fresh Clerk keys**
   - Clerk Dashboard → API Keys
   - Make sure you're in right environment (Dev vs Prod)
   - Copy publishable key (pk_xxx)
   - Copy secret key (sk_xxx)

5. **Update Clerk variables in Render**
   - Edit NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - Edit CLERK_SECRET_KEY
   - Save changes

6. **Add Render URL to Clerk**
   - Clerk → Domains
   - Add: https://wealth-path.onrender.com
   - Save

7. **Redeploy with cache clear**
   - Render → Manual Deploy
   - Clear build cache & deploy
   - Wait 3-5 minutes

8. **Test again**
   - Visit https://wealth-path.onrender.com
   - Check if error is gone
   - Check browser console

---

## 🆘 **Still Not Working?**

### **Option 1: Check Specific Errors**

**Error:** `Clerk: Missing publishableKey`
**Fix:**
```bash
# In Render Environment tab, verify:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
# Note: Must start with NEXT_PUBLIC_
# Must start with pk_test_ or pk_live_
```

**Error:** `CORS policy: No 'Access-Control-Allow-Origin'`
**Fix:**
1. Clerk Dashboard → Domains
2. Add your Render URL
3. Also add: `http://localhost:3000` (for testing)

**Error:** `Failed to fetch`
**Fix:**
1. Check Render logs for backend errors
2. Make sure service is "Live" (green status)
3. Check Supabase keys are correct

### **Option 2: Test Locally**

Test if it's an env var issue:

1. **Create `.env.local` in your project:**
```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

2. **Run locally:**
```bash
npm run build
npm start
```

3. **Open:** http://localhost:3000

If it works locally but not on Render:
→ It's definitely an env var issue on Render

### **Option 3: Simplify to Debug**

Temporarily remove middleware to isolate issue:

1. **Rename middleware.js:**
```bash
mv middleware.js middleware.js.backup
```

2. **Commit and push:**
```bash
git add .
git commit -m "test: temporarily disable middleware"
git push origin main
```

3. **Wait for Render auto-deploy**

4. **Test app**

If it works now:
→ Middleware was the issue (likely Supabase connection in middleware)

If still broken:
→ It's definitely Clerk or frontend env vars

5. **Restore middleware:**
```bash
mv middleware.js.backup middleware.js
git add .
git commit -m "restore middleware"
git push origin main
```

---

## 📞 **Get Help**

If none of the above works:

1. **Check these and share:**
   - Screenshot of browser console error
   - Screenshot of Render logs
   - List of env variables in Render (Environment tab)
   - Your Render URL

2. **Contact Support:**
   - Render Community: https://community.render.com
   - Clerk Discord: https://clerk.com/discord
   - Render Email: support@render.com

---

## ✅ **Quick Checklist**

Go through this list:

- [ ] All 6 environment variables exist in Render
- [ ] No typos in variable names (especially CLERK_PUBLISHABLE)
- [ ] Values copied directly from Clerk/Supabase dashboards
- [ ] Using PRODUCTION keys (not development)
- [ ] Render URL added to Clerk allowed origins
- [ ] Deployed with "Clear build cache & deploy"
- [ ] Checked browser console for specific error
- [ ] Checked Render logs for server errors
- [ ] Service status shows "Live" (green)

---

## 🎯 **Most Common Fix**

**99% of the time, this error is fixed by:**

1. Getting fresh Clerk keys from dashboard
2. Updating them in Render → Environment
3. Adding Render URL to Clerk → Domains
4. Manual Deploy → Clear cache & deploy

**Try this first!** ⚡

