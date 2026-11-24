# Sitio e imágenes con CloudFront

Desde el 2026-11-23, El Unsito se sirve por HTTPS desde una distribución de CloudFront. El sitio anterior (`http://906-unsis-daniel.s3-website.us-east-2.amazonaws.com`) sigue funcionando en paralelo hasta que se decida cerrarlo.

| Recurso | Valor |
|---|---|
| Distribución | `gaceta-unsis-cdn` · ID `E1HSACVXW4XMRE` |
| Dominio | https://d27gjonf76v1aq.cloudfront.net |
| Precio | Pago por uso, sin WAF (la capa gratuita de CloudFront cubre el tráfico de la gaceta) |
| Acceso a los buckets | OAC `oac-906-unsis-daniel…`, compartido por los dos orígenes |

## Orígenes y comportamientos

| Orden | Ruta | Origen | Caché |
|---|---|---|---|
| 0 | `/api/*` (desde 2026-11-24) | `gaceta-api` → `2ylmuzunr2.execute-api.us-east-2.amazonaws.com` | CachingDisabled + AllViewerExceptHostHeader |
| 1 | `/imagenes/*/foto.*` | `mis-noticias-daniel-imagenes-906-2026` (privado) | CachingOptimized |
| 2 | Predeterminada (`*`) | `906-unsis-daniel` (endpoint REST, no el de sitio web) | CachingOptimized |

- La ruta `/imagenes/*/foto.*` solo coincide con las fotos de noticias (`imagenes/<uuid>/foto.jpg|png|webp`). Las imágenes propias del sitio (`imagenes/logo-unsis.webp`, `imagenes/correo/logo.png`…) siguen saliendo del bucket del sitio.
- `pendientes/` no se puede leer por CloudFront: no coincide con ninguna ruta del bucket de imágenes y la política del bucket solo permite `imagenes/*/foto.*`.
- Objeto raíz predeterminado: `index.html`. Las respuestas 403 y 404 muestran `/error.html` con el código 404 (TTL de error: 10 s).

## Permisos

- `906-unsis-daniel`: el asistente de CloudFront agregó la instrucción `AllowCloudFrontServicePrincipal` y conservó `PublicReadGetObject`. Copias: `documentacion/cloudfront/politica-sitio-antes.json` y `politica-sitio.json`.
- `mis-noticias-daniel-imagenes-906-2026`: antes no tenía política. Ahora tiene `documentacion/cloudfront/politica-imagenes.json`, que permite `s3:GetObject` solo a esta distribución y solo sobre `imagenes/*/foto.*`. El CORS del bucket (`cors-imagenes-antes.json`) ya aceptaba cualquier origen y no se modificó.
- URL de función de `obtenerNoticias`, `agregarNoticia`, `cors` y `suscribir-noticias`: se agregó el origen `https://d27gjonf76v1aq.cloudfront.net` sin quitar el anterior.

## Cambios en Lambda

Los dos cambios son retrocompatibles: sin `CDN_URL`, cada función se comporta como antes.

- `obtenerNoticias` (`lambdas/obtener-noticias.mjs`), con la variable `CDN_URL=https://d27gjonf76v1aq.cloudfront.net`: devuelve las fotos de noticias como URLs de CloudFront, en lugar de URLs prefirmadas de una hora. Las imágenes del flujo anterior (`imagenes/<uuid>-<nombre>`) se siguen firmando.
- `enviar-correos` (`lambdas/enviar-correos/index.mjs`), con las variables `CDN_URL` y `SITIO_URL=https://d27gjonf76v1aq.cloudfront.net/`:
  - El correo usa la foto directamente desde CloudFront y ya no la copia a `906-unsis-daniel/correo/`.
  - El logo y los enlaces del correo apuntan al dominio de CloudFront.
  - **No se ha probado con un envío real**, porque mandaría correo a los suscriptores.

El frontend no cambió: usa la URL que devuelve `obtenerNoticias`.

## Al publicar cambios del sitio

CloudFront guarda en caché los archivos hasta 24 h. Después de subir archivos al bucket:

1. Cambia el `?v=` de `js/main.js` en `index.html`, como hasta ahora.
2. En CloudFront › `E1HSACVXW4XMRE` › Invalidations, crea una invalidación de `/index.html` y `/`. Si cambiaste estilos o imágenes del sitio, agrega también `/css/*` o la ruta correspondiente.

Las fotos de noticias no necesitan invalidación, porque cada una tiene un UUID distinto y nunca se reemplaza.

## Comprobación (2026-11-23)

| Ruta | Resultado |
|---|---|
| `/`, `/index.html`, `/js/main.js` | 200 desde `906-unsis-daniel`; la segunda petición devuelve `x-cache: Hit from cloudfront` |
| `/imagenes/<uuid>/foto.webp` | 200 desde el bucket privado de imágenes |
| `/pendientes/<uuid>.json`, `/no-existe.html` | 404 con `error.html` |
| Verificación previa CORS de las cuatro URL de función | Responde para el origen S3 y para el de CloudFront |
| Sitio en el navegador | 14 noticias, 7 fotos por CloudFront, ninguna imagen rota y sin errores en la consola |

## Pendiente (requiere decisión)

- **Cerrar el sitio S3 público:** quitar `PublicReadGetObject` y el alojamiento web estático de `906-unsis-daniel`. Así, el contenido solo se sirve por CloudFront. El enlace `http://…s3-website…` dejaría de funcionar, igual que las fotos de correos ya enviados que apuntan a `…s3.us-east-2.amazonaws.com/correo/…`.
- **Quitar el origen S3 del CORS:** una vez cerrado el sitio S3, quitar `http://906-unsis-daniel.s3-website…` del CORS de la API `gaceta-api` (las URL de función ya están bloqueadas).

> **2026-11-24:** la distribución tiene un segundo comportamiento, `/api/*` → origen `gaceta-api` (API Gateway), sin caché. Ver [INTEGRACION-API-GATEWAY.md](INTEGRACION-API-GATEWAY.md).
- **Alarma de errores 5xx:** las métricas de CloudFront están en us-east-1. Una alarma de 5xx necesitaría allí su propio tema SNS.
