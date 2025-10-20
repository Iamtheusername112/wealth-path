-- Add initial_investment column to track original investment amount
-- This way we can distinguish between original investment and current value (after admin adjustments)

ALTER TABLE investments 
ADD COLUMN IF NOT EXISTS initial_investment DECIMAL(15, 2);

-- Copy current amount to initial_investment for existing records
UPDATE investments 
SET initial_investment = amount 
WHERE initial_investment IS NULL;

-- Make it NOT NULL with default
ALTER TABLE investments 
ALTER COLUMN initial_investment SET NOT NULL;

-- Now:
-- initial_investment = original amount user invested
-- amount = current value (can be adjusted by admin)
-- profit/loss = amount - initial_investment

