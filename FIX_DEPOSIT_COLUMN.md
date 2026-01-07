# 🔧 Solución: Error "Could not find the 'deposit_amount' column"

## ✅ Cambios Realizados

He actualizado el depósito de **$200** a **$450** en todo el código:
- ✅ `app/checkout/page.tsx` - Depósito mostrado en UI: **$450**
- ✅ `app/checkout/page.tsx` - Depósito en booking: **$450**
- ✅ `app/api/checkout/route.ts` - Depósito en API: **$450**

## ⚠️ Problema: Columna Faltante

El error indica que la columna `deposit_amount` no existe en la tabla `bookings` de tu base de datos de Supabase.

## ✅ Solución (2 minutos)

### Paso 1: Abre Supabase SQL Editor

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (menú lateral izquierdo)

### Paso 2: Copia y Pega este SQL

```sql
-- Migration: Add deposit_amount column to bookings table if it doesn't exist

-- Check if column exists and add it if it doesn't
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

-- Verify the column was added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookings'
AND column_name = 'deposit_amount';
```

### Paso 3: Ejecuta el SQL

1. Haz clic en **Run** (o presiona `Ctrl+Enter`)
2. Deberías ver un mensaje de éxito
3. La consulta de verificación debería mostrar una fila con `deposit_amount`

### Paso 4: Verifica

Deberías ver algo como:
```
column_name    | data_type | column_default | is_nullable
---------------|-----------|----------------|-------------
deposit_amount | numeric   | 0.00          | NO
```

### Paso 5: Prueba de nuevo

1. Recarga la página del checkout
2. El depósito ahora debería mostrar **$450.00**
3. Intenta crear una reserva nuevamente

## 📝 Nota

El archivo completo de migración está en: `migration_add_deposit_amount.sql`

