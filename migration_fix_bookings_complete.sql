-- Migration: Ensure all required columns exist in bookings table
-- Run this in Supabase SQL Editor to fix missing columns

-- Add total_amount if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
        RAISE NOTICE 'Column total_amount added to bookings table';
    ELSE
        RAISE NOTICE 'Column total_amount already exists';
    END IF;
END $$;

-- Add deposit_amount if it doesn't exist
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

-- Add tax_amount for IVU (Puerto Rico 11.5%)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'tax_amount'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
        RAISE NOTICE 'Column tax_amount added to bookings table';
    ELSE
        RAISE NOTICE 'Column tax_amount already exists';
    END IF;
END $$;

-- Add subtotal (before tax)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
        RAISE NOTICE 'Column subtotal added to bookings table';
    ELSE
        RAISE NOTICE 'Column subtotal already exists';
    END IF;
END $$;

-- Add payment_status if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
        RAISE NOTICE 'Column payment_status added to bookings table';
    ELSE
        RAISE NOTICE 'Column payment_status already exists';
    END IF;
END $$;

-- Add deposit_status if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'deposit_status'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN deposit_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (deposit_status IN ('pending', 'held', 'released', 'charged'));
        RAISE NOTICE 'Column deposit_status added to bookings table';
    ELSE
        RAISE NOTICE 'Column deposit_status already exists';
    END IF;
END $$;

-- Verify all columns exist
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookings'
AND column_name IN ('total_amount', 'deposit_amount', 'tax_amount', 'subtotal', 'payment_status', 'deposit_status')
ORDER BY column_name;

