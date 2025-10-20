# 🚂 Deploy CapitalPath to Railway - Complete Guide

Railway is faster and more reliable than Vercel for Next.js apps. Let's get you deployed!

---

## 🎯 **Method 1: Deploy via Railway Dashboard (EASIEST)**

### Step 1: Create Railway Account

1. Go to **https://railway.app/**
2. Click **"Start a New Project"**
3. Sign in with GitHub

### Step 2: Deploy from GitHub

1. Click **"Deploy from GitHub repo"**
2. Select your repository: **`Iamtheusername112/wealth-path`**
3. Railway will auto-detect Next.js and configure everything

### Step 3: Add Environment Variables

In Railway Dashboard:
1. Click your project
2. Go to **"Variables"** tab
3. Add these variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Node
NODE_ENV=production
PORT=3000
```

### Step 4: Deploy!

Railway will automatically:
- ✅ Install dependencies
- ✅ Build your app
- ✅ Deploy to production
- ✅ Give you a live URL: `https://your-app.up.railway.app`

**Done in ~3 minutes!** ⚡

---

## 🎯 **Method 2: Deploy via Railway CLI (ADVANCED)**

### Step 1: Install Railway CLI

```bash
# Windows (PowerShell - Run as Admin)
iwr https://railway.app/install.ps1 | iex

# Or use npm
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

This opens your browser to authenticate.

### Step 3: Initialize Project

```bash
# In your project directory
railway init
```

Select:
- "Create a new project"
- Name it "capitalpath" or similar

### Step 4: Add Environment Variables

```bash
# Add variables one by one
railway variables set NEXT_PUBLIC_SUPABASE_URL=your-url
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-key
railway variables set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-key
railway variables set CLERK_SECRET_KEY=your-key
railway variables set NODE_ENV=production
```

Or use environment file:

```bash
# Create .env.production
railway variables set --from .env.production
```

### Step 5: Deploy!

```bash
railway up
```

Railway will:
- Build your app
- Deploy to production
- Give you a live URL

---

## 📦 **What Railway Does Automatically**

Railway detects your Next.js app and:

1. ✅ Uses Node.js 20
2. ✅ Runs `npm ci` (clean install)
3. ✅ Runs `npm run build`
4. ✅ Starts with `npm start`
5. ✅ Provides HTTPS automatically
6. ✅ Sets up custom domain (optional)
7. ✅ Auto-deploys on git push

**No configuration needed!**

---

## 🎨 **Railway vs Vercel Comparison**

| Feature | Railway | Vercel |
|---------|---------|--------|
| **Build Time** | ⚡ 2-3 mins | 🐌 5+ mins |
| **Deployment** | ✅ Always works | ❌ Infrastructure issues |
| **Pricing** | 💰 $5/month | 💰 $20/month (Pro) |
| **Free Tier** | ✅ $5 credit/month | ✅ Hobby (limited) |
| **Database** | ✅ Built-in Postgres | ❌ External only |
| **Middleware** | ✅ No size limits | ❌ 120kb limit |
| **Support** | ✅ Fast & helpful | 🐌 Slow (free tier) |

**Railway is better for full-stack apps!**

---

## 🔧 **Custom Domain Setup**

After deployment:

1. Go to Railway Dashboard
2. Click your project
3. Go to **"Settings"** → **"Domains"**
4. Click **"Add Domain"**
5. Enter your domain: `capitalpath.com`
6. Add DNS records (Railway shows you what to add)

Railway provides:
- ✅ Free SSL certificate
- ✅ Automatic HTTPS
- ✅ CDN edge caching

---

## 🚀 **Automatic Deployments**

Railway auto-deploys when you push to GitHub:

```bash
git add .
git commit -m "update feature"
git push origin main
```

Railway will:
1. Detect the push
2. Build automatically
3. Deploy to production
4. Keep previous version running during deploy (zero downtime!)

---

## 📊 **Railway Dashboard Features**

Access at: https://railway.app/dashboard

- 📈 **Metrics**: CPU, memory, network usage
- 📝 **Logs**: Real-time application logs
- 🔄 **Deployments**: History, rollbacks
- 🗄️ **Database**: Built-in PostgreSQL (if needed)
- ⚙️ **Settings**: Environment, domains, team
- 💳 **Billing**: Usage tracking, invoices

---

## 💰 **Railway Pricing**

### Free Tier (Hobby)
- $5 credit per month
- Good for ~500 hours
- Perfect for testing

### Pro Plan ($20/month)
- Unlimited deployments
- Better performance
- Priority support
- Team features

**For CapitalPath, Hobby tier is enough to start!**

---

## 🔐 **Security Best Practices**

Railway is production-ready:

1. ✅ All traffic is HTTPS
2. ✅ Environment variables encrypted
3. ✅ Private networking available
4. ✅ DDoS protection included
5. ✅ Regular backups
6. ✅ SOC 2 compliant

---

## 🆘 **Troubleshooting**

### Build Fails?

Check logs:
```bash
railway logs
```

Or in dashboard: Deployments → View Logs

### Environment Variables Not Working?

List all variables:
```bash
railway variables
```

Update a variable:
```bash
railway variables set KEY=value
```

### Port Issues?

Railway automatically assigns `PORT` environment variable.
Your app should use: `process.env.PORT || 3000`

### Database Connection?

If using Supabase, make sure `SUPABASE_SERVICE_ROLE_KEY` is set.

---

## 🎯 **Quick Start Checklist**

- [ ] Create Railway account (https://railway.app)
- [ ] Connect GitHub repository
- [ ] Add all environment variables
- [ ] Deploy (automatic!)
- [ ] Visit your live URL
- [ ] Test all features
- [ ] Set up custom domain (optional)
- [ ] Enable auto-deployments

---

## 📞 **Railway Support**

- **Discord**: https://discord.gg/railway (very active!)
- **Email**: team@railway.app
- **Docs**: https://docs.railway.app
- **Status**: https://status.railway.app

Railway's support is **amazing** - they respond in minutes on Discord!

---

## 🎉 **Expected Timeline**

- Account setup: **1 minute**
- Connect GitHub: **30 seconds**
- Add env variables: **2 minutes**
- First deployment: **2-3 minutes**
- **Total: ~6 minutes** ⚡

---

## 🔥 **Why Railway Wins**

1. **Just Works**: No weird infrastructure errors
2. **Fast**: Builds in 2-3 minutes vs 5+ on Vercel
3. **Cheaper**: $5/month vs $20/month
4. **Better**: No middleware size limits
5. **Support**: Active Discord community
6. **Features**: Built-in database, metrics, logs

---

## 🚂 **Ready to Deploy?**

### Option A: Dashboard (Easiest)
1. Go to https://railway.app
2. "Start a New Project"
3. "Deploy from GitHub"
4. Add environment variables
5. Done! ✨

### Option B: CLI (Faster)
```bash
npm install -g @railway/cli
railway login
railway init
railway variables set <KEY>=<VALUE>
railway up
```

---

## 🎊 **After Deployment**

Your app will be live at:
```
https://capitalpath-production.up.railway.app
```

Or your custom domain:
```
https://capitalpath.com
```

**Railway handles everything else!** 🚀

---

## 📝 **Next Steps**

1. ✅ Deploy to Railway (6 minutes)
2. ✅ Test all features work
3. ✅ Set up custom domain
4. ✅ Enable monitoring
5. ✅ Configure auto-deployments
6. ✅ Celebrate! 🎉

---

**Railway is the best choice for your banking app!** 

Fast, reliable, and actually works! 🚂⚡

