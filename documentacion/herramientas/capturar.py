# Captura la pantalla 4K, recorta el área de contenido de la pestaña de Chrome y quita la barra de depuración.
# Uso: python3 capturar.py evidencias/<carpeta>/<nombre>.png  (Chrome en x=802..3818, y=171..2095)
import sys, subprocess, os, tempfile
from PIL import Image
destino = sys.argv[1]
tmp = os.path.join(tempfile.gettempdir(), 'captura-chrome.png')
subprocess.run(['gnome-screenshot', '-f', tmp], check=True, env={**os.environ, 'DISPLAY': ':0'})
im = Image.open(tmp).convert('RGB').crop((802, 171, 3818, 2095))
px = im.load()
filas = [sum(px[800, y]) for y in range(0, 54, 6)]
if all(735 <= v <= 755 for v in filas) and sum(px[800, 56]) < 700:
    im = im.crop((0, 58, im.width, im.height))   # barra «Claude comenzó a depurar este navegador»
os.makedirs(os.path.dirname(destino), exist_ok=True)
im.save(destino, optimize=True)
print(destino, im.size)
