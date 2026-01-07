# 🔧 Solución: Error "Could not find the 'deposit_amount' column"

## ⚠️ Error Actual

Estás viendo este error:
```
Error al crear la reserva: Could not find the 'deposit_amount' column of 'bookings' in the schema cache
```

## ✅ Solución Rápida

Necesitas ejecutar una migración SQL en tu base de datos de Supabase para agregar la columna `deposit_amount`.

### Paso 1: Abre Supabase Dashboard

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú lateral

### Paso 2: Ejecuta este SQL

Copia y pega este código SQL en el editor:

```sql
-- Add deposit_amount column if it doesn't exist
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
```

### Paso 3: Ejecuta el Script

1. Haz clic en **Run** o presiona `Ctrl+Enter`
2. Deberías ver un mensaje de éxito

### Paso 4: Verifica que se agregó

Ejecuta este query para verificar:

```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookings'
AND column_name = 'deposit_amount';
```

Deberías ver una fila con:
- `column_name`: `deposit_amount`
- `data_type`: `numeric`
- `column_default`: `0.00`
- `is_nullable`: `NO`

### Paso 5: Refresca la aplicación

Después de ejecutar la migración, recarga la página en tu navegador y vuelve a intentar crear la reserva.

## 📝 Nota

Si ya ejecutaste esta migración antes y aún ves el error, puede ser un problema de caché. Intenta:

1. Esperar unos segundos y recargar la página
2. Limpiar el caché del navegador
3. Verificar en Supabase que la columna realmente existe

## 🔍 Verificación Adicional

Si quieres ver todas las columnas de la tabla `bookings`:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookings'
ORDER BY ordinal_position;
```

Esto te mostrará todas las columnas y sus tipos de datos.

