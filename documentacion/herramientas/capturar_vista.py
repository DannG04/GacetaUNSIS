# Captura la pantalla 4K y recorta la vista de la pestaña de Chrome, desde la barra de AWS hasta el pie.
# Uso: python3 capturar_vista.py <salida.png> [x0 x1]   (detecta la barra oscura de AWS como borde superior)
import sys, subprocess, os, tempfile
from PIL import Image
destino = sys.argv[1]
x0, x1 = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 3 else (1142, 3780)
tmp = os.path.join(tempfile.gettempdir(), 'captura-vista.png')
subprocess.run(['gnome-screenshot', '-f', tmp], check=True, env={**os.environ, 'DISPLAY': ':0'})
im = Image.open(tmp).convert('RGB'); px = im.load()
xm = (x0 + x1) // 2
top = next((y for y in range(100, 700) if sum(px[xm, y]) < 110), None)
if top is None:  # con un diálogo abierto la barra queda tapada por el velo gris
    top = int(sys.argv[4]) if len(sys.argv) > 4 else 198
while top > 0 and sum(px[xm, top - 1]) < 110:
    top -= 1
# pie oscuro de AWS: la última franja oscura por encima de la barra de tareas
fondo = next((y for y in range(2080, top, -1) if sum(px[xm, y]) < 110), 2032)
im = im.crop((x0, top, x1, fondo + 1))
os.makedirs(os.path.dirname(os.path.abspath(destino)), exist_ok=True)
im.save(destino, optimize=True)
print(destino, im.size, 'top', top)
