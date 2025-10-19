-- CapitalPath Credit Cards Schema

-- Credit Card Requests table
CREATE TABLE IF NOT EXISTS credit_card_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by TEXT
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

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own card requests" ON credit_card_requests;
DROP POLICY IF EXISTS "Users can insert own card requests" ON credit_card_requests;
DROP POLICY IF EXISTS "Users can view own credit cards" ON credit_cards;

-- RLS Policies for credit_card_requests
CREATE POLICY "Users can view own card requests" ON credit_card_requests FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own card requests" ON credit_card_requests FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- RLS Policies for credit_cards
CREATE POLICY "Users can view own credit cards" ON credit_cards FOR SELECT USING (user_id = auth.uid()::text);

