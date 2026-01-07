# Implementación del Checkout con Server Actions

## 📋 Resumen

Se ha implementado una API route robusta (`/api/checkout`) que maneja el proceso completo de checkout para usuarios invitados (guest checkout), incluyendo:

1. ✅ Verificación de usuario existente por email
2. ✅ Creación automática de usuario con Supabase Admin API
3. ✅ Creación de booking en una sola transacción
4. ✅ Guardado de URL de licencia en el perfil

## 🗂️ Archivos Creados/Modificados

### Nuevos Archivos

1. **`lib/supabase-admin.ts`**
   - Cliente de Supabase con Service Role Key
   - Permite operaciones administrativas (crear usuarios, bypass RLS)

2. **`app/api/checkout/route.ts`**
   - API Route que procesa el checkout completo
   - Maneja verificación de usuarios y creación de bookings

3. **`app/booking-confirmation/page.tsx`**
   - Página de confirmación después del checkout exitoso

4. **`migration_add_license_image_url.sql`**
   - Script SQL para agregar columna `license_image_url` a la tabla `profiles`

### Archivos Modificados

1. **`app/checkout/page.tsx`**
   - Refactorizado para usar la nueva API route
   - Separación entre checkout de invitado y usuario autenticado

2. **`app/guest-details/page.tsx`**
   - Ya incluye soporte para `licenseImageUrl` en el formulario

## 🔧 Configuración Requerida

### 1. Variables de Entorno

Asegúrate de tener estas variables en tu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key  # ⚠️ IMPORTANTE: Solo en servidor
```

**⚠️ IMPORTANTE:** El `SUPABASE_SERVICE_ROLE_KEY` es muy sensible. NUNCA lo expongas en el cliente. Solo se usa en API routes y server actions.

### 2. Migración de Base de Datos

Ejecuta este SQL en tu Supabase SQL Editor para agregar el campo de imagen de licencia:

```sql
-- Agregar columna license_image_url a profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS license_image_url TEXT;
```

O ejecuta el archivo `migration_add_license_image_url.sql`.

### 3. Verificar Columna deposit_amount

Si aún no tienes la columna `deposit_amount` en `bookings`, ejecuta:

```sql
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
```

## 🔄 Flujo del Checkout

### Para Usuarios Invitados (Guest Checkout)

1. Usuario completa formulario en `/guest-details`
2. Usuario hace clic en "Continuar al Pago" → redirige a `/checkout`
3. Usuario hace clic en "Pagar" → se llama a `/api/checkout`
4. **API Route:**
   - Verifica si el email ya existe en `auth.users`
   - Si existe → retorna error 409 (conflict)
   - Si no existe → crea usuario con `admin.createUser()`
   - Crea/actualiza perfil con datos del conductor
   - Crea booking con todos los datos
   - Actualiza estado del vehículo a "rented"
5. Redirige a `/booking-confirmation?bookingId=xxx`

### Para Usuarios Autenticados

- Usa el flujo existente (sin cambios)
- Crea booking directamente con el `user_id` autenticado

## 📝 Estructura de la API

### POST `/api/checkout`

**Request Body:**
```typescript
{
  guestDetails?: {
    fullName: string
    email: string
    phone: string
    address: string
    licenseNumber: string
    licenseImageUrl?: string  // URL de la imagen subida a Supabase Storage
  },
  plate: string
  days: number
  rentalTotal: number
  startDate: string  // Format: "yyyy-MM-dd"
  endDate: string    // Format: "yyyy-MM-dd"
  paymentIntentId?: string  // Para futura integración con Stripe
}
```

**Response Success (201):**
```typescript
{
  success: true
  bookingId: string
  userId: string
  message: "Reserva creada exitosamente"
}
```

**Response Error (409 - Usuario existe):**
```typescript
{
  success: false
  error: "Ya existe una cuenta con este email. Por favor inicia sesión."
  userId: string  // ID del usuario existente
}
```

**Response Error (400/500):**
```typescript
{
  success: false
  error: "Mensaje de error descriptivo"
}
```

## 🔒 Seguridad

1. **Service Role Key:** Solo se usa en el servidor (API routes)
2. **Validación:** Todos los campos requeridos se validan antes de procesar
3. **RLS Policies:** El admin client puede bypass RLS cuando es necesario
4. **Passwords:** Se generan passwords seguros aleatorios para usuarios invitados

## 🚀 Próximos Pasos (Opcional)

1. **Integración con Stripe:**
   - Agregar `paymentIntentId` al crear booking
   - Actualizar estado de pago después de confirmación

2. **Envío de Email:**
   - Enviar email de confirmación al crear booking
   - Enviar email con password reset para usuarios invitados

3. **Página de Login:**
   - Crear página de login para usuarios existentes
   - Redirigir desde error 409 a login

4. **Mejoras de UX:**
   - Loading states más detallados
   - Manejo de errores más específico
   - Validación de disponibilidad de vehículo en tiempo real

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté en `.env.local`
- Reinicia el servidor de desarrollo después de agregar variables

### Error: "Could not find the 'deposit_amount' column"
- Ejecuta la migración SQL mencionada arriba

### Error: "Could not find the 'license_image_url' column"
- Ejecuta `migration_add_license_image_url.sql`

### Error 409: "Ya existe una cuenta"
- Esto es esperado. El usuario debe iniciar sesión primero
- Implementa página de login para manejar este caso

## ✅ Testing

Para probar el checkout:

1. Ve a `/rent/[plate]` y selecciona fechas
2. Completa el formulario en `/guest-details`
3. Captura foto de licencia (opcional)
4. Ve a `/checkout` y haz clic en "Pagar"
5. Deberías ser redirigido a `/booking-confirmation`

