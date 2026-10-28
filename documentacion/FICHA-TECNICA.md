# Ficha técnica — Equipo 3

Valores obtenidos de la consola el 2026-10-27. Cuenta 216728240051 (plan gratuito con créditos, no Learner Lab).

| Recurso | Nombre | ARN / URL | Rol / notas |
|---|---|---|---|
| Región | us-east-2 (Ohio) | — | — |
| Bucket sitio | 906-unsis-daniel | http://906-unsis-daniel.s3-website.us-east-2.amazonaws.com | Hosting estático |
| Bucket imágenes | mis-noticias-daniel-imagenes-906-2026 | arn:aws:s3:::mis-noticias-daniel-imagenes-906-2026 | Privado; prefijos imagenes/ y pendientes/ |
| Tabla | noticias | arn:aws:dynamodb:us-east-2:216728240051:table/noticias | Clave id (String) |
| Lambda prefirmadas | cors | arn:aws:lambda:us-east-2:216728240051:function:cors · https://krveeq3gnhqdy3r3kuyfhubrim0olhaw.lambda-url.us-east-2.on.aws/ | |
| Lambda agregar | agregarNoticia | https://ufepu6szpto7mzedlr4isb3uiu0rzubq.lambda-url.us-east-2.on.aws/ | Solo noticias sin imagen |
| Lambda obtener | obtenerNoticias | https://kewecagxxd44porzgzstv37g5q0nsays.lambda-url.us-east-2.on.aws/ | Lista y ?id= |
| Lambda procesadora | procesar-imagen-noticia | arn:aws:lambda:us-east-2:216728240051:function:procesar-imagen-noticia | procesar-imagen-noticia-rol (mínimo privilegio, desde el 28 oct.; antes PowerUserRole) · Node.js 24.x · 30 s · disparador S3 imagenes/ · 2 reintentos, 1 h |
| Log group | /aws/lambda/procesar-imagen-noticia | | Retención 3 días |
| Alarma | gaceta-procesadora-errores | arn:aws:cloudwatch:us-east-2:216728240051:alarm:gaceta-procesadora-errores | Errors Suma ≥ 1 · 1 min · 1/1 · datos faltantes = correctos · sin acciones |
| SQS (opcional) | — | | No configurado |
| SNS (opcional) | — | | No configurado |

## Contrato del pendiente (`pendientes/ID.json`)

```json
{ "id": "uuid v4", "titulo": "≤180", "detalle": "≤30000", "fecha": "AAAA-MM-DD",
  "categoria": "≤60", "alt": "≤300", "imagenKey": "imagenes/ID/foto.jpg|png|webp",
  "solicitadoEn": "ISO-8601" }
```

## Decisiones de diseño

| Tema | Decisión |
|---|---|
| Noticias sin imagen | Siguen por la Lambda agregar (HTTP síncrono); no generan evento S3. |
| Estado de publicación | `obtener?id=` con GetItem: `pendiente` o `publicada`. La web consulta 10 veces cada 2 s. |
| Id repetido | `attribute_not_exists(id)`: se conserva el primer registro y se registra `duplicado`. |
| Validación fallida | Terminal: se registra `validacion_fallida`, no se relanza (reintentar no lo corrige). |
| Fallo operativo (S3/DynamoDB) | Se relanza: incrementa Errors y activa 2 reintentos asíncronos. |
| Ciclos | La procesadora no escribe en S3; el disparador se limita a `imagenes/`. |
| Pendientes | Caducan a los 7 días por regla de ciclo de vida (opcional). |
| Flujo anterior `?file=` | Se mantiene en prefirmadas; la procesadora ignora claves sin formato `imagenes/ID/foto.ext`. |

## Permisos (PowerUserRole: PowerUserAccess + política insertada URLprefirmada)

| Componente | Necesario |
|---|---|
| Prefirmadas | s3:PutObject en imagenes/* y pendientes/* |
| Procesadora (rol propio) | s3:GetObject en pendientes/*; s3:ListBucket limitado a pendientes/; dynamodb:PutItem en noticias; logs solo de su grupo. Política: documentacion/iam/procesadora-politica.json |
| Obtener | dynamodb:Scan y GetItem; s3:GetObject en imagenes/*; logs |
| S3 → Lambda | Política basada en recursos lambda:InvokeFunction con SourceArn del bucket (la crea la consola) |
| CORS | Prefirmadas: POST + header content-type. Bucket: PUT + Content-Type. CORS no es autorización. |

La procesadora ya usa el rol propio `procesar-imagen-noticia-rol`. `cors`, `agregarNoticia` y `obtenerNoticias` siguen con `PowerUserRole`, cuyo `PowerUserAccess` es más amplio de lo necesario; para un entorno real, cada una debería tener su propio rol mínimo.

Etiquetas (`proyecto=NoticiasAWS`, `equipo=3`, `entorno=Laboratorio`): procesadora, su rol y la alarma.
