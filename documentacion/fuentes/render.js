// Uso: node render.js diagramas <html> <dirSalida>  |  node render.js pdf <html> <pdf>
const puppeteer = require('puppeteer-core');
const path = require('path');
(async () => {
  const [modo, html, salida] = process.argv.slice(2);
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const page = await browser.newPage();
  if (modo === 'diagramas') {
    await page.setViewport({ width: 1300, height: 900, deviceScaleFactor: 3 });
    await page.goto('file://' + path.resolve(html), { waitUntil: 'networkidle0' });
    for (const el of await page.$$('.diagrama')) {
      const id = await el.evaluate(e => e.id);
      await el.screenshot({ path: path.join(salida, id + '.png') });
      console.log('diagrama', id);
    }
  } else {
    page.on('console', m => { if (m.type() === 'error') console.log('consola:', m.text()); });
    await page.goto('file://' + path.resolve(html), { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.__listo === true, { timeout: 120000 });
    await page.pdf({ path: salida, preferCSSPageSize: true, printBackground: true });
    console.log('pdf', salida);
  }
  await browser.close();
})();
