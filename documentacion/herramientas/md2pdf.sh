#!/bin/bash
# Genera MANUAL-IMPLEMENTACION.html y .pdf a partir del Markdown. Ejecutar desde documentacion/.
set -e
python3 - <<'PY'
import markdown, pathlib
src = pathlib.Path('MANUAL-IMPLEMENTACION.md')
cuerpo = markdown.markdown(src.read_text(encoding='utf-8'), extensions=['tables'])
css = """
@page { size: A4; margin: 16mm 14mm; }
body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #1d1d1f; }
h1 { color: #7a1512; border-bottom: 3px solid #7a1512; padding-bottom: 6px; font-size: 20pt; }
h2 { color: #7a1512; margin-top: 28px; page-break-after: avoid; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
h3 { margin-top: 18px; page-break-after: avoid; }
img { display: block; max-width: 100%; max-height: 150mm; margin: 8px auto 14px; border: 1px solid #ccc; page-break-inside: avoid; }
table { border-collapse: collapse; width: 100%; font-size: 9pt; margin: 8px 0; }
th, td { border: 1px solid #bbb; padding: 4px 6px; text-align: left; vertical-align: top; }
th { background: #f3e9e8; }
code { background: #f4f4f4; padding: 0 3px; border-radius: 3px; font-size: 9pt; }
hr { border: none; border-top: 1px solid #ccc; margin: 22px 0; }
blockquote { border-left: 4px solid #7a1512; margin: 12px 0; padding: 4px 12px; background: #faf4f2; }
"""
pathlib.Path('MANUAL-IMPLEMENTACION.html').write_text(f"<!doctype html><html lang='es'><head><meta charset='utf-8'><title>Manual de implementación</title><style>{css}</style></head><body>{cuerpo}</body></html>", encoding='utf-8')
PY
google-chrome --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf=MANUAL-IMPLEMENTACION.pdf "file://$PWD/MANUAL-IMPLEMENTACION.html" 2>&1 | tail -1
