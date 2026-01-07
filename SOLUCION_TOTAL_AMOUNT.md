# 🚨 Solución: Error "Could not find the 'total_amount' column"

## ⚠️ Problema

Estás viendo el error: **"Could not find the 'total_amount' column of 'bookings' in the schema cache"**

Esto significa que **NO has ejecutado la migración SQL** en Supabase.

## ✅ Solución (OBLIGATORIO)

### Paso 1: Abre Supabase SQL Editor

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (menú lateral izquierdo)

### Paso 2: Ejecuta la Migración Completa

Copia y pega **TODO** este SQL:

```sql
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
    END IF;
END $$;

-- 3. tax_amount
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

-- 4. subtotal
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

Ejecuta este query para confirmar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookings'
AND column_name IN ('total_amount', 'deposit_amount', 'tax_amount', 'subtotal', 'payment_status', 'deposit_status')
ORDER BY column_name;
```

Deberías ver 6 filas.

## 📧 Sobre el Email

El código se auto-completa en **desarrollo** para facilitar pruebas, pero el email **SÍ se envía por Resend**.

Para verificar que el email se envió:
1. Revisa la consola del servidor (terminal donde corre `npm run dev`)
2. Deberías ver: `✅ OTP email sent successfully via Resend to [email]`
3. Revisa tu bandeja de entrada (y spam)

## 🔄 Después de Ejecutar la Migración

1. Recarga la página del checkout
2. Intenta crear una reserva nuevamente
3. El error debería desaparecer

