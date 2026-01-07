-- Migration: Fix Guest Checkout - Add missing columns and make user_id nullable
-- Execute this in Supabase SQL Editor

-- Step 1: Make user_id nullable (for guest bookings)
ALTER TABLE bookings 
ALTER COLUMN user_id DROP NOT NULL;

-- Step 2: Drop foreign key constraint on user_id (since it can be NULL for guests)
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

-- Step 3: Add missing columns for financial breakdown
DO $$ 
BEGIN
    -- Add subtotal column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
    END IF;

    -- Add tax_amount column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'tax_amount'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
    END IF;

    -- Add security_deposit column (if different from deposit_amount)
    -- Note: If you want to use deposit_amount instead, skip this
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'security_deposit'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN security_deposit DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
    END IF;
END $$;

-- Step 4: Add metadata column for additional guest data
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Step 5: Update RLS policy to allow guest bookings (inserts without auth)
-- Drop existing policies first (this will not error if they don't exist)
DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;

-- Create new policy
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true); -- Allow anyone to create bookings (guest checkout)

-- Step 6: Update RLS policy to allow viewing bookings by email (for guests)
DROP POLICY IF EXISTS "Guests can view own bookings by email" ON bookings;

CREATE POLICY "Guests can view own bookings by email"
  ON bookings FOR SELECT
  USING (
    (user_id IS NULL AND guest_email IS NOT NULL)
    OR
    (user_id IS NOT NULL AND auth.uid() = user_id)
  );

-- Step 7: Add guest information columns (optional, for easier querying)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS guest_address TEXT,
ADD COLUMN IF NOT EXISTS guest_license_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS guest_license_image_url TEXT;

