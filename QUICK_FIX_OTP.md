# 🔧 Solución Rápida: Error "Error al generar el código"

## ⚠️ Problema

Estás viendo el error: **"Error al generar el código"**

Esto significa que la tabla `otp_codes` no existe en tu base de datos de Supabase.

## ✅ Solución (2 minutos)

### Paso 1: Abre Supabase SQL Editor

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (menú lateral izquierdo)

### Paso 2: Copia y Pega este SQL

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

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_code ON otp_codes(code);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Permitir que cualquiera pueda insertar, leer y actualizar códigos OTP
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

### Paso 3: Ejecuta el SQL

1. Haz clic en **Run** (o presiona `Ctrl+Enter`)
2. Deberías ver un mensaje de éxito

### Paso 4: Verifica que se creó

Ejecuta este query para confirmar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'otp_codes';
```

Deberías ver una fila con `otp_codes`.

### Paso 5: Prueba de nuevo

1. Recarga la página del checkout
2. Haz clic en "Pagar" nuevamente
3. El código OTP debería generarse correctamente

## 🧪 Testing en Desarrollo

En modo desarrollo, después de ejecutar la migración:

1. El código OTP se generará y se guardará en la base de datos
2. El código aparecerá **automáticamente en el input** (solo en desarrollo)
3. También se mostrará en la consola del servidor: `📧 OTP Code for email@example.com: 123456`

## 📝 Nota

El archivo completo de migración está en: `migration_create_otp_codes.sql`

