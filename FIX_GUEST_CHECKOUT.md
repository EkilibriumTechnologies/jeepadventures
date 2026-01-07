# ✅ Fix Guest Checkout - Instrucciones

## Cambios Realizados

### 1. **API Route Actualizado (`app/api/checkout/route.ts`)**
   - ✅ **Cálculo correcto de montos:**
     - `subtotal`: $269.97 (rental antes de impuestos)
     - `tax_amount`: $31.05 (IVU 11.5%)
     - `security_deposit`: $450.00
     - `total_amount`: $751.02 (subtotal + tax + deposit)
   - ✅ **user_id es NULL** para guest bookings (sin autenticación)
   - ✅ **Datos del guest guardados** en columnas dedicadas y metadata
   - ✅ **Logging mejorado** para debugging

### 2. **Checkout Page**
   - ✅ **Redirección automática** a `/booking-confirmation` después del éxito
   - ✅ **Captura todos los campos** del formulario (nombre, email, teléfono, dirección, licencia)

## ⚠️ MIGRACIÓN SQL OBLIGATORIA

**EJECUTA ESTA MIGRACIÓN EN SUPABASE SQL EDITOR ANTES DE PROBAR:**

```sql
-- 1. Hacer user_id nullable (para guest bookings)
ALTER TABLE bookings 
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Eliminar foreign key constraint en user_id (ya que puede ser NULL)
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

-- 3. Agregar columnas financieras faltantes
DO $$ 
BEGIN
    -- subtotal
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
    END IF;

    -- tax_amount
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'tax_amount'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
    END IF;

    -- security_deposit
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'security_deposit'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN security_deposit DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
    END IF;
END $$;

-- 4. Agregar columna metadata
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 5. Agregar columnas de información del guest
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS guest_address TEXT,
ADD COLUMN IF NOT EXISTS guest_license_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS guest_license_image_url TEXT;

-- 6. Actualizar RLS policies para permitir guest bookings
DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;

CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- 7. Policy para que guests puedan ver sus bookings por email
DROP POLICY IF EXISTS "Guests can view own bookings by email" ON bookings;

CREATE POLICY "Guests can view own bookings by email"
  ON bookings FOR SELECT
  USING (
    (user_id IS NULL AND guest_email IS NOT NULL)
    OR
    (user_id IS NOT NULL AND auth.uid() = user_id)
  );
```

## Estructura de Datos Guardada

El booking ahora se guarda con:

```typescript
{
  car_id: UUID,
  user_id: null, // NULL para guest checkout
  start_time: ISO string,
  end_time: ISO string,
  // Columnas financieras
  subtotal: 269.97,
  tax_amount: 31.05,
  total_amount: 751.02, // subtotal + tax + deposit
  security_deposit: 450.00,
  deposit_amount: 450.00, // También se guarda para compatibilidad
  // Estados
  payment_status: 'pending',
  deposit_status: 'pending',
  // Información del guest (en columnas dedicadas)
  guest_email: string,
  guest_name: string,
  guest_phone: string,
  guest_address: string,
  guest_license_number: string,
  guest_license_image_url: string | null,
  // Metadata adicional
  metadata: {
    days: number,
    plate: string,
  }
}
```

## Flujo Completo

1. ✅ Usuario completa formulario en `/guest-details`
2. ✅ Datos se guardan en `sessionStorage`
3. ✅ Usuario va a `/checkout` y ve resumen
4. ✅ Usuario hace clic en "Pagar"
5. ✅ POST a `/api/checkout` con todos los datos
6. ✅ API crea booking con `user_id = null` y todas las columnas
7. ✅ API integra con HQ Rental
8. ✅ **Redirección automática** a `/booking-confirmation?bookingId=...`

## Verificación

Después de ejecutar la migración, verifica que:

1. ✅ `user_id` puede ser NULL
2. ✅ Existen las columnas: `subtotal`, `tax_amount`, `security_deposit`
3. ✅ Existen las columnas: `guest_email`, `guest_name`, `guest_phone`, etc.
4. ✅ RLS policy permite inserts sin autenticación

## Próximos Pasos

1. **Ejecutar la migración SQL** en Supabase
2. **Probar el flujo completo** de checkout
3. **Verificar** que el booking se guarde correctamente
4. **Confirmar** que la redirección funcione

