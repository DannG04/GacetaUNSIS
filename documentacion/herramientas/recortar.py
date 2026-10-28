# Recorta el espacio vacío de las capturas (abajo y a los lados) y las guarda en PNG sin pérdida.
# Uso: python3 recortar.py evidencias documentacion/img  (un PNG reemplaza al JPG del mismo nombre)
import sys, pathlib
from PIL import Image
origen, destino = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
for img_path in sorted(origen.rglob('*.jpg')) + sorted(origen.rglob('*.png')):
    im = Image.open(img_path).convert('RGB')
    w, h = im.size
    k = w / 1090
    g = im.convert('L').load()
    paso = max(1, int(k))
    def fila(y):
        valores = [g[x, y] for x in range(0, w, paso)]
        med = sorted(valores)[len(valores) // 2]
        return med, sum(1 for v in valores if abs(v - med) > 40)
    y = h - 1
    while y > h - 40 * k and fila(y)[0] < 120: y -= 1   # barra oscura del pie
    while y > h * 0.2 and fila(y)[1] <= 8: y -= 1        # filas vacías (permite bordes)
    fondo = min(h, int(y + 18 * k))
    arriba = int(60 * k)
    def columna(x):
        valores = [g[x, yy] for yy in range(arriba, fondo, paso)]
        return max(valores) - min(valores) < 30
    x0 = 0
    while x0 < w * 0.4 and columna(x0): x0 += paso
    x1 = w - 1
    while x1 > w * 0.6 and columna(x1): x1 -= paso
    x0 = max(0, int(x0 - 12 * k)); x1 = min(w, int(x1 + 12 * k))
    salida = (destino / img_path.relative_to(origen)).with_suffix('.png')
    salida.parent.mkdir(parents=True, exist_ok=True)
    im.crop((x0, 0, x1, fondo)).save(salida, optimize=True)
