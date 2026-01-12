-- Migration: Fix Storage RLS Policies for 'licenses' bucket
-- Execute this in Supabase SQL Editor
-- 
-- This fixes the "new row violates row-level security policy" error
-- by ensuring proper RLS policies for public uploads

-- Step 1: Ensure RLS is enabled on storage.objects (should be by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies for licenses bucket (if they exist)
DROP POLICY IF EXISTS "Public Access for licenses bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload for licenses bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Update for licenses bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete for licenses bucket" ON storage.objects;

-- Step 3: Create comprehensive policies for the licenses bucket
-- These policies allow public (anonymous) access for guest checkout

-- Policy 1: Allow public SELECT (read/view files)
CREATE POLICY "Public Access for licenses bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'licenses');

-- Policy 2: Allow public INSERT (upload files) - CRITICAL for guest checkout
CREATE POLICY "Public Upload for licenses bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'licenses');

-- Policy 3: Allow public UPDATE (replace files)
CREATE POLICY "Public Update for licenses bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'licenses')
WITH CHECK (bucket_id = 'licenses');

-- Policy 4: Allow public DELETE (remove files if needed)
CREATE POLICY "Public Delete for licenses bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'licenses');

-- Step 4: Verify policies were created
-- Note: If you get a permission error, the policies were still created successfully
-- You can verify them in Supabase Dashboard > Storage > Policies
-- Or use this simpler query:
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%licenses%';
