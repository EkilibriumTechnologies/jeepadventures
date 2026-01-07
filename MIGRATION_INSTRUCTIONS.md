# Instrucciones para Agregar la Columna deposit_amount

El error indica que la columna `deposit_amount` no existe en la tabla `bookings` de tu base de datos de Supabase.

## Solución Rápida

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Copia y pega el siguiente SQL:

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
    END IF;
END $$;
```

4. Haz clic en **Run** para ejecutar el script
5. Verifica que la columna se agregó correctamente

## Alternativa: Ejecutar el archivo completo

También puedes ejecutar el archivo `migration_add_deposit_amount.sql` que está en la raíz del proyecto.

## Verificación

Después de ejecutar la migración, verifica que la columna existe:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookings'
AND column_name = 'deposit_amount';
```

Deberías ver una fila con `deposit_amount` como `DECIMAL(10,2)` con default `0.00`.

