-- Migration: Add deposit_amount column to bookings table if it doesn't exist
-- Run this in your Supabase SQL Editor if the column is missing

-- Check if column exists and add it if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'deposit_amount'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN deposit_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
        
        RAISE NOTICE 'Column deposit_amount added to bookings table';
    ELSE
        RAISE NOTICE 'Column deposit_amount already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookings'
AND column_name = 'deposit_amount';

