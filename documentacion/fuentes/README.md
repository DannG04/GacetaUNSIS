# Fuentes de la ficha técnica y el manual

Los PDF de `entregables/` se generan con HTML y CSS en formato de informe técnico: portada institucional de la UNSIS y secciones numeradas que fluyen sin capítulos ni índices (el manual lleva un contenido breve al inicio). La tipografía es Latin Modern, la misma de LaTeX.

| Ruta | Contenido |
|---|---|
| `docs/ficha-tecnica.html`, `docs/manual-implementacion.html` | Texto de cada documento |
| `docs/documento.css`, `docs/documento.js` | Estilo de página y numeración corrida de secciones, figuras y tablas |
| `diagramas/diagramas.html` | Diagramas de arquitectura, secuencia y errores (SVG generado con JS) |
| `capturas_doc.py` | Recortes de las capturas de `documentacion/img/` con el recuadro rojo (ficha técnica) |
| `capturas_manual.py` | Capturas amplias del manual (`docimg/m-*.png`): pantalla casi completa y recuadro rojo |
| `docimg/` | Diagramas y recortes ya generados |

## Regenerar

Requiere Google Chrome y el paquete de Python `websockets`. `render.py` controla Chrome por el protocolo DevTools.

```bash
python3 capturas_doc.py                                   # recortes → docimg/
python3 capturas_manual.py                                # capturas del manual → docimg/m-*.png
python3 render.py diagramas diagramas/diagramas.html docimg  # diagramas → docimg/
python3 render.py pdf docs/ficha-tecnica.html ../../entregables/02-Ficha-tecnica.pdf
python3 render.py pdf docs/manual-implementacion.html ../../entregables/03-Manual-implementacion.pdf
```

Las coordenadas de `capturas_doc.py` se miden sobre la captura reducida a 2000 px de ancho.

Los diagramas de `docimg/` también se usan en las diapositivas 5, 6 y 10 de la presentación.

El código del manual no se copia a mano: `documento.js` lo inserta al generar el PDF desde `entregables/codigo/` y `pruebas/` (elementos `<div class="codigo" data-src=… data-lineas=…>`), así que el PDF siempre muestra el código entregado.
