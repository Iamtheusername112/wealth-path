-- Add banking credentials to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS swift_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS routing_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sort_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_branch TEXT DEFAULT 'CapitalPath Main Branch';
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_address TEXT DEFAULT '1 CapitalPath Plaza, Financial District';

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_swift_code ON users(swift_code);
CREATE INDEX IF NOT EXISTS idx_users_iban ON users(iban);
CREATE INDEX IF NOT EXISTS idx_users_routing_number ON users(routing_number);

-- Add comments
COMMENT ON COLUMN users.swift_code IS 'SWIFT/BIC code for international transfers';
COMMENT ON COLUMN users.iban IS 'International Bank Account Number';
COMMENT ON COLUMN users.routing_number IS 'US routing number / ABA number';
COMMENT ON COLUMN users.sort_code IS 'UK sort code';
COMMENT ON COLUMN users.bank_branch IS 'Bank branch name';
COMMENT ON COLUMN users.bank_address IS 'Bank branch address';

