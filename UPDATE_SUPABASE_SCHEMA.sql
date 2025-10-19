-- Add profile_image_url column to users table
-- Run this in your Supabase SQL Editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN users.profile_image_url IS 'URL to user profile photo uploaded during KYC';

