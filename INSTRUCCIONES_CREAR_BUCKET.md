# Instrucciones para Crear el Bucket "licenses" en Supabase

## Problema
El error "Bucket not found" aparece porque el bucket `licenses` no existe en Supabase Storage.

## Solución

### Opción 1: Usar Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Storage** en el menú lateral
3. Haz clic en **"New bucket"** o **"Create bucket"**
4. Configura el bucket:
   - **Name**: `licenses`
   - **Public bucket**: ✅ Marca esta opción (para acceso público a las URLs)
   - **File size limit**: `5 MB` (o el límite que prefieras)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp`
5. Haz clic en **"Create bucket"**

### Opción 2: Usar SQL Editor

1. Ve a **SQL Editor** en Supabase Dashboard
2. Copia y pega el contenido del archivo `migration_create_licenses_bucket.sql`
3. Haz clic en **"Run"** o presiona `Ctrl+Enter`
4. Verifica que el bucket se creó correctamente

### Verificación

Después de crear el bucket, verifica que existe:

1. Ve a **Storage** → **Buckets**
2. Deberías ver el bucket `licenses` en la lista
3. El bucket debe estar marcado como **Public**

## Nota Importante

- El bucket debe ser **público** para que las URLs de las fotos funcionen correctamente
- El límite de tamaño recomendado es **5 MB** por archivo
- Solo se permiten tipos de imagen: JPEG, JPG, PNG, WEBP

## Después de Crear el Bucket

Una vez creado el bucket, recarga la página de "Datos del Conductor" y vuelve a intentar subir la foto de licencia. El error "Bucket not found" debería desaparecer.
