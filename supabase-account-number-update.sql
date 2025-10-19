-- Add account_number field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_number TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_account_number ON users(account_number);

-- Add comment
COMMENT ON COLUMN users.account_number IS 'Unique account number assigned by admin';

