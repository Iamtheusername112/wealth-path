-- ========================================
-- IMPORTANT: Run this SQL in Supabase SQL Editor
-- This enables the account deactivation feature
-- ========================================

-- 1. Add status column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deactivated'));
        
        -- Update existing users to have 'active' status
        UPDATE users SET status = 'active' WHERE status IS NULL;
        
        -- Create index for better query performance
        CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
        
        RAISE NOTICE 'Status column added to users table';
    ELSE
        RAISE NOTICE 'Status column already exists';
    END IF;
END $$;

-- 2. Create support_tickets table if it doesn't exist
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('account_reactivation', 'technical_issue', 'billing', 'general', 'other')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  admin_response TEXT,
  responded_by TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for support_tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- 4. Enable RLS on support_tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- 5. Drop and recreate RLS policies for support_tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can insert own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON support_tickets;

CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own tickets" ON support_tickets FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update own tickets" ON support_tickets FOR UPDATE USING (user_id = auth.uid()::text);

-- 6. Create trigger function for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for support_tickets
DROP TRIGGER IF EXISTS update_support_tickets_updated_at_trigger ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at_trigger
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_tickets_updated_at();

-- 8. Verify the setup
SELECT 
    'Users table has status column: ' || 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'status'
    ) THEN 'YES ✓' ELSE 'NO ✗' END AS check_1,
    'Support tickets table exists: ' || 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'support_tickets'
    ) THEN 'YES ✓' ELSE 'NO ✗' END AS check_2,
    'All users have active status: ' || 
    CASE WHEN (SELECT COUNT(*) FROM users WHERE status IS NULL) = 0 
    THEN 'YES ✓' ELSE 'NO ✗' END AS check_3;

-- Done!
SELECT '✓ Account deactivation feature is now enabled!' AS status;
