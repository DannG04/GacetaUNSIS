# Entregables — Equipo 3: Monitoreo y resiliencia

Gaceta Universitaria «El Unsito» · Universidad de la Sierra Sur · Tecnologías de la Información I  
Docente: M.C.C. Eliezer Alcazar Silva  
Integrantes: Daniel González Ruiz, Mayra Castellanos Pacheco, Gael Eduardo García Pinacho y Elisa Sánchez Martínez

| Archivo | Contenido |
|---|---|
| 01-Presentacion-Equipo3.pptx | Presentación para exponer ante el grupo (20 diapositivas, con notas del orador) |
| 01-Presentacion-Equipo3.pdf | La misma presentación en PDF |
| GUION-EXPOSICION.md | Qué decir en cada diapositiva y reparto sugerido |
| 02-Ficha-tecnica.pdf | Problema, objetivo, arquitectura, monitoreo, manejo de fallos, pruebas, seguridad, costos y conclusiones |
| 03-Manual-implementacion.pdf | Pasos en la consola de AWS con capturas y las pruebas P01–P08 |
| diagramas/ | Diagramas de arquitectura, secuencia y manejo de errores en alta resolución |
| codigo/ | Lambdas, main.js del sitio y la política IAM mínima |

Las fuentes para regenerar la ficha y el manual están en `documentacion/fuentes/`.

## Cumplimiento de la rúbrica

**Alcance del Equipo 3**

| Requisito | Dónde se demuestra |
|---|---|
| Conectar el evento de S3 con Lambda y quitar la llamada posterior a la carga | Ficha, cap. 2 · Manual, cap. 2 y P01–P02 · Diapositivas 5–9 |
| Identificar los logs de la Lambda y registrar errores sin secretos | Ficha, 3.1 · Manual, 3.1 y P01 · Diapositiva 8 |
| Señal observable | Métrica `Errors` y alarma: Ficha, 3.1 · Manual, 3.2, P05 y P06 · Diapositivas 13–14 |
| Qué hacer ante carga fallida, imagen sin metadatos y error en DynamoDB | Ficha, 3.2 · Diapositiva 10 |
| Ampliación opcional SQS/DLQ | No implementada; se declara como pendiente |

**Entregables (sección 8)**

| Entregable | Dónde |
|---|---|
| Problema, objetivo y diagrama del flujo | Ficha, caps. 1 y 2 |
| Pasos reproducibles, región y nombres de recursos | Manual, caps. 1–3 · Ficha, 2.3 |
| Permisos IAM y mínimo privilegio | Ficha, 4.1 · Manual, 3.3 · Diapositiva 17 |
| Prueba exitosa y casos de error | Manual, cap. 4 · Ficha, 3.3 · Diapositivas 9–16 |
| Costos, límites y recursos por eliminar | Ficha, 4.2–4.3 · Manual, cap. 5 · Diapositiva 18 |
| Conclusiones | Ficha, cap. 5 · Diapositiva 19 |
