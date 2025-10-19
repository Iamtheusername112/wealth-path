# CapitalPath 🏦💰

A modern, premium, full-stack **Banking + Investment Web Application** built with Next.js, featuring comprehensive financial management, multi-category investments, and enterprise-grade security.

## 🌟 Features

### **Core Banking**
- ✅ Secure user authentication with **Clerk** (upgraded!)
- ✅ Full KYC verification process with document upload
- ✅ **Profile photo upload** (NEW! 📸)
- ✅ **Animated onboarding stepper** (NEW! ✨)
- ✅ Real-time balance management
- ✅ Deposit, withdrawal, and transfer functionality
- ✅ Transaction history and analytics
- ✅ Multi-currency support

### **Investment Platform**
- ✅ **5 Investment Categories**:
  - 💰 Cryptocurrency (Bitcoin, Ethereum, etc.)
  - 📈 Stocks (Apple, Microsoft, Tesla, etc.)
  - 💱 Forex (EUR/USD, GBP/USD, etc.)
  - 🏅 Commodities (Gold, Silver, Oil, etc.)
  - 🏘️ Real Estate (REITs and property funds)
- ✅ Portfolio tracking and analytics
- ✅ Real-time price updates (simulated)
- ✅ Investment performance metrics

### **Security & Compliance**
- ✅ KYC verification required before trading
- ✅ Document upload to Supabase storage
- ✅ Admin approval workflow
- ✅ Secure authentication with Kinde
- ✅ Row-level security in database

### **Admin Dashboard**
- ✅ User management
- ✅ KYC approval/rejection
- ✅ Transaction monitoring
- ✅ Platform analytics

### **Additional Features**
- ✅ Real-time notifications
- ✅ User settings and preferences
- ✅ Dark/Light theme toggle
- ✅ Responsive design
- ✅ Beautiful UI with TailwindCSS
- ✅ Toast notifications with Sonner

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Authentication**: Clerk (easy & beautiful!)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Icons**: Lucide React
- **Animations**: Framer Motion, Canvas Confetti
- **Notifications**: Sonner

## 📦 Installation

### Prerequisites

- Node.js 18+ installed
- Supabase account (free)
- Clerk account (free - easier than Kinde!)

### 1. Clone and Install

\`\`\`bash
cd capital-path
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the `supabase-schema.sql` file
3. Create a storage bucket named `kyc-documents` in **Storage**
4. Copy your project URL and anon key

### 3. Set Up Clerk Authentication

1. Create an account at [clerk.com](https://clerk.com)
2. Create a new application named "CapitalPath"
3. **That's it!** No callback URLs needed!
4. Copy your 2 keys (Publishable & Secret)

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Clerk Auth (2 keys - super easy!)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/kyc

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

**See `WHAT_YOU_NEED.md` for detailed instructions!**

### 5. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗂️ Project Structure

\`\`\`
capital-path/
├── app/
│   ├── page.js                    # Landing page
│   ├── dashboard/                 # Banking dashboard
│   ├── investments/               # Investment platform
│   ├── admin/                     # Admin panel
│   ├── kyc/                       # KYC verification
│   ├── notifications/             # Notifications page
│   ├── settings/                  # User settings
│   └── api/                       # API routes
│       ├── auth/                  # Kinde auth
│       ├── transactions/          # Banking operations
│       ├── investments/           # Investment operations
│       ├── kyc/                   # KYC submission
│       ├── admin/                 # Admin operations
│       └── notifications/         # Notification operations
├── components/
│   ├── ui/                        # Reusable UI components
│   ├── dashboard/                 # Dashboard components
│   ├── investments/               # Investment components
│   ├── admin/                     # Admin components
│   ├── kyc/                       # KYC components
│   ├── notifications/             # Notification components
│   ├── settings/                  # Settings components
│   ├── navbar.jsx                 # Main navigation
│   ├── theme-provider.jsx         # Theme context
│   └── theme-toggle.jsx           # Theme switcher
├── lib/
│   ├── supabase.js               # Supabase client
│   ├── auth.js                   # Auth utilities
│   └── utils.js                  # Helper functions
├── supabase-schema.sql           # Database schema
└── middleware.js                 # Auth middleware
\`\`\`

## 🚀 Usage Guide

### For Users

1. **Register**: Click "Get Started" and create an account
2. **Complete KYC**: Submit identity documents for verification
3. **Wait for Approval**: Admin will review and approve your KYC
4. **Start Banking**: 
   - Add funds to your account
   - Make transfers to other users
   - Withdraw money
5. **Invest**: Browse investment opportunities across 5 categories
6. **Track Portfolio**: Monitor your investments and returns

### For Admins

1. **Create Admin Account**: 
   \`\`\`sql
   INSERT INTO admins (email, role) 
   VALUES ('your-email@example.com', 'admin');
   \`\`\`
2. **Access Admin Panel**: Navigate to `/admin`
3. **Manage KYC**: Review and approve/reject user verifications
4. **Monitor Platform**: View users, transactions, and investments

## 🎨 UI/UX Features

- **Premium Color Scheme**: Navy blue and gold palette
- **Responsive Design**: Works on all devices
- **Dark/Light Mode**: Toggle between themes
- **Smooth Animations**: Framer Motion transitions
- **Intuitive Navigation**: Easy-to-use interface
- **Toast Notifications**: Real-time feedback via Sonner

## 🔒 Security Features

- **KYC Verification**: Mandatory identity verification
- **Secure Authentication**: Kinde Auth integration
- **Row-Level Security**: Database-level access control
- **Document Storage**: Secure file uploads to Supabase
- **Admin Approval**: Manual verification process
- **Protected Routes**: Middleware-based route protection

## 📊 Database Schema

Key tables:
- `users` - User profiles and balances
- `transactions` - All financial transactions
- `investments` - User investment records
- `kyc_documents` - Identity verification files
- `notifications` - User notifications
- `admins` - Admin user records

See `supabase-schema.sql` for full schema.

## 🌐 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Environment Variables for Production

Update the following in your production environment:
- `KINDE_SITE_URL` → Your production URL
- `KINDE_POST_LOGOUT_REDIRECT_URL` → Production URL
- `KINDE_POST_LOGIN_REDIRECT_URL` → Production URL/dashboard

## 🔧 Development

### Adding New Features

1. Create components in `components/`
2. Add pages in `app/`
3. Create API routes in `app/api/`
4. Update database schema if needed

### Customization

- **Colors**: Modify `tailwind.config.js`
- **Fonts**: Update `app/layout.js`
- **Theme**: Edit `app/globals.css`

## 📝 License

This is a demonstration project built for educational purposes.

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

## 📧 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ using Next.js, Supabase, and Kinde**
# wealth-path
