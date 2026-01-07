# 🔧 Solución: Error "policy already exists"

## Problema

El error indica que la política `"Anyone can create bookings"` ya existe en la tabla `bookings`.

## Solución Rápida

**Ejecuta este SQL en Supabase SQL Editor:**

```sql
-- Primero eliminar la política existente
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;

-- Luego crearla de nuevo
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);
```

## Solución Completa (Re-ejecutar toda la migración)

Si quieres ejecutar toda la migración de nuevo de forma segura:

```sql
-- 1. Hacer user_id nullable
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;

-- 2. Eliminar foreign key constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

-- 3. Agregar columnas financieras
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS security_deposit DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- 4. Agregar columna metadata
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 5. Agregar columnas de guest
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_address TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_license_number VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_license_image_url TEXT;

-- 6. Eliminar políticas existentes y crear nuevas
DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;

CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- 7. Policy para ver bookings por email
DROP POLICY IF EXISTS "Guests can view own bookings by email" ON bookings;

CREATE POLICY "Guests can view own bookings by email"
  ON bookings FOR SELECT
  USING (
    (user_id IS NULL AND guest_email IS NOT NULL)
    OR
    (user_id IS NOT NULL AND auth.uid() = user_id)
  );
```

## Nota

El `DROP POLICY IF EXISTS` no debería dar error, pero si la política ya existe y quieres recrearla, simplemente ejecuta el `DROP` primero y luego el `CREATE`.

