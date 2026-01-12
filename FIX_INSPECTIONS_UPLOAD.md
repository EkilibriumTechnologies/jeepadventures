# Fix: Inspections Upload Failures

## Problema
Las subidas de fotos de inspección final están fallando con el mensaje "Photo upload failed. Please try again."

## Causa
El bucket de almacenamiento 'inspections' no existe o no tiene las políticas de almacenamiento configuradas correctamente.

## Solución

### 1. Ejecutar la migración SQL

Ejecuta el archivo `migration_create_inspections_bucket.sql` en el SQL Editor de Supabase:

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido de `migration_create_inspections_bucket.sql`
5. Ejecuta la query

Esta migración:
- Crea el bucket 'inspections' si no existe
- Configura políticas de almacenamiento para permitir:
  - Lectura pública de fotos
  - Subida de fotos desde endpoints del servidor (usando service role key)
  - Actualización de fotos desde endpoints del servidor

### 2. Verificar variables de entorno

Asegúrate de que las siguientes variables estén configuradas en tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 3. Cambios realizados en el código

- ✅ Corregido el path de archivos en `upload-exit-inspection/route.ts` (removido el prefijo del bucket)
- ✅ Corregido el path de archivos en `upload-inspection/route.ts` (removido el prefijo del bucket)
- ✅ Corregido el path de archivos en `upload-license/route.ts` (ajustado para usar el bucket correcto)

### 4. Probar la funcionalidad

Después de ejecutar la migración:
1. Intenta subir una foto de inspección final
2. Verifica que la foto se suba correctamente
3. Verifica que la URL pública se genere correctamente

## Notas

- El bucket 'inspections' es público para permitir visualización de fotos
- Las subidas se validan en el endpoint del servidor (no en las políticas de RLS)
- El service role key permite bypassear RLS, pero las políticas están configuradas para permitir uploads públicos desde el servidor
