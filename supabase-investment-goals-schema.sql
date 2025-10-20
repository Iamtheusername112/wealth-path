-- Investment Goals Table
CREATE TABLE IF NOT EXISTS investment_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(15, 2) NOT NULL,
  current_amount DECIMAL(15, 2) DEFAULT 0,
  target_date DATE,
  category TEXT CHECK (category IN ('retirement', 'house', 'education', 'vacation', 'emergency', 'other')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_investment_goals_user_id ON investment_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_goals_status ON investment_goals(status);

-- Enable RLS
ALTER TABLE investment_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own goals"
  ON investment_goals FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own goals"
  ON investment_goals FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own goals"
  ON investment_goals FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own goals"
  ON investment_goals FOR DELETE
  USING (auth.uid()::text = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_investment_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_investment_goals_timestamp
  BEFORE UPDATE ON investment_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_investment_goals_updated_at();

