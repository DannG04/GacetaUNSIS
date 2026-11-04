# Capturas del manual: encuadres amplios (pantalla completa sin la barra de AWS ni los paneles vacíos)
# para que se reconozca dónde está cada opción. Coordenadas en la vista reducida a 2000 px de ancho
# (en imágenes de menos de 2000 px, coordenadas nativas). Salida: docimg/m-*.png
import os
from PIL import Image, ImageDraw
BASE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.normpath(os.path.join(BASE, '..', 'img')) + '/'
OUT = os.path.join(BASE, 'docimg') + '/'
RED = (215, 25, 32)

def part(src, crop, boxes=()):
    im = Image.open(IMG + src + '.png').convert('RGB')
    s = max(1.0, im.width / 2000)
    c = [round(v * s) for v in crop]
    c = [max(0, c[0]), max(0, c[1]), min(im.width, c[2]), min(im.height, c[3])]
    im = im.crop(c)
    d = ImageDraw.Draw(im)
    w = max(4, round(im.width * 0.0035)); pad = w + 3
    for b in boxes:
        x0, y0, x1, y1 = [round(v * s) for v in b]
        x0 = max(x0 - c[0] - pad, w // 2); y0 = max(y0 - c[1] - pad, w // 2)
        x1 = min(x1 - c[0] + pad, im.width - w // 2 - 1); y1 = min(y1 - c[1] + pad, im.height - w // 2 - 1)
        d.rounded_rectangle((x0, y0, x1, y1), radius=w * 2, outline=RED, width=w)
    return im

def save(name, *parts):
    if len(parts) == 1:
        im = parts[0]
    else:  # apila a la misma anchura, separadas por una línea gris
        W = max(p.width for p in parts); gap = 18
        im = Image.new('RGB', (W, sum(p.height for p in parts) + gap * (len(parts) - 1)), 'white')
        y = 0
        for i, p in enumerate(parts):
            im.paste(p, (0, y)); y += p.height
            if i < len(parts) - 1:
                ImageDraw.Draw(im).line((0, y + gap // 2, W, y + gap // 2), fill=(190, 190, 190), width=3); y += gap
    im.save(OUT + 'm-' + name + '.png', optimize=True); print(name, im.size)

# Requisitos
save('cors-lambda', part('lambda/03-cors-prefirmadas', (0, 70, 1300, 800), [(255, 540, 600, 590), (255, 680, 1280, 780)]))
save('cors-bucket', part('s3/04-cors-bucket-imagenes', (0, 32, 1000, 56)),
     part('s3/04-cors-bucket-imagenes', (555, 838, 1620, 1190), [(595, 968, 690, 1022)]))
save('tabla', part('dynamodb/05-tabla-noticias', (0, 32, 1300, 445), [(424, 292, 520, 318), (1197, 292, 1290, 318)]))
# Paso 1
save('prefirmadas', part('lambda/07-prefirmadas-desplegada', (360, 30, 1425, 870), [(636, 508, 1075, 523), (370, 848, 452, 862)]))
# Paso 2
save('rol-confianza', part('iam/27-rol-confianza-lambda', (0, 32, 1400, 460), [(218, 150, 602, 198), (216, 352, 470, 382)]))
save('rol-nombre', part('iam/28-rol-nombre-etiquetas', (0, 32, 1540, 1000), [(216, 180, 1385, 203), (1000, 688, 1180, 707), (216, 805, 1532, 898)]))
save('politica', part('iam/29-politica-minima-json', (0, 32, 1100, 630), [(208, 606, 545, 626)]))
save('rol-creado', part('iam/31-rol-creado', (0, 32, 1665, 535), [(562, 103, 830, 125), (575, 452, 1060, 474)]))
# Paso 3
save('crear-funcion', part('lambda/08a-crear-procesadora', (0, 70, 1330, 1080), [(42, 285, 880, 312), (42, 376, 840, 402), (684, 615, 1306, 662)]))
save('procesadora', part('lambda/08-procesadora-creada', (370, 30, 1420, 870), [(640, 455, 1330, 495), (372, 842, 452, 856)]))
save('config-basica', part('iam/32-asignar-rol-procesadora', (0, 70, 1310, 775), [(42, 543, 210, 571), (42, 633, 450, 661)]))
save('variables', part('lambda/08b-variables-entorno', (0, 70, 1300, 640), [(255, 570, 1280, 625)]))
# Paso 4
save('config-trigger', part('s3/09a-config-trigger', (0, 70, 1330, 780), [(42, 245, 880, 272), (42, 380, 292, 408), (42, 458, 880, 486), (42, 654, 880, 688)]))
save('trigger', part('s3/09-trigger-s3', (0, 70, 1300, 765), [(340, 615, 710, 742)]))
save('permiso-s3', part('lambda/10-politica-invocacion-s3', (0, 440, 1300, 1375), [(300, 1020, 880, 1190)]))
save('notificacion', part('s3/11-notificacion-evento', (0, 32, 1000, 56)),
     part('s3/11-notificacion-evento', (557, 640, 1615, 728), [(570, 704, 1605, 724)]))
# Pasos 5 y 6
save('obtener', part('lambda/11b-obtener-desplegada', (370, 30, 1420, 860), [(640, 738, 1330, 800)]))
save('mainjs', part('s3/11c-subida-mainjs', (0, 32, 700, 56)),
     part('s3/11c-subida-mainjs', (548, 62, 1630, 420), [(563, 268, 700, 295), (563, 388, 640, 412)]))
# Pasos 7 a 9
save('reintentos', part('lambda/13-invocacion-asincrona', (0, 70, 1300, 620), [(255, 520, 440, 595)]))
save('retencion', part('cloudwatch/12-retencion-logs', (0, 32, 1240, 615), [(192, 240, 300, 268), (192, 278, 300, 305)]))
save('alarma-config', part('cloudwatch/14a-alarma-condiciones', (0, 32, 1390, 305), [(215, 150, 600, 290)]),
     part('cloudwatch/14a-alarma-condiciones', (1400, 115, 1985, 640),
          [(1553, 242, 1688, 283), (1410, 318, 1530, 344), (1410, 404, 1580, 452), (1410, 488, 1688, 512)]))
save('alarma-creada', part('cloudwatch/14-alarma-creada', (0, 32, 1000, 245), [(195, 206, 995, 233)]),
     part('cloudwatch/14-alarma-creada', (1000, 165, 2000, 245), [(1005, 206, 1980, 233)]))
save('etiquetas', part('costos/36-etiquetas-procesadora', (0, 70, 1310, 700), [(258, 598, 1290, 688)]))
# Verificación
save('p01-sitio', part('lambda/15-p01-publicada-sitio', (600, 0, 1390, 720), [(610, 688, 790, 705)]))
save('p01-logs', part('cloudwatch/16-p01-logs', (180, 32, 1720, 352), [(388, 235, 1712, 291), (390, 314, 1190, 332)]))
save('p02-item', part('dynamodb/17-p02-item', (30, 190, 1315, 890), [(55, 392, 1015, 428), (55, 788, 1015, 826)]))
save('p03', part('errores/19-p03-validacion', (360, 30, 1425, 850), [(366, 377, 600, 396), (392, 810, 1395, 832)]))
save('p04-tabla', part('errores/20a-p04-tabla-falla', (0, 70, 1310, 410), [(515, 237, 977, 265)]))
save('p04-reintentos', part('errores/20-p04-reintentos', (180, 32, 1180, 485),
     [(390, 214, 1170, 248), (390, 298, 1170, 332), (390, 381, 1170, 415)]))
save('p04-recuperacion', part('errores/20b-p04-recuperacion', (180, 32, 1180, 445), [(225, 288, 560, 378)]))
save('p05', part('cloudwatch/21-p05-metrica-errors', (370, 360, 1415, 1070), [(1078, 650, 1205, 668), (732, 1043, 945, 1061)]))
save('p06-alarma', part('cloudwatch/22-p06-alarma', (0, 32, 1000, 56)),
     part('cloudwatch/22-p06-alarma', (812, 302, 1357, 966), [(822, 360, 1085, 384)]))
save('p06-recuperacion', part('cloudwatch/23-p06-recuperacion', (455, 32, 2000, 780), [(1475, 342, 1662, 362), (850, 545, 1000, 572)]))
save('p07', part('errores/24-p07-duplicado', (360, 30, 1425, 840), [(366, 377, 600, 396), (392, 792, 1395, 814)]))
save('p08', part('lambda/25-p08-pendiente', (0, 0, 1130, 1030), [(24, 975, 700, 1026)]))
# Costos
save('saldo-inicial', part('costos/01-saldo-inicial', (30, 690, 1320, 985), [(44, 764, 200, 816), (44, 844, 145, 890)]))
save('saldo-final', part('costos/26-saldo-final', (30, 690, 1320, 985), [(44, 764, 200, 816), (44, 844, 145, 890)]))
# Capturas existentes agregadas en la revisión del 4 de noviembre
save('funciones', part('lambda/02-lista-funciones', (0, 32, 700, 56)),
     part('lambda/02-lista-funciones', (190, 60, 1800, 270), [(238, 166, 1380, 264)]))
save('politica-revision', part('iam/30-politica-revision', (0, 32, 1440, 545), [(218, 191, 1383, 213), (216, 398, 900, 500)]))
save('etiquetas-alarma', part('costos/37-etiquetas-alarma', (0, 32, 1000, 56)),
     part('costos/37-etiquetas-alarma', (465, 500, 1980, 765), [(478, 625, 1100, 683)]))
# Capturas nuevas tomadas el 4 de noviembre de 2026 (verificación en AWS, solo lectura)
save('asinc-editar', part('lambda/40-asinc-editar', (0, 25, 1500, 480), [(290, 140, 640, 265), (290, 335, 520, 415)]))
save('alarma-crear', part('cloudwatch/41-alarma-crear', (0, 25, 1110, 465), [(246, 176, 814, 218), (246, 420, 396, 448)]),
     part('cloudwatch/41-alarma-crear', (1500, 470, 1990, 508), [(1903, 477, 1985, 502)]))
save('alarma-metrica', part('cloudwatch/42-alarma-metrica', (40, 85, 1100, 760), [(60, 375, 300, 395), (62, 688, 560, 715)]),
     part('cloudwatch/42-alarma-metrica', (1500, 1252, 1960, 1292), [(1788, 1259, 1942, 1286)]))
save('alarma-acciones', part('cloudwatch/44-alarma-acciones', (0, 25, 1000, 790), [(246, 158, 388, 184)]),
     part('cloudwatch/44-alarma-acciones', (1500, 752, 1990, 790), [(1903, 758, 1985, 784)]))
save('alarma-sin-acciones', part('cloudwatch/45-alarma-sin-acciones', (0, 25, 1000, 52)),
     part('cloudwatch/45-alarma-sin-acciones', (770, 622, 1230, 792), [(1070, 756, 1213, 782)]))
save('alarma-nombre', part('cloudwatch/46-alarma-nombre', (0, 25, 1640, 810), [(246, 160, 1390, 202), (246, 280, 1375, 336), (246, 512, 1535, 617)]))
save('alarma-resumen', part('cloudwatch/48-alarma-vista-previa-fin', (0, 25, 1000, 52)),
     part('cloudwatch/48-alarma-vista-previa-fin', (230, 540, 1500, 1280), [(246, 575, 340, 695), (246, 750, 1410, 780), (990, 880, 1210, 915), (246, 1025, 700, 1112)]),
     part('cloudwatch/48-alarma-vista-previa-fin', (1690, 1300, 1980, 1336)))
save('logs-hoy', part('cloudwatch/49-logs-hoy', (0, 25, 1330, 620), [(224, 270, 300, 296), (224, 470, 380, 490), (995, 588, 1200, 607)]))
save('retencion-editar', part('cloudwatch/50-retencion-editar', (0, 25, 1330, 790), [(884, 690, 1310, 716)]))
save('obtener-id', part('lambda/51-obtener-id', (0, 0, 1560, 146), [(0, 52, 400, 75)]))
save('facturacion-hoy', part('costos/52-facturacion-hoy', (0, 0, 1725, 280), [(507, 95, 560, 130), (1283, 100, 1345, 132), (1036, 250, 1070, 268)]))
save('cost-explorer', part('costos/53-cost-explorer', (349, 76, 1585, 1183), [(368, 296, 470, 331), (368, 1120, 1565, 1147)]),
     part('costos/53-cost-explorer', (1743, 930, 1975, 1025), [(1745, 990, 1890, 1020)]))
save('permisos-hoy', part('lambda/54-permisos-hoy', (0, 25, 1490, 1355), [(488, 452, 645, 486), (490, 769, 1466, 849), (490, 965, 1466, 1265)]))
