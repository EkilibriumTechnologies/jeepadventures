-- Migration: Fix monetary columns to be DECIMAL instead of INTEGER
-- Run this in Supabase SQL Editor
-- This fixes the error: "invalid input syntax for type integer: '951.69'"

-- 1. Check if total_price exists, if not create it
DO $$
BEGIN
  -- Add total_price if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE bookings ADD COLUMN total_price DECIMAL(10, 2) DEFAULT 0.00;
  END IF;
END $$;

-- 2. Ensure all monetary columns are DECIMAL(10, 2)
-- This will convert INTEGER columns to DECIMAL
DO $$
BEGIN
  -- subtotal
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'subtotal') THEN
    ALTER TABLE bookings ALTER COLUMN subtotal TYPE DECIMAL(10, 2) USING subtotal::DECIMAL(10, 2);
  ELSE
    ALTER TABLE bookings ADD COLUMN subtotal DECIMAL(10, 2) DEFAULT 0.00;
  END IF;

  -- tax_amount
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'tax_amount') THEN
    ALTER TABLE bookings ALTER COLUMN tax_amount TYPE DECIMAL(10, 2) USING tax_amount::DECIMAL(10, 2);
  ELSE
    ALTER TABLE bookings ADD COLUMN tax_amount DECIMAL(10, 2) DEFAULT 0.00;
  END IF;

  -- total_price
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'total_price') THEN
    ALTER TABLE bookings ALTER COLUMN total_price TYPE DECIMAL(10, 2) USING total_price::DECIMAL(10, 2);
  END IF;

  -- security_deposit
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'security_deposit') THEN
    ALTER TABLE bookings ALTER COLUMN security_deposit TYPE DECIMAL(10, 2) USING security_deposit::DECIMAL(10, 2);
  ELSE
    ALTER TABLE bookings ADD COLUMN security_deposit DECIMAL(10, 2) DEFAULT 0.00;
  END IF;

  -- total_amount (keep for compatibility)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'total_amount') THEN
    ALTER TABLE bookings ALTER COLUMN total_amount TYPE DECIMAL(10, 2) USING total_amount::DECIMAL(10, 2);
  END IF;

  -- deposit_amount (keep for compatibility)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'deposit_amount') THEN
    ALTER TABLE bookings ALTER COLUMN deposit_amount TYPE DECIMAL(10, 2) USING deposit_amount::DECIMAL(10, 2);
  END IF;
END $$;

-- 3. Set default values if columns are NULL
UPDATE bookings 
SET 
  subtotal = COALESCE(subtotal, 0.00),
  tax_amount = COALESCE(tax_amount, 0.00),
  total_price = COALESCE(total_price, COALESCE(total_amount, 0.00)),
  security_deposit = COALESCE(security_deposit, COALESCE(deposit_amount, 0.00))
WHERE 
  subtotal IS NULL 
  OR tax_amount IS NULL 
  OR (total_price IS NULL AND total_amount IS NULL)
  OR security_deposit IS NULL;

-- 4. Make sure columns have defaults
ALTER TABLE bookings 
  ALTER COLUMN IF EXISTS subtotal SET DEFAULT 0.00,
  ALTER COLUMN IF EXISTS tax_amount SET DEFAULT 0.00,
  ALTER COLUMN IF EXISTS total_price SET DEFAULT 0.00,
  ALTER COLUMN IF EXISTS security_deposit SET DEFAULT 0.00;

-- 5. Verify the changes
SELECT 
  column_name, 
  data_type, 
  numeric_precision, 
  numeric_scale,
  column_default
FROM information_schema.columns
WHERE table_name = 'bookings' 
  AND column_name IN ('subtotal', 'tax_amount', 'total_price', 'total_amount', 'security_deposit', 'deposit_amount')
ORDER BY column_name;

