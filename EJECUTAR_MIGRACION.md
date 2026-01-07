# 🚨 IMPORTANTE: Ejecutar Migración SQL

## ⚠️ Error Actual

Estás viendo el error: **"Could not find the 'subtotal' column"**

Esto significa que la tabla `bookings` no tiene todas las columnas necesarias.

## ✅ Solución (2 minutos)

### Paso 1: Abre Supabase SQL Editor

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (menú lateral izquierdo)

### Paso 2: Copia y Pega el SQL Completo

Abre el archivo **`migration_bookings_all_columns.sql`** y copia TODO el contenido.

O ejecuta directamente este SQL:

```sql
-- 1. subtotal
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
    END IF;
END $$;

-- 2. tax_amount
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
    END IF;
END $$;

-- 3. total_amount
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
    END IF;
END $$;

-- 4. deposit_amount
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
    END IF;
END $$;
```

### Paso 3: Ejecuta el SQL

1. Haz clic en **Run** (o presiona `Ctrl+Enter`)
2. Deberías ver mensajes de éxito para cada columna

### Paso 4: Verifica

Al final del script, deberías ver una tabla con todas las columnas de `bookings`.

## 📋 Columnas Requeridas

La tabla `bookings` debe tener estas columnas:

- ✅ `subtotal` - DECIMAL(10,2) - Renta antes de impuestos
- ✅ `tax_amount` - DECIMAL(10,2) - IVU 11.5%
- ✅ `total_amount` - DECIMAL(10,2) - Subtotal + Tax
- ✅ `deposit_amount` - DECIMAL(10,2) - Depósito $450
- ✅ `payment_status` - VARCHAR(20) - Estado del pago
- ✅ `deposit_status` - VARCHAR(20) - Estado del depósito

## 🔄 Después de Ejecutar

1. Recarga la página del checkout
2. Intenta crear una reserva nuevamente
3. El error debería desaparecer

