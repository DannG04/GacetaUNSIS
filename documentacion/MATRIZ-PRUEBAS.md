# Matriz de pruebas P01–P08

Ejecutadas el 2026-10-27 (UTC) en us-east-2 desde la consola web y el sitio publicado.

| Prueba | Esperado | Hora (UTC) | noticiaId | Resultado real | Evidencia | Estado |
|---|---|---|---|---|---|---|
| P01 Imagen válida | El evento S3 activa la procesadora sin POST a agregar | 23:34:53 | d81845b4-6767-4ddd-be9f-b36492435723 | Red: POST prefirmadas, PUT S3 y GET ?id=; sin llamada a agregar. Log inicio → validado → guardado (1 561 ms) | lambda/15, cloudwatch/16 | ✅ |
| P02 Persistencia | Registro en DynamoDB, visible tras recargar | 23:35 | d81845b4-… | Elemento con origen=s3-evento; noticia visible con imagen tras recargar | dynamodb/17, lambda/18 | ✅ |
| P03 JSON ausente | validacion_fallida, sin registro | 23:41:42 | 00000000-0000-4000-8000-000000000000 | «Pendiente ausente o inválido (NoSuchKey)»; la función termina sin error | errores/19 | ✅ |
| P04 Fallo de DynamoDB | Excepción y 3 intentos | 23:45:50 · 23:46:54 · 23:48:48 | a082e96b-a1b7-40da-bade-06677ac730ca | ResourceNotFoundException en los 3 intentos, mismo requestId; recuperado a las 23:50:27 | errores/20a, 20, 20b | ✅ |
| P05 Errors | Pico en la métrica nativa | 23:45–23:48 | a082e96b-… | Errors máx. 1; eventos asíncronos: 3 recibidos y 1 eliminado | cloudwatch/21 | ✅ |
| P06 Alarma | ALARM y vuelta a OK | 23:46:42 → 23:51:42 | a082e96b-… | En modo alarma y después CORRECTO | cloudwatch/22, 23 | ✅ |
| P07 Duplicado | Un solo registro, log duplicado | 23:42:54 | d81845b4-… | Log «duplicado»; sin segundo registro | errores/24 | ✅ |
| P08 Procesamiento lento | La web muestra pendiente sin duplicar | 23:45 | a082e96b-… | 10 consultas por id y mensaje «sigue en procesamiento»; tras recuperar aparece una sola vez | lambda/25, 25b | ✅ |

Observación: un primer intento de P04 se ejecutó con la página en caché y siguió el flujo anterior. Creó el registro 8059b64e-… por HTTP, y la procesadora lo ignoró (`omitido_sin_formato`). Se repitió con la página actualizada.

Repeticiones del 28 de octubre, hechas para las capturas en alta resolución: P01 (`c544c655-5ee9-4cfc-80e5-130237631061`, sin llamada a agregar, ✅), P03 y P07 con «Probar» (mismos resultados, ✅) y P08 (`7c32f756-55cc-4555-a93a-dbc4afe843c5`, mensaje «en procesamiento»; un reintento automático la guardó tras restaurar `TABLA`, ✅).
