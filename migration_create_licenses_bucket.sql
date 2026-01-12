-- Migration: Create 'licenses' Storage Bucket
-- Execute this in Supabase SQL Editor
-- 
-- This creates a public bucket for storing driver's license photos
-- The bucket will be accessible via public URLs

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'licenses',
  'licenses',
  true, -- Public bucket (allows public access via URL)
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] -- Allowed image types
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
-- Allow public read access (for viewing license photos)
-- First, drop the policy if it exists, then create it
DROP POLICY IF EXISTS "Public Access for licenses bucket" ON storage.objects;

CREATE POLICY "Public Access for licenses bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'licenses');

-- Allow public uploads (for guest checkout - no authentication required)
DROP POLICY IF EXISTS "Public Upload for licenses bucket" ON storage.objects;

CREATE POLICY "Public Upload for licenses bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'licenses');

-- Allow public updates (in case user wants to replace their license photo)
DROP POLICY IF EXISTS "Public Update for licenses bucket" ON storage.objects;

CREATE POLICY "Public Update for licenses bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'licenses')
WITH CHECK (bucket_id = 'licenses');

-- Verify the bucket was created
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'licenses';
