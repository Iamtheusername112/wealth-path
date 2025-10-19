# CapitalPath Deployment Guide

Complete guide for deploying CapitalPath to production.

## Pre-Deployment Checklist

### 1. Code Review
- [ ] All features tested locally
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Loading states for all async operations
- [ ] Forms have validation
- [ ] Responsive design verified on multiple devices

### 2. Environment Setup
- [ ] Supabase production database created
- [ ] Database schema applied
- [ ] Storage bucket configured
- [ ] RLS policies enabled
- [ ] Kinde production app created
- [ ] Production URLs configured

### 3. Security
- [ ] All secrets in environment variables
- [ ] No hardcoded credentials
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Rate limiting considered
- [ ] Admin users configured

---

## Supabase Production Setup

### 1. Create Production Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. **Important Settings**:
   - Name: CapitalPath Production
   - Strong database password
   - Region: Choose closest to your users
   - Pricing tier: Choose based on needs

### 2. Apply Database Schema

\`\`\`bash
# In Supabase SQL Editor, run:
supabase-schema.sql
\`\`\`

### 3. Configure Storage

1. Create `kyc-documents` bucket (private)
2. Apply storage policies:

\`\`\`sql
-- Upload policy
CREATE POLICY "Users can upload own KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Read policy
CREATE POLICY "Users can read own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
\`\`\`

### 4. Configure RLS

Ensure all RLS policies from `supabase-schema.sql` are applied.

### 5. Get Production Credentials

- Project URL: `https://[PROJECT-ID].supabase.co`
- Anon Key: From Settings → API
- Service Role Key: From Settings → API (keep secret!)

---

## Kinde Production Setup

### 1. Create Production Application

1. Go to [kinde.com](https://kinde.com)
2. Create new application (or use existing)
3. Choose "Back-end web"

### 2. Configure URLs

**Production URLs** (replace with your domain):

**Allowed callback URLs:**
\`\`\`
https://your-domain.com/api/auth/kinde_callback
https://your-domain.vercel.app/api/auth/kinde_callback
\`\`\`

**Allowed logout redirect URLs:**
\`\`\`
https://your-domain.com
https://your-domain.vercel.app
\`\`\`

### 3. Get Production Credentials

- Domain: Your Kinde subdomain
- Client ID
- Client Secret

---

## Vercel Deployment

### Step 1: Prepare Repository

\`\`\`bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - CapitalPath v1.0"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/capitalpath.git
git branch -M main
git push -u origin main
\`\`\`

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next

### Step 3: Configure Environment Variables

Add these in Vercel project settings → Environment Variables:

\`\`\`env
# Kinde Auth
KINDE_CLIENT_ID=your_production_client_id
KINDE_CLIENT_SECRET=your_production_client_secret
KINDE_ISSUER_URL=https://your-subdomain.kinde.com
KINDE_SITE_URL=https://your-domain.vercel.app
KINDE_POST_LOGOUT_REDIRECT_URL=https://your-domain.vercel.app
KINDE_POST_LOGIN_REDIRECT_URL=https://your-domain.vercel.app/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
\`\`\`

**Important**: Set these for all environments (Production, Preview, Development)

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit your deployment URL

### Step 5: Verify Deployment

Test these features:
- [ ] Landing page loads
- [ ] Registration works
- [ ] Login works
- [ ] KYC submission works
- [ ] Dashboard loads
- [ ] Transactions work
- [ ] Investments work
- [ ] Notifications work
- [ ] Settings work
- [ ] Admin panel works (if admin)
- [ ] Theme toggle works
- [ ] Mobile responsive

---

## Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Step 2: Update Kinde URLs

Add your custom domain to Kinde:
\`\`\`
https://your-custom-domain.com/api/auth/kinde_callback
https://your-custom-domain.com
\`\`\`

### Step 3: Update Environment Variables

Update these in Vercel:
\`\`\`env
KINDE_SITE_URL=https://your-custom-domain.com
KINDE_POST_LOGOUT_REDIRECT_URL=https://your-custom-domain.com
KINDE_POST_LOGIN_REDIRECT_URL=https://your-custom-domain.com/dashboard
\`\`\`

---

## Post-Deployment

### 1. Create Admin User

In Supabase SQL Editor:
\`\`\`sql
INSERT INTO admins (email, role) 
VALUES ('admin@your-domain.com', 'super_admin');
\`\`\`

### 2. Test Critical Paths

1. **User Journey**:
   - Register new account
   - Complete KYC
   - Admin approves KYC
   - Make deposit
   - Create investment
   - Receive notifications

2. **Admin Journey**:
   - Login as admin
   - Access admin panel
   - Review KYC submissions
   - Approve/reject KYC
   - View transactions
   - Monitor platform

### 3. Monitor Performance

- Set up Vercel Analytics
- Monitor error logs
- Check response times
- Review database performance

### 4. Set Up Monitoring

**Recommended Tools**:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Vercel Analytics** for performance
- **Supabase Dashboard** for database metrics

---

## Environment-Specific Configuration

### Development
\`\`\`env
KINDE_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 (if using local Supabase)
\`\`\`

### Staging/Preview
\`\`\`env
KINDE_SITE_URL=https://preview-branch.vercel.app
\`\`\`

### Production
\`\`\`env
KINDE_SITE_URL=https://your-domain.com
\`\`\`

---

## Rollback Strategy

### If deployment fails:

1. **Vercel**: Click "Rollback to [previous deployment]"
2. **Database**: Use Supabase point-in-time recovery
3. **Code**: Revert git commit and redeploy

### If issues discovered after deployment:

1. Create hotfix branch
2. Fix issue
3. Deploy immediately
4. Monitor closely

---

## Performance Optimization

### 1. Enable Vercel Features

- [ ] Edge Functions (if applicable)
- [ ] Image Optimization
- [ ] Analytics
- [ ] Speed Insights

### 2. Database Optimization

- [ ] Add indexes on frequently queried columns
- [ ] Enable connection pooling
- [ ] Set up read replicas (if needed)

### 3. Caching Strategy

- [ ] Configure CDN caching
- [ ] Implement API response caching
- [ ] Use SWR or React Query for client-side caching

---

## Security Hardening

### 1. Production Environment

- [ ] Remove all console.logs
- [ ] Disable source maps in production
- [ ] Set secure headers
- [ ] Implement rate limiting
- [ ] Enable CSRF protection

### 2. Supabase Security

- [ ] Verify RLS policies
- [ ] Rotate API keys regularly
- [ ] Review access logs
- [ ] Enable 2FA for admin access

### 3. Kinde Security

- [ ] Enable MFA for admins
- [ ] Configure session timeouts
- [ ] Review security logs
- [ ] Set up webhook verification

---

## Continuous Deployment

### Set Up CI/CD

1. **Automatic Deployments**:
   - Production: Deploy on push to `main`
   - Preview: Deploy on pull requests

2. **Deploy Hooks**:
   - Add deploy hooks for automated deployments
   - Configure webhooks for external triggers

3. **Testing**:
   - Add pre-deployment tests
   - Implement E2E testing with Playwright/Cypress

---

## Monitoring & Maintenance

### Daily
- [ ] Check error logs
- [ ] Review pending KYC submissions
- [ ] Monitor transaction volume

### Weekly
- [ ] Review performance metrics
- [ ] Check database usage
- [ ] Update dependencies (if needed)

### Monthly
- [ ] Security audit
- [ ] Performance review
- [ ] User feedback analysis
- [ ] Feature planning

---

## Troubleshooting Production Issues

### Common Issues

**Issue**: 500 Internal Server Error
- Check Vercel function logs
- Verify environment variables
- Check Supabase connection

**Issue**: Authentication fails
- Verify Kinde URLs are correct
- Check callback URLs
- Ensure environment variables are set

**Issue**: Database connection timeout
- Check Supabase service status
- Verify connection pooling
- Review query performance

**Issue**: File upload fails
- Verify storage bucket permissions
- Check RLS policies
- Ensure file size limits

---

## Backup Strategy

### Database Backups

Supabase provides automatic backups:
- **Pro plan**: Daily backups, 7 days retention
- **Team plan**: Daily backups, 14 days retention

**Manual Backup**:
\`\`\`bash
# Export specific tables
pg_dump -h db.your-project.supabase.co -U postgres -d postgres -t users -t transactions > backup.sql
\`\`\`

### Storage Backups

Regular exports of KYC documents:
1. Use Supabase CLI to download storage
2. Store in secure, encrypted backup location
3. Implement retention policy

---

## Cost Optimization

### Supabase
- Monitor database size
- Optimize queries
- Remove unused indexes
- Clean up old data

### Vercel
- Optimize bundle size
- Use static generation where possible
- Implement proper caching
- Monitor function invocations

---

## Scaling Considerations

### When to Scale

- Consistent 1000+ active users
- Database approaching limits
- Response times degrading
- Storage approaching limits

### Scaling Options

1. **Database**: Upgrade Supabase plan
2. **Hosting**: Upgrade Vercel plan
3. **Performance**: Implement Redis caching
4. **Traffic**: Add CDN (Cloudflare)

---

## Success Metrics

Track these KPIs:
- User registration rate
- KYC approval rate
- Transaction volume
- Investment volume
- User retention
- Page load times
- Error rates

---

## Support & Maintenance

### Documentation
- Keep this guide updated
- Document changes
- Maintain API docs

### User Support
- Set up support email
- Create FAQ page
- Implement in-app help

---

**Deployment completed! 🚀**

For issues, check:
1. Vercel deployment logs
2. Supabase dashboard logs
3. Kinde admin panel
4. This deployment guide

