# Entregables — Equipo 3: Monitoreo y resiliencia

Gaceta Universitaria «El Unsito» · Universidad de la Sierra Sur · Tecnologías de la Información I  
Docente: M.C.C. Eliezer Alcazar Silva  
Integrantes: Daniel González Ruiz, Mayra Castellanos Pacheco, Gael Eduardo García Pinacho y Elisa Sánchez Martínez

| Archivo | Contenido |
|---|---|
| 01-Presentacion-Equipo3.pptx | Presentación para exponer ante el grupo (20 diapositivas, con notas del orador) |
| 01-Presentacion-Equipo3.pdf | La misma presentación en PDF |
| GUION-EXPOSICION.md | Qué decir en cada diapositiva y reparto sugerido |
| 02-Ficha-tecnica.pdf | Problema, objetivo, arquitectura, monitoreo, manejo de fallos, verificación, seguridad, costos y conclusiones |
| 03-Manual-implementacion.pdf | Pasos en la consola de AWS con capturas y la verificación del flujo |
| diagramas/ | Diagramas de arquitectura, secuencia y manejo de errores en alta resolución |
| codigo/ | Lambdas, main.js del sitio y la política IAM mínima |

Las fuentes para regenerar la ficha y el manual están en `documentacion/fuentes/`.

## Cumplimiento de la rúbrica

**Alcance del Equipo 3**

| Requisito | Dónde se demuestra |
|---|---|
| Conectar el evento de S3 con Lambda y quitar la llamada posterior a la carga | Ficha, sec. 2 · Manual, secs. 2–6 y 10.1 · Diapositivas 5–9 |
| Identificar los logs de la Lambda y registrar errores sin secretos | Ficha, sec. 3 · Manual, secs. 7 y 10.1 · Diapositiva 8 |
| Señal observable | Métrica `Errors` y alarma: Ficha, sec. 3 · Manual, secs. 8 y 10.4 · Diapositivas 13–14 |
| Qué hacer ante carga fallida, imagen sin metadatos y error en DynamoDB | Ficha, sec. 4 · Diapositiva 10 |
| Ampliación opcional SQS/DLQ | No implementada; se declara como pendiente |

**Entregables (sección 8)**

| Entregable | Dónde |
|---|---|
| Problema, objetivo y diagrama del flujo | Ficha, secs. 1 y 2 |
| Pasos reproducibles, región y nombres de recursos | Manual, secs. 1–9 · Ficha, sec. 2 (tabla 1) |
| Permisos IAM y mínimo privilegio | Ficha, sec. 6 · Manual, sec. 9 · Diapositiva 17 |
| Prueba exitosa y casos de error | Manual, sec. 10 «Verificación» · Ficha, sec. 5 · Diapositivas 9–16 |
| Costos, límites y recursos por eliminar | Ficha, sec. 7 · Manual, sec. 11 · Diapositiva 18 |
| Conclusiones | Ficha, sec. 8 · Diapositiva 19 |
