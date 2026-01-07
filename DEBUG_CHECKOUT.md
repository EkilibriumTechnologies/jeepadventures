# 🔍 Debug: Checkout No Redirige

## Pasos para Debuggear

### 1. Abre la Consola del Navegador
- Presiona `F12` o `Ctrl+Shift+I`
- Ve a la pestaña "Console"

### 2. Intenta Hacer Checkout
- Completa el formulario y haz clic en "Pagar"
- Observa los mensajes en la consola

### 3. Busca Estos Mensajes

**Si ves estos mensajes, el flujo está funcionando:**
- `🚀 Starting checkout process...`
- `📦 Checkout response: {success: true, bookingId: "..."}`
- `✅ Checkout successful, redirecting to confirmation...`
- `📋 Booking ID: ...`

**Si ves errores, compártelos:**
- `❌ Checkout failed: ...`
- `❌ Booking insert error: ...`
- `❌ No bookingId in response: ...`

### 4. Verifica el Servidor (Terminal)
- Revisa la terminal donde corre `npm run dev`
- Busca mensajes como:
  - `📦 Inserting booking with data: ...`
  - `✅ Booking created successfully!`
  - `❌ Booking insert error: ...`

### 5. Posibles Problemas

#### A. Error al Insertar en Base de Datos
**Síntoma:** `❌ Booking insert error` en la consola del servidor

**Solución:** 
- Verifica que ejecutaste la migración SQL completa
- Revisa que todas las columnas existan:
  - `subtotal`
  - `tax_amount`
  - `security_deposit`
  - `guest_email`, `guest_name`, etc.

#### B. No se Retorna bookingId
**Síntoma:** `❌ No bookingId in response` en la consola del navegador

**Solución:**
- Verifica que el insert fue exitoso
- Revisa que `booking.id` existe en la respuesta del servidor

#### C. Error de Redirección
**Síntoma:** Todo funciona pero no redirige

**Solución:**
- Cambié `router.push()` por `window.location.href` para forzar la redirección
- Verifica que la página `/booking-confirmation` existe

## Verificación Rápida

Ejecuta este SQL en Supabase para verificar que las columnas existen:

```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookings'
AND column_name IN ('subtotal', 'tax_amount', 'security_deposit', 'guest_email', 'guest_name')
ORDER BY column_name;
```

Deberías ver 5 filas. Si faltan columnas, ejecuta la migración SQL.

