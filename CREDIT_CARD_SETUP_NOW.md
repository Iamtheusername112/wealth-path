# ⚡ Credit Card Feature - Setup Now!

## 🚨 IMPORTANT: Run This SQL First!

The admin can see credit card requests but cannot approve them yet because the database tables don't exist.

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy and Run This SQL

Copy the **entire content** from `supabase-credit-cards-schema.sql` and paste it into the SQL Editor, then click **RUN**.

Or copy this:

```sql
-- CapitalPath Credit Cards Schema

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Credit Card Requests table
CREATE TABLE IF NOT EXISTS credit_card_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES admins(id)
);

-- Credit Cards table
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  card_number TEXT UNIQUE NOT NULL,
  card_holder_name TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  cvv TEXT NOT NULL,
  card_type TEXT DEFAULT 'platinum' CHECK (card_type IN ('platinum', 'gold', 'black')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'expired')),
  credit_limit DECIMAL(15, 2) DEFAULT 10000.00,
  available_credit DECIMAL(15, 2) DEFAULT 10000.00,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_credit_card_requests_user_id ON credit_card_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_requests_status ON credit_card_requests(status);
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_cards_status ON credit_cards(status);

-- Enable RLS
ALTER TABLE credit_card_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_card_requests
CREATE POLICY "Users can view own card requests" ON credit_card_requests FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own card requests" ON credit_card_requests FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- RLS Policies for credit_cards
CREATE POLICY "Users can view own credit cards" ON credit_cards FOR SELECT USING (user_id = auth.uid()::text);
```

### Step 3: Verify Tables Were Created

After running the SQL, verify the tables exist:

1. In Supabase, click on **Table Editor** in the left sidebar
2. You should now see two new tables:
   - `credit_card_requests`
   - `credit_cards`

### Step 4: Test the Feature

Now you can test:

1. **As User:**
   - Go to `/cards`
   - Click "Request Card"
   - Submit request

2. **As Admin:**
   - Go to `/admin`
   - Click "Credit Cards" tab (you'll see a notification badge if there are pending requests)
   - Select card type (Platinum/Gold/Black)
   - Click "Approve"
   - Card will be auto-generated!

3. **As User Again:**
   - Go back to `/cards`
   - See your beautiful premium credit card! 💳

## ✅ What Happens After Running SQL?

- ✅ Admin can now approve/reject card requests
- ✅ Cards are automatically generated with valid numbers
- ✅ Users receive notifications when approved
- ✅ Beautiful 3D metal cards display on user's Cards page
- ✅ All security policies are in place

## 🎯 Card Types & Limits

| Type | Credit Limit | Design |
|------|--------------|--------|
| Platinum | $10,000 | Silver gradient |
| Gold | $20,000 | Gold gradient |
| Black | $50,000 | Black gradient |

## 🔒 Security

- Row Level Security (RLS) enabled
- Users can only see their own cards
- Admin approval required
- Valid card numbers generated using Luhn algorithm

---

**That's it!** Once you run the SQL, the entire credit card system will work perfectly! 🚀

