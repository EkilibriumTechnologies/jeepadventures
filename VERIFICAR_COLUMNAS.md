# ✅ Verificación de Columnas en bookings

## 📋 Columnas Requeridas (según migración)

Las siguientes columnas DEBEN existir en la tabla `bookings`:

1. ✅ `subtotal` - DECIMAL(10,2) - Renta antes de impuestos
2. ✅ `tax_amount` - DECIMAL(10,2) - IVU 11.5%
3. ✅ `total_amount` - DECIMAL(10,2) - Subtotal + Tax
4. ✅ `deposit_amount` - DECIMAL(10,2) - Depósito $450 (⚠️ NO es `security_deposit`)
5. ✅ `payment_status` - VARCHAR(20) - Estado del pago
6. ✅ `deposit_status` - VARCHAR(20) - Estado del depósito

## 🔍 Verificar en Supabase

Ejecuta este SQL en Supabase SQL Editor para verificar:

```sql
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookings'
AND column_name IN (
    'subtotal',
    'tax_amount',
    'total_amount',
    'deposit_amount',
    'payment_status',
    'deposit_status'
)
ORDER BY column_name;
```

Deberías ver 6 filas. Si falta alguna, ejecuta `migration_bookings_all_columns.sql`.

## 📝 Nombres Exactos en el Código

El objeto `bookingData` usa estos nombres (deben coincidir EXACTAMENTE):

```javascript
{
  subtotal: number,        // ✅ Coincide con columna 'subtotal'
  tax_amount: number,      // ✅ Coincide con columna 'tax_amount'
  total_amount: number,    // ✅ Coincide con columna 'total_amount'
  deposit_amount: number,  // ✅ Coincide con columna 'deposit_amount'
  payment_status: string,  // ✅ Coincide con columna 'payment_status'
  deposit_status: string,  // ✅ Coincide con columna 'deposit_status'
}
```

## ⚠️ Nota Importante

- **NO usar** `security_deposit` - La columna se llama `deposit_amount`
- Los nombres son **case-sensitive** en PostgreSQL
- Usar **snake_case** para nombres de columnas

