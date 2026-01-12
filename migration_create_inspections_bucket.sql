-- Migration: Create 'inspections' Storage Bucket
-- Execute this in Supabase SQL Editor
-- 
-- This creates a bucket for storing vehicle inspection photos (entry and exit)
-- The bucket will be accessible via public URLs for viewing

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inspections',
  'inspections',
  true, -- Public bucket (allows public access via URL)
  10485760, -- 10MB file size limit (larger than licenses for high-res photos)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] -- Allowed image types
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
-- Allow public read access (for viewing inspection photos)
DROP POLICY IF EXISTS "Public Access for inspections bucket" ON storage.objects;

CREATE POLICY "Public Access for inspections bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'inspections');

-- Allow public uploads (for API routes using service role key)
-- The API endpoint validates bookingId and other parameters server-side
-- This allows the service role client to upload without RLS restrictions
DROP POLICY IF EXISTS "Public Upload for inspections bucket" ON storage.objects;

CREATE POLICY "Public Upload for inspections bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'inspections');

-- Allow public updates (for API routes using service role key)
DROP POLICY IF EXISTS "Public Update for inspections bucket" ON storage.objects;

CREATE POLICY "Public Update for inspections bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'inspections')
WITH CHECK (bucket_id = 'inspections');

-- Verify the bucket was created
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'inspections';
