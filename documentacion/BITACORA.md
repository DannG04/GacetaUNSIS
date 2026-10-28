# Bitácora de sesiones — Equipo 3

| Fecha | Objetivo | Pasos realizados | Resultado | Problemas | Saldo inicial → final |
|---|---|---|---|---|---|
| 2026-10-27 | Preparar código y manual | Prefirmadas v2, procesadora S3, consulta por id, frontend asíncrono, eventos de prueba | Código listo en el repositorio | — | — |
| 2026-10-27 23:15–23:52 UTC | Implementar y probar en AWS | Diagnóstico (A), respaldo y despliegue de prefirmadas, creación de la procesadora, disparador S3, consulta por id, frontend (B), retención, reintentos y alarma (C), P01–P08 (D) | Integración funcionando; P01–P08 aprobadas | Caché del navegador con el main.js anterior: se cambió la versión del script en index.html. El primer intento de P04 siguió el flujo anterior y se repitió | 120,00 USD → 120,00 USD (gasto del mes 0,00 USD) |
| 2026-10-28 | Recapturar evidencias en alta resolución | Recaptura en 4K de las 36 pantallas; formularios abiertos y cancelados; «Probar» de P03 y P07; repetición de P01 y P08 desde el sitio; manual regenerado | Todas las capturas del manual en alta resolución | Extensión desconectada y Chrome reiniciado; la pestaña de Claude se tuvo que activar a mano | 120,00 USD → 120,00 USD |
| 2026-10-28 | Mínimo privilegio y etiquetas | Rol `procesar-imagen-noticia-rol` con la política `ProcesadoraMinimoPrivilegio`, asignado a la procesadora y verificado con P07 y P03; etiquetas en la procesadora, el rol y la alarma | Procesadora sin `PowerUserAccess` | La consola no acepta `>` en la descripción del rol | 120,00 USD → 120,00 USD |
