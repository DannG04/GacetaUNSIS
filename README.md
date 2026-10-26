# El Unsito — Gaceta Universitaria UNSIS

Sitio estático de noticias universitarias integrado con AWS Lambda, Amazon S3 y DynamoDB.

## Contenido

- index.html, css/, js/ e imagenes/: sitio web.
- error.html: página de error del alojamiento estático.
- lambdas/: código disponible de agregar y consultar noticias.
- [INTEGRACION-S3.md](INTEGRACION-S3.md): despliegue y permisos del flujo actual.
- [PENDIENTES-EQUIPO3.md](PENDIENTES-EQUIPO3.md): diagnóstico y trabajo pendiente de monitoreo y resiliencia.

## Vista local

Desde la raíz del proyecto:

```bash
python3 -m http.server 8000
```

Abre http://localhost:8000. Las operaciones de noticias usan los endpoints AWS configurados en js/main.js; el origen local necesita autorización CORS para esas operaciones. Ejecuta pruebas de publicación solo sobre el entorno correspondiente.

## Despliegue

Sube index.html, error.html, css/, js/ e imagenes/ al bucket del sitio conservando las rutas. El código de lambdas/ se despliega por separado en las funciones correspondientes. No subas documentación ni código de Lambda al bucket público del sitio.

Los endpoints y nombres de recursos actuales corresponden al entorno del proyecto. No contienen claves AWS; la autorización de publicación se debe controlar en el backend. La integración automática S3 → Lambda, alarmas y pruebas de resiliencia siguen pendientes de implementación y evidencia.
