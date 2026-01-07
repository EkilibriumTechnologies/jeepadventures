-- Migration: Enable Guest Checkout
-- This migration makes user_id nullable and adds guest information columns

-- Step 1: Make user_id nullable (for guest bookings)
ALTER TABLE bookings 
ALTER COLUMN user_id DROP NOT NULL;

-- Step 2: Add guest information columns (optional, for guest bookings)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS guest_address TEXT,
ADD COLUMN IF NOT EXISTS guest_license_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS guest_license_image_url TEXT;

-- Step 3: Add metadata column for additional data (subtotal, tax_amount, etc.)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Step 4: Update RLS policy to allow guest bookings (inserts without auth)
DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true); -- Allow anyone to create bookings (guest checkout)

-- Step 5: Update RLS policy to allow viewing bookings by email (for guests)
CREATE POLICY "Guests can view own bookings by email"
  ON bookings FOR SELECT
  USING (
    guest_email IS NOT NULL AND 
    guest_email = current_setting('request.jwt.claims', true)::json->>'email'
    OR
    user_id IS NOT NULL AND auth.uid() = user_id
  );

