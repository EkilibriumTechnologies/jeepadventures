# ✅ Guest Checkout - Implementación Completada

## Cambios Realizados

### 1. **API Route Simplificado (`app/api/checkout/route.ts`)**
   - ✅ **Eliminada** toda la lógica de creación/verificación de usuarios
   - ✅ **user_id** ahora es `null` para guest bookings
   - ✅ **subtotal** y **tax_amount** se guardan en `metadata` JSON (no como columnas)
   - ✅ Solo se usan columnas que existen: `total_amount`, `deposit_amount`, `payment_status`, `deposit_status`
   - ✅ Integración con HQ Rental después de crear la reserva

### 2. **Checkout Page Simplificado (`app/checkout/page.tsx`)**
   - ✅ **Eliminada** toda la lógica de autenticación y OTP
   - ✅ **Eliminado** flujo de verificación de usuarios existentes
   - ✅ Checkout directo sin necesidad de cuenta
   - ✅ Cálculo correcto de IVU (11.5%) mantenido

### 3. **Cálculo de Impuestos**
   - ✅ **Subtotal**: `rentalTotal` (antes de impuestos)
   - ✅ **IVU (11.5%)**: `subtotal * 0.115`
   - ✅ **Total Rental**: `subtotal + taxAmount`
   - ✅ **Depósito**: $450.00
   - ✅ **Total a Pagar**: `totalRental + deposit` (este es el monto que se envía a Stripe)

## ⚠️ MIGRACIÓN SQL REQUERIDA

**IMPORTANTE:** Ejecuta esta migración en Supabase SQL Editor antes de usar el checkout:

```sql
-- 1. Hacer user_id nullable (para guest bookings)
ALTER TABLE bookings 
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Agregar columna metadata (JSONB) para datos adicionales
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. Actualizar RLS policy para permitir guest bookings
DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true); -- Permitir que cualquiera cree bookings (guest checkout)
```

## Estructura de Datos

### Booking Data (solo columnas que existen):
```typescript
{
  car_id: UUID,
  user_id: null, // NULL para guest checkout
  start_time: ISO string,
  end_time: ISO string,
  total_amount: number, // Total rental (subtotal + tax)
  deposit_amount: 450.00,
  payment_status: 'pending',
  deposit_status: 'pending',
  metadata: {
    guest_email: string,
    guest_name: string,
    guest_phone: string,
    guest_address: string,
    guest_license_number: string,
    guest_license_image_url: string | null,
    subtotal: number,
    tax_amount: number,
    total_to_pay: number, // Total incluyendo depósito
    days: number,
  }
}
```

## Flujo de Checkout

1. Usuario completa formulario en `/guest-details`
2. Datos se guardan en `sessionStorage`
3. Usuario va a `/checkout`
4. Usuario hace clic en "Pagar"
5. Se envía POST a `/api/checkout` con:
   - `guestDetails` (nombre, email, teléfono, dirección, licencia)
   - `plate`, `days`, `rentalTotal` (subtotal), `startDate`, `endDate`
6. API crea booking con `user_id = null`
7. API integra con HQ Rental
8. Usuario es redirigido a `/booking-confirmation`

## Integración con HQ Rental

Después de crear la reserva exitosamente, se envía un POST a HQ Rental con:
- `brand_id: 2`
- `send_payment_request: 0` (HQ enviará su propio email)
- Datos del cliente (email, nombre, teléfono)
- Fechas y placa del vehículo
- Montos (subtotal, tax_amount, total_amount, deposit_amount)

## Próximos Pasos

1. **Ejecutar la migración SQL** en Supabase
2. **Probar el flujo completo** de checkout
3. **Verificar** que HQ Rental reciba las confirmaciones correctamente
4. **Integrar Stripe** (cuando esté listo) para procesar el pago

## Notas

- El checkout ahora es **100% guest** - no se crean usuarios en Supabase
- Los datos del guest se guardan en `metadata` JSON
- El `total_amount` en la tabla es el total del rental (subtotal + tax), NO incluye el depósito
- El depósito se guarda por separado en `deposit_amount`
- El `total_to_pay` (incluyendo depósito) se guarda en `metadata.total_to_pay`

