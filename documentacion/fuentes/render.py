# Uso: python3 render.py diagramas <html> <dirSalida>  |  python3 render.py pdf <html> <pdf>
# Controla Google Chrome por el protocolo DevTools; solo requiere el paquete «websockets».
import asyncio, base64, json, os, subprocess, sys, tempfile, time, urllib.request
import websockets

PUERTO = 9333

async def main(modo, html, salida):
    perfil = tempfile.mkdtemp()
    chrome = subprocess.Popen(['google-chrome', '--headless=new', '--no-sandbox', '--disable-gpu',
        '--allow-file-access-from-files', f'--remote-debugging-port={PUERTO}', f'--user-data-dir={perfil}', 'about:blank'],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(50):
            try:
                pestañas = json.load(urllib.request.urlopen(f'http://127.0.0.1:{PUERTO}/json'))
                ws_url = next(p['webSocketDebuggerUrl'] for p in pestañas if p['type'] == 'page'); break
            except Exception:
                time.sleep(0.2)
        async with websockets.connect(ws_url, max_size=None) as ws:
            n = 0
            async def cdp(metodo, **params):
                nonlocal n; n += 1; mi = n
                await ws.send(json.dumps({'id': mi, 'method': metodo, 'params': params}))
                while True:
                    r = json.loads(await ws.recv())
                    if r.get('id') == mi:
                        if 'error' in r: raise RuntimeError(r['error'])
                        return r['result']
            async def evaluar(expr):
                return (await cdp('Runtime.evaluate', expression=expr, returnByValue=True))['result'].get('value')
            if modo == 'diagramas':
                await cdp('Emulation.setDeviceMetricsOverride', width=1300, height=900, deviceScaleFactor=3, mobile=False)
            await cdp('Page.navigate', url='file://' + os.path.abspath(html))
            espera = 'document.readyState === "complete"' if modo == 'diagramas' else 'window.__listo === true'
            for _ in range(600):
                if await evaluar(espera): break
                await asyncio.sleep(0.2)
            else:
                raise RuntimeError('la página no terminó de cargar')
            if modo == 'diagramas':
                cajas = await evaluar('[...document.querySelectorAll(".diagrama")].map(e => { const r = e.getBoundingClientRect(); '
                                      'return {id: e.id, x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height}; })')
                for c in cajas:
                    clip = {k: c[k] for k in ('x', 'y', 'width', 'height')} | {'scale': 1}
                    img = await cdp('Page.captureScreenshot', format='png', clip=clip, captureBeyondViewport=True)
                    open(os.path.join(salida, c['id'] + '.png'), 'wb').write(base64.b64decode(img['data']))
                    print('diagrama', c['id'])
            else:
                pdf = await cdp('Page.printToPDF', preferCSSPageSize=True, printBackground=True)
                open(salida, 'wb').write(base64.b64decode(pdf['data']))
                print('pdf', salida)
    finally:
        chrome.terminate()

asyncio.run(main(*sys.argv[1:4]))
