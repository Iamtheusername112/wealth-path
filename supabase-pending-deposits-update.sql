-- Update transactions table to support pending deposits
-- The status field already exists, so we just need to ensure it's working correctly

-- Add a new table for deposit requests for better tracking
CREATE TABLE IF NOT EXISTS deposit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  source_bank_name TEXT NOT NULL,
  source_account_last4 TEXT NOT NULL,
  destination_account TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id and status for faster queries
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status);

-- Add RLS policies
ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own deposit requests
DROP POLICY IF EXISTS "Users can view own deposit requests" ON deposit_requests;
CREATE POLICY "Users can view own deposit requests" ON deposit_requests
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can create their own deposit requests
DROP POLICY IF EXISTS "Users can create deposit requests" ON deposit_requests;
CREATE POLICY "Users can create deposit requests" ON deposit_requests
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

