-- =====================================================
-- MIGRACIÓN COMPLETA: Tabla bookings - Todas las columnas
-- =====================================================
-- Ejecuta este SQL en Supabase SQL Editor
-- Este script asegura que TODAS las columnas necesarias existan

-- 1. total_amount
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
        RAISE NOTICE '✅ Column total_amount added';
    ELSE
        RAISE NOTICE 'ℹ️ Column total_amount already exists';
    END IF;
END $$;

-- 2. deposit_amount
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'deposit_amount'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN deposit_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
        RAISE NOTICE '✅ Column deposit_amount added';
    ELSE
        RAISE NOTICE 'ℹ️ Column deposit_amount already exists';
    END IF;
END $$;

-- 3. tax_amount (IVU Puerto Rico)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'tax_amount'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
        RAISE NOTICE '✅ Column tax_amount added';
    ELSE
        RAISE NOTICE 'ℹ️ Column tax_amount already exists';
    END IF;
END $$;

-- 4. subtotal (ANTES de impuestos)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
        RAISE NOTICE '✅ Column subtotal added';
    ELSE
        RAISE NOTICE 'ℹ️ Column subtotal already exists';
    END IF;
END $$;

-- 5. payment_status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
        RAISE NOTICE '✅ Column payment_status added';
    ELSE
        RAISE NOTICE 'ℹ️ Column payment_status already exists';
    END IF;
END $$;

-- 6. deposit_status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'deposit_status'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN deposit_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (deposit_status IN ('pending', 'held', 'released', 'charged'));
        RAISE NOTICE '✅ Column deposit_status added';
    ELSE
        RAISE NOTICE 'ℹ️ Column deposit_status already exists';
    END IF;
END $$;

-- 7. stripe_payment_intent_id (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'stripe_payment_intent_id'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN stripe_payment_intent_id VARCHAR(255);
        RAISE NOTICE '✅ Column stripe_payment_intent_id added';
    ELSE
        RAISE NOTICE 'ℹ️ Column stripe_payment_intent_id already exists';
    END IF;
END $$;

-- 8. stripe_deposit_intent_id (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'stripe_deposit_intent_id'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN stripe_deposit_intent_id VARCHAR(255);
        RAISE NOTICE '✅ Column stripe_deposit_intent_id added';
    ELSE
        RAISE NOTICE 'ℹ️ Column stripe_deposit_intent_id already exists';
    END IF;
END $$;

-- =====================================================
-- VERIFICACIÓN FINAL: Lista todas las columnas
-- =====================================================
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookings'
ORDER BY ordinal_position;

-- =====================================================
-- VERIFICACIÓN ESPECÍFICA: Columnas requeridas
-- =====================================================
SELECT 
    CASE 
        WHEN COUNT(*) = 8 THEN '✅ Todas las columnas requeridas existen'
        ELSE '⚠️ Faltan algunas columnas'
    END as status,
    COUNT(*) as columns_found,
    STRING_AGG(column_name, ', ' ORDER BY column_name) as found_columns
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookings'
AND column_name IN (
    'total_amount',
    'deposit_amount', 
    'tax_amount',
    'subtotal',
    'payment_status',
    'deposit_status',
    'stripe_payment_intent_id',
    'stripe_deposit_intent_id'
);

