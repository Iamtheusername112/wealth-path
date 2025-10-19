-- Linked Bank Accounts Table
CREATE TABLE IF NOT EXISTS linked_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  bank_country TEXT NOT NULL,
  bank_code TEXT,
  account_type TEXT NOT NULL, -- checking, savings, etc
  account_holder_name TEXT NOT NULL,
  account_number_last4 TEXT NOT NULL,
  routing_number TEXT,
  swift_code TEXT,
  iban TEXT,
  currency TEXT DEFAULT 'USD',
  is_verified BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_linked_banks_user_id ON linked_bank_accounts(user_id);

-- Add RLS policies
ALTER TABLE linked_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own linked banks" ON linked_bank_accounts;
DROP POLICY IF EXISTS "Users can insert own linked banks" ON linked_bank_accounts;
DROP POLICY IF EXISTS "Users can update own linked banks" ON linked_bank_accounts;
DROP POLICY IF EXISTS "Users can delete own linked banks" ON linked_bank_accounts;

-- Policy: Users can only see their own linked banks
CREATE POLICY "Users can view own linked banks" ON linked_bank_accounts
  FOR SELECT USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own linked banks
CREATE POLICY "Users can insert own linked banks" ON linked_bank_accounts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own linked banks
CREATE POLICY "Users can update own linked banks" ON linked_bank_accounts
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own linked banks
CREATE POLICY "Users can delete own linked banks" ON linked_bank_accounts
  FOR DELETE USING (auth.uid()::text = user_id);

