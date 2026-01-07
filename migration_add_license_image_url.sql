-- Migration: Add license_image_url column to profiles table
-- Run this in your Supabase SQL Editor

-- Add license_image_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'license_image_url'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN license_image_url TEXT;
        
        RAISE NOTICE 'Column license_image_url added to profiles table';
    ELSE
        RAISE NOTICE 'Column license_image_url already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name = 'license_image_url';

