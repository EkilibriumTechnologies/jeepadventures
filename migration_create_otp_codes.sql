-- Migration: Create otp_codes table for storing OTP codes
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_code ON otp_codes(code);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- Enable RLS
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert OTP codes (for sending)
CREATE POLICY "Anyone can insert OTP codes"
  ON otp_codes FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can verify OTP codes (for verification)
CREATE POLICY "Anyone can verify OTP codes"
  ON otp_codes FOR SELECT
  USING (true);

-- Policy: Anyone can update OTP codes (to mark as used)
CREATE POLICY "Anyone can update OTP codes"
  ON otp_codes FOR UPDATE
  USING (true);

-- Function to clean up expired OTP codes (optional, can be run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otp_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

