# 📧 Configuración de Resend para Envío de Emails OTP

## ✅ Implementación Completada

He integrado **Resend** para enviar los códigos OTP por email. El sistema ahora:

1. ✅ Genera el código OTP de 6 dígitos
2. ✅ Lo guarda en la base de datos
3. ✅ **Envía el código por email** usando Resend
4. ✅ Muestra el código en consola (solo en desarrollo) si el email falla

## 🔧 Configuración Requerida

### Paso 1: Crear cuenta en Resend (Gratis)

1. Ve a [https://resend.com](https://resend.com)
2. Crea una cuenta (es gratis, incluye 3,000 emails/mes)
3. Verifica tu email

### Paso 2: Obtener API Key

1. En el dashboard de Resend, ve a **API Keys**
2. Haz clic en **Create API Key**
3. Dale un nombre (ej: "Jeep Adventures Production")
4. Copia la API key (solo se muestra una vez)

### Paso 3: Configurar Dominio (Opcional para Producción)

Para producción, necesitas verificar tu dominio. Para desarrollo, puedes usar el dominio de prueba de Resend.

**Para desarrollo/pruebas:**
- Puedes usar `onboarding@resend.dev` como remitente (ya configurado)
- No necesitas verificar dominio

**Para producción:**
1. Ve a **Domains** en Resend
2. Agrega tu dominio (ej: `jeepadventures.com`)
3. Agrega los registros DNS que te proporciona Resend
4. Espera a que se verifique (puede tardar unos minutos)

### Paso 4: Agregar Variables de Entorno

Abre tu archivo `.env.local` y agrega:

```env
# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Jeep Adventures <noreply@tudominio.com>
```

**Nota:** Si no configuras `RESEND_FROM_EMAIL`, se usará `onboarding@resend.dev` por defecto (solo para desarrollo).

### Paso 5: Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl+C)
# Luego reinícialo
npm run dev
```

## 🧪 Probar el Envío

1. Ve a la página de checkout
2. Ingresa un email que ya existe en tu sistema
3. Haz clic en "Pagar"
4. Deberías recibir un email con el código OTP

## 🔍 Troubleshooting

### "Email no configurado" en consola

- Verifica que `RESEND_API_KEY` esté en `.env.local`
- Reinicia el servidor después de agregar la variable

### Email no llega

1. Revisa la carpeta de **spam**
2. Verifica los logs en Resend Dashboard > **Logs**
3. Asegúrate de que el dominio esté verificado (si usas dominio personalizado)

### Error "Invalid API Key"

- Verifica que copiaste la API key completa
- Asegúrate de que no haya espacios antes/después
- Regenera la API key si es necesario

## 📝 Notas

- En **desarrollo**, si no configuras `RESEND_API_KEY`, el código se mostrará en consola pero no se enviará email
- El código OTP sigue siendo válido aunque falle el envío del email
- Los emails tienen un diseño HTML profesional con el código destacado

## 🎨 Personalización del Email

El template del email está en `lib/email.ts`. Puedes personalizar:
- Colores y diseño
- Texto del mensaje
- Logo (agregando una imagen)

