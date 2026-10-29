# Fuentes de la ficha técnica y el manual

Los PDF de `entregables/` se generan con HTML y CSS en el estilo de la plantilla de tesis UNSIS: portada con filetes, índice general y capítulos numerados. La tipografía es Latin Modern, la misma de LaTeX.

| Ruta | Contenido |
|---|---|
| `docs/ficha-tecnica.html`, `docs/manual-implementacion.html` | Texto de cada documento |
| `docs/tesis.css`, `docs/tesis.js` | Estilo de página, numeración de capítulos y figuras, e índice |
| `diagramas/diagramas.html` | Diagramas de arquitectura, secuencia y errores (SVG generado con JS) |
| `capturas_doc.py` | Recortes de las capturas de `documentacion/img/` con el recuadro rojo |
| `docimg/` | Diagramas y recortes ya generados |

## Regenerar

Requiere Google Chrome y, en esta carpeta, `npm install puppeteer-core`.

```bash
python3 capturas_doc.py                                   # recortes → docimg/
node render.js diagramas diagramas/diagramas.html docimg  # diagramas → docimg/
node render.js pdf docs/ficha-tecnica.html ../../entregables/02-Ficha-tecnica.pdf
node render.js pdf docs/manual-implementacion.html ../../entregables/03-Manual-implementacion.pdf
```

Las coordenadas de `capturas_doc.py` se miden sobre la captura reducida a 2000 px de ancho.
