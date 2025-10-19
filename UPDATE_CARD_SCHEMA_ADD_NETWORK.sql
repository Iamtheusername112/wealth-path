-- Add card_network field to credit_cards table

ALTER TABLE credit_cards 
ADD COLUMN IF NOT EXISTS card_network TEXT DEFAULT 'visa' 
CHECK (card_network IN ('visa', 'mastercard', 'amex', 'discover'));

-- Update existing cards to have a network based on their card number
UPDATE credit_cards
SET card_network = CASE
  WHEN card_number LIKE '4%' THEN 'visa'
  WHEN card_number LIKE '5%' THEN 'mastercard'
  WHEN card_number LIKE '3%' THEN 'amex'
  ELSE 'visa'
END
WHERE card_network IS NULL;

