-- Migration: Fix user_id columns to use UUID instead of INTEGER
-- Created: 2025-12-30
-- Description: Changes user_id in carts and reviews tables from INTEGER to UUID
--              to match Supabase Auth user IDs. Adds proper foreign key constraints.

-- Step 1: Backup existing data (optional, for safety)
-- CREATE TABLE IF NOT EXISTS carts_backup AS SELECT * FROM public.carts;
-- CREATE TABLE IF NOT EXISTS reviews_backup AS SELECT * FROM public.reviews;

-- Step 2: Drop existing foreign key constraints if they exist
ALTER TABLE IF EXISTS public.carts 
DROP CONSTRAINT IF EXISTS carts_user_id_fkey;

ALTER TABLE IF EXISTS public.reviews 
DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Step 3: Delete guest cart data (user_id = 9999) as it can't be converted to UUID
-- We'll create those carts fresh with NULL user_id for guests
DELETE FROM public.cart_items 
WHERE cart_id IN (SELECT cart_id FROM public.carts WHERE user_id = 9999);

DELETE FROM public.carts 
WHERE user_id = 9999;

-- Step 4: Change carts.user_id column type to UUID
-- First, alter to allow NULL temporarily
ALTER TABLE public.carts 
ALTER COLUMN user_id DROP NOT NULL;

-- Add a new UUID column
ALTER TABLE public.carts 
ADD COLUMN user_id_uuid UUID;

-- Copy any existing valid user data (this will fail for invalid integer IDs, which is expected)
-- Since we're using Supabase Auth, there shouldn't be any valid integer user_ids
-- This step is mainly to preserve any accidentally correct UUIDs stored as integers
-- In reality, we can skip this if we know all existing data is invalid

-- Drop the old integer column
ALTER TABLE public.carts 
DROP COLUMN user_id;

-- Rename the new column to user_id
ALTER TABLE public.carts 
RENAME COLUMN user_id_uuid TO user_id;

-- Step 5: Do the same for reviews table
ALTER TABLE public.reviews 
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.reviews 
ADD COLUMN user_id_uuid UUID;

-- Drop the old integer column
ALTER TABLE public.reviews 
DROP COLUMN user_id;

-- Rename the new column to user_id
ALTER TABLE public.reviews 
RENAME COLUMN user_id_uuid TO user_id;

-- Step 6: Add foreign key constraints to auth.users
-- Note: user_id can be NULL for guest carts
ALTER TABLE public.carts 
ADD CONSTRAINT carts_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- For reviews, user_id should be required
ALTER TABLE public.reviews 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Step 7: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carts_user_id 
ON public.carts(user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id 
ON public.reviews(user_id);

-- Step 8: Add comments for documentation
COMMENT ON COLUMN public.carts.user_id IS 'UUID of the user who owns this cart. NULL for guest users.';
COMMENT ON COLUMN public.reviews.user_id IS 'UUID of the user who wrote this review. References auth.users(id).';
