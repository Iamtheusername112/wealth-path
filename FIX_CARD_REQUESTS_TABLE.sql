-- Fix Credit Card Requests Table - Run this in Supabase SQL Editor

-- Step 1: Drop the problematic foreign key constraint
ALTER TABLE credit_card_requests 
DROP CONSTRAINT IF EXISTS credit_card_requests_processed_by_fkey;

-- Step 2: Change the column type to TEXT
ALTER TABLE credit_card_requests 
ALTER COLUMN processed_by TYPE TEXT;

-- Step 3: Make it nullable (not required)
ALTER TABLE credit_card_requests 
ALTER COLUMN processed_by DROP NOT NULL;

-- Done! Now the admin can approve card requests.

