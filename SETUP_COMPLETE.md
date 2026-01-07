# ✅ Configuración Completa - Puerto Rico IVU y HQ Rental

## 🎯 Cambios Implementados

### 1. ✅ Cálculo de Impuestos (IVU 11.5%)
- **Implementado en:** `app/checkout/page.tsx` y `app/api/checkout/route.ts`
- **Tasa:** 11.5% (10.5% Estatal + 1% Municipal)
- **Desglose en UI:**
  - Renta (subtotal)
  - IVU (11.5%)
  - Subtotal (renta + IVU)
  - Depósito de Seguridad ($450)
  - Total a Pagar

### 2. ✅ Email OTP Minimalista
- **Archivo:** `lib/email.ts`
- **Formato:** Código de 6 dígitos en tamaño grande y legible
- **Remitente:** "Jeep Adventures PR <express@jeepadventurespr.com>"
- **Contenido:** Solo el código numérico, sin texto adicional innecesario

### 3. ✅ Integración con HQ Rental
- **Archivo:** `lib/hq-rental.ts`
- **Parámetros:**
  - `brand_id: 2`
  - `send_payment_request: 0` (HQ enviará su propio email)
- **Se ejecuta:** Después de crear el booking exitosamente

### 4. ✅ Migración SQL Completa
- **Archivo:** `migration_fix_bookings_complete.sql`
- **Columnas agregadas:**
  - `total_amount` (si no existe)
  - `deposit_amount` (si no existe)
  - `tax_amount` (nuevo - para IVU)
  - `subtotal` (nuevo - antes de impuestos)
  - `payment_status` (si no existe)
  - `deposit_status` (si no existe)

## 📋 Pasos para Completar la Configuración

### Paso 1: Ejecutar Migración SQL

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. SQL Editor
3. Ejecuta el archivo: `migration_fix_bookings_complete.sql`

### Paso 2: Configurar Variables de Entorno

Agrega a tu `.env.local`:

```env
# HQ Rental API (opcional - si no está configurado, el booking se crea igual)
HQ_RENTAL_API_URL=https://api.hqrental.com/bookings
HQ_RENTAL_API_KEY=your_hq_api_key_here
```

**Nota:** Si no configuras HQ Rental, el sistema funcionará normalmente pero no enviará la confirmación a HQ.

### Paso 3: Verificar Resend

Asegúrate de que estas variables estén en `.env.local`:

```env
RESEND_API_KEY=re_T358AxLo_GJGTADfaHPhxnoAVh2Su4tXB
RESEND_FROM_EMAIL=Jeep Adventures PR <express@jeepadventurespr.com>
```

## 🧪 Pruebas

1. **Cálculo de Impuestos:**
   - Renta: $89.99 × 3 días = $269.97
   - IVU (11.5%): $31.05
   - Subtotal: $300.02
   - Depósito: $450.00
   - **Total: $750.02**

2. **Email OTP:**
   - Debe mostrar solo el código de 6 dígitos
   - Formato grande y legible
   - Remitente: express@jeepadventurespr.com

3. **HQ Rental:**
   - Se ejecuta automáticamente después de crear el booking
   - No bloquea el flujo si falla (solo registra warning)

## 📝 Notas Importantes

- El depósito es **$450.00** (actualizado desde $200)
- Los impuestos se calculan sobre el subtotal de la renta (no incluyen el depósito)
- HQ Rental se llama con `send_payment_request: 0` para evitar duplicidad de emails
- El email OTP es minimalista según especificaciones

