-- Add status column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deactivated'));

-- Update existing users to have 'active' status
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
