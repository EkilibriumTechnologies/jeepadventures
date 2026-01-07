# Configuración de Variables de Entorno

## ⚠️ Error Actual

Estás viendo este error porque faltan las variables de entorno de Supabase:
```
Missing Supabase environment variables. 
NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.
```

## 🔧 Solución Rápida

### Paso 1: Crear archivo `.env.local`

Crea un archivo llamado `.env.local` en la raíz del proyecto (mismo nivel que `package.json`).

### Paso 2: Obtener las credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Settings** > **API**
3. Copia los siguientes valores:

### Paso 3: Agregar las variables al archivo `.env.local`

Abre el archivo `.env.local` y agrega:

```env
# URL de tu proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

# Clave pública/anónima (segura para el cliente)
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Clave de servicio (MANTENER SECRETO - solo servidor)
# ⚠️ NUNCA commitees esto a git
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### Paso 4: Reiniciar el servidor

Después de crear/actualizar `.env.local`:

1. **Detén el servidor** (Ctrl+C en la terminal)
2. **Reinicia el servidor**: `npm run dev`

## 📍 Dónde encontrar cada valor en Supabase

### `NEXT_PUBLIC_SUPABASE_URL`
- **Ubicación:** Settings > API > Project URL
- **Formato:** `https://xxxxxxxxxxxxx.supabase.co`
- **Ejemplo:** `https://abcdefghijklmnop.supabase.co`

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Ubicación:** Settings > API > Project API keys > `anon` `public`
- **Formato:** Una cadena larga que comienza con `eyJ...`
- **Seguridad:** ✅ Segura para exponer en el cliente (frontend)

### `SUPABASE_SERVICE_ROLE_KEY`
- **Ubicación:** Settings > API > Project API keys > `service_role` `secret`
- **Formato:** Una cadena larga que comienza con `eyJ...`
- **Seguridad:** ⚠️ **MUY SENSIBLE** - Solo para código del servidor
- **⚠️ ADVERTENCIA:** 
  - NUNCA lo expongas en el cliente
  - NUNCA lo commitees a git (ya está en `.gitignore`)
  - Solo se usa en API routes y server actions

## 📝 Ejemplo completo de `.env.local`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.example

# Stripe (opcional, si usas pagos)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

## ✅ Verificación

Después de configurar las variables y reiniciar el servidor, el error debería desaparecer.

Si aún ves el error:
1. Verifica que el archivo se llame exactamente `.env.local` (con el punto al inicio)
2. Verifica que esté en la raíz del proyecto (mismo nivel que `package.json`)
3. Verifica que no haya espacios extra o caracteres especiales
4. Reinicia el servidor completamente

## 🔒 Seguridad

- ✅ `.env.local` ya está en `.gitignore` - no se commitea a git
- ✅ `NEXT_PUBLIC_*` variables son seguras para el cliente
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` es muy sensible - nunca lo expongas

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

