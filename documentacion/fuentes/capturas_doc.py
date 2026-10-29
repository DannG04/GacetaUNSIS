# Recortes para los documentos: coordenadas en la vista de 2000 px de ancho.
import os
from PIL import Image, ImageDraw
IMG = '/home/pruebas1/Documentos/GacetaUNSIS/documentacion/img/'
OUT = os.path.dirname(os.path.abspath(__file__)) + '/docimg/'
RED = (215, 25, 32)

def part(src, crop, boxes=()):
    im = Image.open(IMG + src + '.png').convert('RGB')
    s = max(1.0, im.width / 2000)
    c = [round(v * s) for v in crop]
    im = im.crop(c)
    d = ImageDraw.Draw(im)
    w = max(4, round(im.width * 0.004)); pad = w + 3
    for b in boxes:
        x0, y0, x1, y1 = [round(v * s) for v in b]
        x0 = max(x0 - c[0] - pad, w // 2); y0 = max(y0 - c[1] - pad, w // 2)
        x1 = min(x1 - c[0] + pad, im.width - w // 2 - 1); y1 = min(y1 - c[1] + pad, im.height - w // 2 - 1)
        d.rounded_rectangle((x0, y0, x1, y1), radius=w * 2, outline=RED, width=w)
    return im

def save(name, *parts):
    if len(parts) == 1:
        im = parts[0]
    else:  # apila sin escalar, separadas por una línea gris
        W = max(p.width for p in parts); gap = 14
        im = Image.new('RGB', (W, sum(p.height for p in parts) + gap * (len(parts) - 1)), 'white')
        y = 0
        for i, p in enumerate(parts):
            im.paste(p, (0, y)); y += p.height
            if i < len(parts) - 1:
                ImageDraw.Draw(im).line((0, y + gap // 2, W, y + gap // 2), fill=(200, 200, 200), width=2); y += gap
    im.save(OUT + name + '.png', optimize=True); print(name, im.size)

save('variables', part('lambda/08b-variables-entorno', (250,540,800,628), [(252,570,795,626)]))
save('disparador', part('s3/09-trigger-s3', (290,545,725,748), [(298,552,712,745)]))
save('notificacion', part('s3/11-notificacion-evento', (870,682,1612,726), [(874,704,1608,724)]))
save('reintentos', part('lambda/13-invocacion-asincrona', (240,440,1000,612), [(250,514,432,596)]))
save('retencion', part('cloudwatch/12-retencion-logs', (183,62,800,305), [(192,240,300,268)]))
save('alarma-config', part('cloudwatch/14a-alarma-condiciones', (1400,120,1980,520), [(1553,242,1688,283), (1410,318,1530,344), (1410,404,1580,452)]))
save('politica', part('iam/29-politica-minima-json', (205,135,800,630), [(208,606,545,626)]))
save('rol',
     part('iam/31-rol-creado', (560,95,1060,130), [(562,103,826,125)]),
     part('iam/31-rol-creado', (565,425,1100,482), [(575,448,1060,476)]))
save('p01-logs', part('cloudwatch/16-p01-logs', (180,150,910,335), [(388,235,800,291), (650,314,905,332)]))
save('p02-item', part('dynamodb/17-p02-item', (30,280,1315,890), [(55,388,1015,428), (55,782,1015,826)]))
save('p03',
     part('errores/19-p03-validacion', (362,372,760,400), [(366,377,600,396)]),
     part('errores/19-p03-validacion', (392,779,1020,833), [(394,812,1016,831)]))
save('p04', part('errores/20-p04-reintentos', (180,150,900,485), [(214,234,898,251),(214,317,898,334),(214,400,898,418)]))
save('p05-errores', part('cloudwatch/21-p05-metrica-errors', (1068,492,1409,672), [(1078,650,1172,668)]))
save('p05-asinc', part('cloudwatch/21-p05-metrica-errors', (722,885,1062,1064), [(732,1043,945,1061)]))
save('p06-alarma', part('cloudwatch/22-p06-alarma', (812,300,1356,470), [(820,331,1078,386)]))
save('p06-grafico', part('cloudwatch/23-p06-recuperacion', (1180,100,1985,420), [(1470,336,1666,366), (1900,132,1980,150)]))
save('p07',
     part('errores/24-p07-duplicado', (362,372,760,400), [(366,377,600,396)]),
     part('errores/24-p07-duplicado', (392,737,1020,836), [(394,792,1016,814)]))
save('p08', part('lambda/25-p08-pendiente', (20,893,760,1030), [(24,972,700,1026)]))
save('saldo', part('costos/26-saldo-final', (30,690,900,900), [(44,764,200,816), (44,844,145,890)]))
