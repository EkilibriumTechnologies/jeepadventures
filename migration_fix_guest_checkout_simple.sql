-- Migration: Fix Guest Checkout - Simplified Version
-- Execute this in Supabase SQL Editor
-- This version handles existing policies correctly

-- 1. Hacer user_id nullable (para guest bookings)
ALTER TABLE bookings 
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Eliminar foreign key constraint en user_id (ya que puede ser NULL)
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

-- 3. Agregar columnas financieras faltantes
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS security_deposit DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- 4. Agregar columna metadata
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 5. Agregar columnas de información del guest
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255);

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50);

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_address TEXT;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_license_number VARCHAR(50);

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_license_image_url TEXT;

-- 6. Actualizar RLS policies para permitir guest bookings
-- Primero eliminar políticas existentes
DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;

-- Crear nueva política (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings' 
        AND policyname = 'Anyone can create bookings'
    ) THEN
        CREATE POLICY "Anyone can create bookings"
          ON bookings FOR INSERT
          WITH CHECK (true);
    END IF;
END $$;

-- 7. Policy para que guests puedan ver sus bookings por email
DROP POLICY IF EXISTS "Guests can view own bookings by email" ON bookings;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings' 
        AND policyname = 'Guests can view own bookings by email'
    ) THEN
        CREATE POLICY "Guests can view own bookings by email"
          ON bookings FOR SELECT
          USING (
            (user_id IS NULL AND guest_email IS NOT NULL)
            OR
            (user_id IS NOT NULL AND auth.uid() = user_id)
          );
    END IF;
END $$;

