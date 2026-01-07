# Configuración del Sistema OTP

## ⚠️ Problema Actual

El sistema OTP está generando códigos numéricos de 6 dígitos y almacenándolos en la base de datos, pero **aún no está enviando emails automáticamente**. 

En desarrollo, el código se muestra en la consola del servidor y en la respuesta de la API (solo en modo desarrollo).

## ✅ Solución Implementada

1. **Tabla `otp_codes`** - Almacena códigos con expiración de 10 minutos
2. **API `/api/checkout/send-otp`** - Genera y almacena código
3. **API `/api/checkout/verify-otp`** - Verifica código contra la base de datos
4. **UI de verificación** - Input para código de 6 dígitos

## 🔧 Pasos para Completar la Configuración

### Paso 1: Ejecutar Migración SQL

Ejecuta este SQL en Supabase SQL Editor:

```sql
-- Crear tabla otp_codes
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_code ON otp_codes(code);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- Habilitar RLS
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can insert OTP codes"
  ON otp_codes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can verify OTP codes"
  ON otp_codes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update OTP codes"
  ON otp_codes FOR UPDATE
  USING (true);
```

O ejecuta el archivo `migration_create_otp_codes.sql`.

### Paso 2: Integrar Servicio de Email (Opciones)

#### Opción A: Usar Resend (Recomendado)

1. Instala Resend:
```bash
npm install resend
```

2. Obtén API key de [resend.com](https://resend.com)

3. Agrega a `.env.local`:
```env
RESEND_API_KEY=re_xxxxx
```

4. Modifica `app/api/checkout/send-otp/route.ts`:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Después de guardar el código en DB:
await resend.emails.send({
  from: 'Jeep Adventures <noreply@tudominio.com>',
  to: body.email,
  subject: 'Tu código de verificación',
  html: `
    <h2>Código de Verificación</h2>
    <p>Tu código de verificación es:</p>
    <h1 style="font-size: 32px; letter-spacing: 8px; text-align: center;">${otpCode}</h1>
    <p>Este código expira en 10 minutos.</p>
  `,
})
```

#### Opción B: Configurar Email Template en Supabase

1. Ve a Supabase Dashboard > Authentication > Email Templates
2. Edita el template "Magic Link" o crea uno nuevo
3. Usa la variable `{{ .Token }}` para mostrar el código
4. Configura para enviar código numérico en lugar de link

#### Opción C: Usar SendGrid, Mailgun, etc.

Similar a Resend, pero con diferentes APIs.

### Paso 3: Probar el Flujo

1. Completa el formulario de guest details
2. Haz clic en "Pagar"
3. Si el email existe, deberías ver la UI de OTP
4. Revisa la consola del servidor para ver el código (en desarrollo)
5. Ingresa el código de 6 dígitos
6. Haz clic en "Verificar y Pagar"

## 🐛 Debugging

### Ver código en desarrollo:
- Revisa la consola del servidor donde corre `npm run dev`
- El código se imprime como: `📧 OTP Code for email@example.com: 123456`

### Verificar que el código se guardó:
```sql
SELECT * FROM otp_codes 
WHERE email = 'tu-email@example.com' 
ORDER BY created_at DESC 
LIMIT 1;
```

### Limpiar códigos expirados:
```sql
DELETE FROM otp_codes 
WHERE expires_at < NOW() OR used = TRUE;
```

## 📝 Notas Importantes

- Los códigos expiran en 10 minutos
- Solo un código activo por email (los anteriores se marcan como usados)
- En producción, **NUNCA** expongas el código en la respuesta de la API
- El código se muestra en consola solo en desarrollo para facilitar testing

## 🚀 Próximos Pasos

1. ✅ Ejecutar migración SQL
2. ⏳ Integrar servicio de email (Resend recomendado)
3. ✅ Probar flujo completo
4. ⏳ Configurar dominio de email para producción

