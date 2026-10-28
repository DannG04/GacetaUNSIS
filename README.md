# El Unsito — Gaceta Universitaria UNSIS

Sitio estático de noticias universitarias integrado con AWS Lambda, Amazon S3 y DynamoDB.

## Contenido

- index.html, css/, js/ e imagenes/: sitio web.
- error.html: página de error del alojamiento estático.
- lambdas/: código de las Lambda: agregar, obtener (lista y ?id=), prefirmar-noticia (cors v2), procesar-imagen (disparador S3) y el respaldo prefirmadas-original.
- [INTEGRACION-S3.md](INTEGRACION-S3.md): despliegue y permisos del flujo actual.
- [PENDIENTES-EQUIPO3.md](PENDIENTES-EQUIPO3.md): diagnóstico y trabajo pendiente de monitoreo y resiliencia.
- [documentacion/MANUAL-IMPLEMENTACION.md](documentacion/MANUAL-IMPLEMENTACION.md): manual paso a paso en consola con capturas; ficha técnica, bitácora y matriz de pruebas en documentacion/.
- pruebas/: eventos S3 de prueba para la procesadora.

## Vista local

Desde la raíz del proyecto:

```bash
python3 -m http.server 8000
```

Abre http://localhost:8000. Las operaciones de noticias usan los endpoints AWS configurados en js/main.js; el origen local necesita autorización CORS para esas operaciones. Ejecuta pruebas de publicación solo sobre el entorno correspondiente.

## Despliegue

Sube index.html, error.html, css/, js/ e imagenes/ al bucket del sitio conservando las rutas. El código de lambdas/ se despliega por separado en las funciones correspondientes. No subas documentación ni código de Lambda al bucket público del sitio.

Los endpoints y nombres de recursos actuales corresponden al entorno del proyecto. No contienen claves AWS; la autorización de publicación se debe controlar en el backend. La integración S3 → Lambda, la alarma de errores y las pruebas de resiliencia P01–P08 están implementadas y documentadas con capturas en documentacion/ y evidencias/.
