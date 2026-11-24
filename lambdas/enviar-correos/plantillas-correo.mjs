// Plantillas HTML de los correos de El Unsito.
// Los clientes de correo no ejecutan JavaScript ni cargan hojas externas: todo el diseño
// es HTML de tablas con CSS en línea; el bloque <style> solo agrega mejoras (móvil y modo oscuro).

const C = {
  rojo: '#79170F', rojoProfundo: '#5A0F09', rojoTenue: '#F8ECEA', sobreRojo: '#F3DDD9',
  maiz: '#E8A92C', azul: '#1D4E6E', tinta: '#1E1918', piedra: '#5A504E', linea: '#E4DEDC',
  cal: '#F6F3F2', blanco: '#FFFFFF', sobrePie: '#D9C9C6',
  exito: '#1F6E3D', exitoFondo: '#E6F2EA', error: '#B3261E', errorFondo: '#FCEBEA',
  aviso: '#8A5200', avisoFondo: '#FDF1DC'
};
const TITULOS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const TEXTO = "Georgia, 'Times New Roman', Times, serif";
const ZONA = 'America/Mexico_City';

export const escapar = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const limpiarAsunto = t => { const s = String(t).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim(); return s.length > 99 ? `${s.slice(0, 98)}…` : s; };

function fechaLarga(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return '';
  const f = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
  return f.charAt(0).toUpperCase() + f.slice(1);
}
function fechaHora(valor) {
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return String(valor || '');
  return `${new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'medium', timeZone: ZONA }).format(d)} (hora del centro de México)`;
}

// Párrafos del detalle hasta ~900 caracteres, sin cortar palabras.
function extracto(detalle, limite = 900) {
  const parrafos = String(detalle || '').split(/\n\s*\n|\n/).map(p => p.trim()).filter(Boolean);
  const salida = []; let total = 0;
  for (const p of parrafos) {
    if (total + p.length > limite) {
      const resto = limite - total;
      if (resto > 120 || !salida.length) salida.push(`${p.slice(0, Math.max(resto, 120)).replace(/\s+\S*$/, '')}…`);
      return { parrafos: salida, recortado: true };
    }
    salida.push(p); total += p.length;
  }
  return { parrafos: salida, recortado: false };
}

// Botón «a prueba de balas»: tabla + enlace con relleno, se ve igual en Outlook.
function boton(texto, url, fondo = C.rojo, colorTexto = C.blanco) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
  <tr><td class="boton" align="center" bgcolor="${fondo}" style="border-radius:3px;background:${fondo};">
    <a href="${escapar(url)}" target="_blank" style="display:inline-block;padding:15px 30px;font-family:${TITULOS};font-size:16px;font-weight:700;line-height:20px;color:${colorTexto};text-decoration:none;border-radius:3px;letter-spacing:.2px;">${escapar(texto)}&nbsp;&rarr;</a>
  </td></tr></table>`;
}

function documento({ titulo, preencabezado, cuerpo, fondo = C.cal }) {
  return `<!doctype html>
<html lang="es-MX" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapar(titulo)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  body { margin:0 !important; padding:0 !important; width:100% !important; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  a { color:${C.rojo}; }
  .boton a:hover { opacity:.9; }
  @media only screen and (max-width:620px) {
    .contenedor { width:100% !important; }
    .relleno { padding-left:22px !important; padding-right:22px !important; }
    .titular { font-size:28px !important; line-height:34px !important; }
    .portada-texto { font-size:30px !important; line-height:36px !important; }
    .columna { display:block !important; width:100% !important; }
    .oculto-movil { display:none !important; }
  }
  @media (prefers-color-scheme: dark) {
    .fondo { background:#141110 !important; }
    .tarjeta { background:#1F1A19 !important; }
    .texto { color:#EDE6E4 !important; }
    .texto-suave { color:#BFB4B1 !important; }
    .linea { border-color:#3A3230 !important; }
    .panel { background:#2A2321 !important; }
  }
</style>
</head>
<body class="fondo" style="margin:0;padding:0;background:${fondo};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${fondo};opacity:0;">${escapar(preencabezado)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" class="fondo" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${fondo};">
<tr><td align="center" style="padding:28px 12px 40px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" class="contenedor" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
${cuerpo}
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body></html>`;
}

// Cabecera tipo «periódico»: franja roja con escudo, nombre y fecha de edición.
function cabecera({ sitio, logo, edicion, etiqueta = 'Noticias de la UNSIS' }) {
  return `<tr><td style="background:${C.maiz};height:6px;line-height:6px;font-size:6px;border-radius:6px 6px 0 0;">&nbsp;</td></tr>
<tr><td class="relleno" bgcolor="${C.rojo}" style="background:${C.rojo};padding:22px 36px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="64" valign="middle" style="width:64px;">
      <a href="${escapar(sitio)}" target="_blank" style="text-decoration:none;">
        <img src="${escapar(logo)}" width="56" height="56" alt="Escudo de la UNSIS" style="display:block;width:56px;height:56px;border-radius:50%;background:${C.blanco};border:3px solid ${C.blanco};">
      </a>
    </td>
    <td valign="middle" style="padding-left:14px;">
      <a href="${escapar(sitio)}" target="_blank" style="text-decoration:none;">
        <span style="display:block;font-family:${TITULOS};font-size:26px;line-height:28px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${C.blanco};">El Unsito</span>
        <span style="display:block;font-family:${TITULOS};font-size:13px;line-height:18px;color:${C.sobreRojo};letter-spacing:.4px;">${escapar(etiqueta)}</span>
      </a>
    </td>
    <td class="oculto-movil" align="right" valign="middle" style="font-family:${TITULOS};font-size:12px;line-height:16px;color:${C.sobreRojo};text-transform:uppercase;letter-spacing:1px;">${escapar(edicion)}</td>
  </tr></table>
</td></tr>`;
}

function pie({ sitio, bajaUrl, motivo }) {
  return `<tr><td class="relleno" bgcolor="${C.rojoProfundo}" style="background:${C.rojoProfundo};padding:30px 36px 32px;border-radius:0 0 6px 6px;">
  <p style="margin:0 0 6px;font-family:${TITULOS};font-size:15px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${C.blanco};">El Unsito</p>
  <p style="margin:0 0 16px;font-family:${TEXTO};font-size:14px;line-height:21px;color:${C.sobrePie};">Lo que pasa en la UNSIS, contado en corto.<br>Universidad de la Sierra Sur · Guillermo Rojas Mijangos s/n, Ciudad Universitaria, Miahuatlán de Porfirio Díaz, Oaxaca.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="padding-right:18px;"><a href="${escapar(sitio)}" target="_blank" style="font-family:${TITULOS};font-size:13px;font-weight:700;color:${C.maiz};text-decoration:none;">Visitar el sitio</a></td>
    <td style="padding-right:18px;"><a href="${escapar(new URL('#noticias', sitio).href)}" target="_blank" style="font-family:${TITULOS};font-size:13px;font-weight:700;color:${C.maiz};text-decoration:none;">Más noticias</a></td>
    <td><a href="https://www.unsis.edu.mx/web/" target="_blank" style="font-family:${TITULOS};font-size:13px;font-weight:700;color:${C.maiz};text-decoration:none;">unsis.edu.mx</a></td>
  </tr></table>
  <p style="margin:20px 0 0;padding-top:16px;border-top:1px solid #7A2A22;font-family:${TITULOS};font-size:12px;line-height:18px;color:${C.sobrePie};">${escapar(motivo)}${bajaUrl ? ` <a href="${escapar(bajaUrl)}" target="_blank" style="color:${C.blanco};text-decoration:underline;">Darme de baja</a>.` : ''}</p>
</td></tr>`;
}

/**
 * Correo de noticia nueva para lectores.
 * @param {object} p noticia {id,titulo,fecha,categoria,detalle,alt}, imagenUrl, sitio, logo, bajaUrl
 */
export function correoNoticia({ noticia, imagenUrl = '', sitio, logo, bajaUrl = '' }) {
  const enlace = new URL(`#nota-${encodeURIComponent(noticia.id)}`, sitio).href;
  const { parrafos, recortado } = extracto(noticia.detalle);
  const fecha = fechaLarga(noticia.fecha);
  const categoria = noticia.categoria || 'General';
  const edicion = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: ZONA }).format(new Date());

  const portada = imagenUrl
    ? `<tr><td style="background:${C.tinta};line-height:0;font-size:0;">
        <a href="${escapar(enlace)}" target="_blank"><img src="${escapar(imagenUrl)}" width="600" alt="${escapar(noticia.alt || noticia.titulo)}" style="display:block;width:100%;max-width:600px;height:auto;"></a>
      </td></tr>`
    : `<tr><td class="relleno" bgcolor="${C.azul}" style="background:${C.azul};background-image:linear-gradient(135deg,${C.azul} 0%,#123247 100%);padding:46px 36px;">
        <p style="margin:0 0 10px;font-family:${TITULOS};font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${C.maiz};">${escapar(categoria)}</p>
        <p class="portada-texto" style="margin:0;font-family:${TITULOS};font-size:38px;line-height:42px;font-weight:800;color:${C.blanco};">Nueva en El Unsito</p>
      </td></tr>`;

  const cuerpoTexto = parrafos.map((p, i) => `<p class="texto" style="margin:0 0 18px;font-family:${TEXTO};font-size:${i === 0 ? 19 : 17}px;line-height:${i === 0 ? 30 : 28}px;color:${C.tinta};">${escapar(p)}</p>`).join('\n');

  const html = documento({
    titulo: noticia.titulo,
    preencabezado: `${categoria} · ${parrafos[0] || noticia.titulo}`.slice(0, 140),
    cuerpo: `${cabecera({ sitio, logo, edicion })}
${portada}
<tr><td class="relleno tarjeta" bgcolor="${C.blanco}" style="background:${C.blanco};padding:34px 36px 8px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td bgcolor="${C.rojo}" style="background:${C.rojo};padding:5px 10px;border-radius:2px;font-family:${TITULOS};font-size:11px;line-height:14px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.blanco};">${escapar(categoria)}</td>
    <td style="padding-left:12px;font-family:${TITULOS};font-size:13px;line-height:16px;color:${C.piedra};" class="texto-suave">${escapar(fecha)}</td>
  </tr></table>
  <h1 class="titular texto" style="margin:18px 0 14px;font-family:${TITULOS};font-size:34px;line-height:40px;font-weight:800;letter-spacing:-.4px;color:${C.tinta};">${escapar(noticia.titulo)}</h1>
  <p class="texto-suave" style="margin:0 0 24px;font-family:${TITULOS};font-size:13px;line-height:18px;color:${C.piedra};text-transform:uppercase;letter-spacing:1px;">Miahuatlán de Porfirio Díaz, Oax.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="linea" style="border-top:3px solid ${C.tinta};height:1px;line-height:1px;font-size:1px;">&nbsp;</td></tr></table>
</td></tr>
<tr><td class="relleno tarjeta" bgcolor="${C.blanco}" style="background:${C.blanco};padding:22px 36px 6px;">
${cuerpoTexto}
</td></tr>
<tr><td class="relleno tarjeta" bgcolor="${C.blanco}" style="background:${C.blanco};padding:6px 36px 38px;">
  ${recortado ? `<p class="texto-suave" style="margin:0 0 20px;font-family:${TITULOS};font-size:14px;color:${C.piedra};">La nota continúa en el sitio.</p>` : ''}
  ${boton('Leer la nota completa', enlace)}
</td></tr>
<tr><td class="relleno panel" bgcolor="${C.rojoTenue}" style="background:${C.rojoTenue};padding:22px 36px;border-left:6px solid ${C.maiz};">
  <p class="texto" style="margin:0;font-family:${TEXTO};font-size:15px;line-height:23px;color:${C.tinta};"><strong style="font-family:${TITULOS};">¿Tienes una noticia del campus?</strong> Publícala desde la sección <a href="${escapar(new URL('#crear-noticia', sitio).href)}" target="_blank" style="color:${C.rojo};font-weight:700;">Crear noticia</a> de El Unsito.</p>
</td></tr>
${pie({ sitio, bajaUrl, motivo: 'Recibes este correo porque te suscribiste a las noticias de El Unsito.' })}`
  });

  const texto = [
    'EL UNSITO · Noticias de la UNSIS', '',
    `${categoria.toUpperCase()} · ${fecha}`, '',
    noticia.titulo, '='.repeat(Math.min(noticia.titulo.length, 60)), '',
    ...parrafos.flatMap(p => [p, '']),
    `Leer la nota completa: ${enlace}`, '',
    '—', 'Recibes este correo porque te suscribiste a las noticias de El Unsito.',
    bajaUrl ? `Darte de baja: ${bajaUrl}` : ''
  ].join('\n');

  return { asunto: limpiarAsunto(`📰 ${noticia.titulo}`), html, texto };
}

// Panel de alerta común para el editor.
function correoAlerta({ sitio, logo, bajaUrl, estado, colorEstado, fondoEstado, icono, titulo, resumen, filas, acciones, preencabezado, asunto, textoPlano }) {
  const edicion = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short', timeZone: ZONA }).format(new Date());
  const tabla = filas.filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v], i) => `<tr>
    <td class="linea texto-suave" valign="top" style="padding:12px 14px 12px 0;${i ? `border-top:1px solid ${C.linea};` : ''}font-family:${TITULOS};font-size:12px;line-height:18px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.piedra};width:150px;">${escapar(k)}</td>
    <td class="linea texto" valign="top" style="padding:12px 0;${i ? `border-top:1px solid ${C.linea};` : ''}font-family:${TITULOS};font-size:15px;line-height:22px;color:${C.tinta};word-break:break-word;">${escapar(v)}</td>
  </tr>`).join('');
  const botones = acciones.map(([t, u], i) => `<td style="padding:0 10px 10px 0;">${boton(t, u, i ? C.tinta : colorEstado)}</td>`).join('');

  const html = documento({
    titulo: titulo,
    preencabezado,
    cuerpo: `${cabecera({ sitio, logo, edicion, etiqueta: 'Alertas para el editor' })}
<tr><td class="relleno" bgcolor="${fondoEstado}" style="background:${fondoEstado};padding:30px 36px;border-bottom:4px solid ${colorEstado};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td valign="middle" width="56" style="width:56px;">
      <div style="width:52px;height:52px;line-height:52px;border-radius:50%;background:${colorEstado};text-align:center;font-family:${TITULOS};font-size:26px;font-weight:800;color:${C.blanco};">${icono}</div>
    </td>
    <td valign="middle" style="padding-left:16px;">
      <p style="margin:0 0 4px;font-family:${TITULOS};font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${colorEstado};">${escapar(estado)}</p>
      <p class="titular" style="margin:0;font-family:${TITULOS};font-size:26px;line-height:31px;font-weight:800;color:${C.tinta};">${escapar(titulo)}</p>
    </td>
  </tr></table>
</td></tr>
<tr><td class="relleno tarjeta" bgcolor="${C.blanco}" style="background:${C.blanco};padding:28px 36px 10px;">
  <p class="texto" style="margin:0 0 22px;font-family:${TEXTO};font-size:17px;line-height:27px;color:${C.tinta};">${escapar(resumen)}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:3px solid ${C.tinta};" class="linea">${tabla}</table>
</td></tr>
<tr><td class="relleno tarjeta" bgcolor="${C.blanco}" style="background:${C.blanco};padding:22px 36px 30px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${botones}</tr></table>
</td></tr>
${pie({ sitio, bajaUrl, motivo: 'Recibes esta alerta porque estás suscrito como editor de El Unsito.' })}`
  });
  return { asunto: limpiarAsunto(asunto), html, texto: textoPlano };
}

const consola = (region, ruta) => `https://${region}.console.aws.amazon.com/${ruta}`;

/** Correo de cambio de estado de una alarma de CloudWatch (mensaje JSON que CloudWatch envía a SNS). */
export function correoAlarma({ alarma, sitio, logo, bajaUrl = '' }) {
  const enAlarma = alarma.NewStateValue === 'ALARM';
  const region = String(alarma.AlarmArn || '').split(':')[3] || 'us-east-2';
  const nombre = alarma.AlarmName || 'Alarma';
  const dims = (alarma.Trigger?.Dimensions || []).map(d => `${d.name ?? d.Name} = ${d.value ?? d.Value}`).join(', ');
  const funcion = (alarma.Trigger?.Dimensions || []).find(d => (d.name ?? d.Name) === 'FunctionName');
  const nombreFuncion = funcion ? (funcion.value ?? funcion.Value) : '';
  const condicion = alarma.Trigger ? `${alarma.Trigger.Statistic || ''} de ${alarma.Trigger.MetricName} ${{ GreaterThanOrEqualToThreshold: '≥', GreaterThanThreshold: '>', LessThanThreshold: '<', LessThanOrEqualToThreshold: '≤' }[alarma.Trigger.ComparisonOperator] || alarma.Trigger.ComparisonOperator} ${alarma.Trigger.Threshold} en ${alarma.Trigger.Period / 60 || alarma.Trigger.Period} min` : '';
  const estados = { ALARM: 'En alarma', OK: 'Correcto', INSUFFICIENT_DATA: 'Datos insuficientes' };
  // Alarmas de API Gateway (gaceta-api-errores-5xx): mismo correo, con textos y registros de la API.
  const esApi = alarma.Trigger?.Namespace === 'AWS/ApiGateway';
  const grupoLogs = esApi ? '/aws/apigateway/gaceta-api' : nombreFuncion ? `/aws/lambda/${nombreFuncion}` : '';
  const acciones = [['Ver la alarma', consola(region, `cloudwatch/home?region=${region}#alarmsV2:alarm/${encodeURIComponent(nombre)}`)]];
  if (grupoLogs) acciones.push(['Ver los logs', consola(region, `cloudwatch/home?region=${region}#logsV2:log-groups/log-group/${encodeURIComponent(encodeURIComponent(grupoLogs))}`)]);
  const sujeto = esApi ? 'La API de la gaceta' : 'La procesadora de noticias';
  const titulo = enAlarma ? `${sujeto} está fallando` : alarma.NewStateValue === 'OK' ? `${esApi ? 'La API de la gaceta' : 'La procesadora'} se recuperó` : 'La alarma no tiene datos suficientes';
  const resumen = enAlarma
    ? esApi
      ? 'CloudWatch detectó respuestas 5xx en API Gateway: el sitio no pudo cargar, publicar o suscribir. Revisa los registros de acceso de la API y los logs de la Lambda de la ruta afectada.'
      : 'CloudWatch detectó errores en la función que guarda las noticias con imagen. Las publicaciones afectadas se reintentan automáticamente; revisa los logs si el problema continúa.'
    : alarma.NewStateValue === 'OK'
      ? 'La métrica de errores volvió a estar dentro del límite. No se requiere ninguna acción.'
      : 'La alarma no recibió datos suficientes para evaluar su estado.';
  const filas = [
    ['Alarma', nombre],
    ['Estado', `${estados[alarma.OldStateValue] || alarma.OldStateValue || '—'} → ${estados[alarma.NewStateValue] || alarma.NewStateValue}`],
    ['Función', nombreFuncion],
    ['Condición', condicion],
    ['Motivo', alarma.NewStateReason],
    ['Dimensiones', nombreFuncion ? '' : dims],
    ['Ocurrió', fechaHora(alarma.StateChangeTime)],
    ['Región', alarma.Region || region]
  ];
  return correoAlerta({
    sitio, logo, bajaUrl, titulo, resumen, filas, acciones,
    estado: estados[alarma.NewStateValue] || alarma.NewStateValue,
    colorEstado: enAlarma ? C.error : alarma.NewStateValue === 'OK' ? C.exito : C.aviso,
    fondoEstado: enAlarma ? C.errorFondo : alarma.NewStateValue === 'OK' ? C.exitoFondo : C.avisoFondo,
    icono: enAlarma ? '!' : alarma.NewStateValue === 'OK' ? '&#10003;' : '?',
    preencabezado: `${nombre}: ${alarma.NewStateReason || ''}`.slice(0, 140),
    asunto: `${enAlarma ? '🔴' : alarma.NewStateValue === 'OK' ? '🟢' : '🟡'} ${titulo}`,
    textoPlano: [`ALERTAS EL UNSITO — ${titulo}`, '', resumen, '', ...filas.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`), '', ...acciones.map(([t, u]) => `${t}: ${u}`)].join('\n')
  });
}

/** Correo de publicación rechazada por la procesadora. */
export function correoRechazo({ rechazo, sitio, logo, bajaUrl = '' }) {
  const region = 'us-east-2';
  const acciones = [
    ['Ver los logs', consola(region, `cloudwatch/home?region=${region}#logsV2:log-groups/log-group/${encodeURIComponent(encodeURIComponent('/aws/lambda/procesar-imagen-noticia'))}`)],
    ['Abrir el bucket', `https://s3.console.aws.amazon.com/s3/buckets/${encodeURIComponent(rechazo.bucket || 'mis-noticias-daniel-imagenes-906-2026')}?region=${region}&prefix=pendientes/`]
  ];
  const filas = [
    ['Motivo', rechazo.motivo],
    ['Objeto S3', rechazo.key],
    ['Noticia', rechazo.noticiaId],
    ['RequestId', rechazo.requestId],
    ['Ocurrió', fechaHora(rechazo.ocurrioEn)]
  ];
  const resumen = 'La procesadora recibió una imagen pero no pudo validar la noticia asociada, así que no la guardó. Reintentar no lo corrige: revisa el archivo de pendientes y pide al autor que vuelva a publicarla.';
  return correoAlerta({
    sitio, logo, bajaUrl, filas, acciones, resumen,
    titulo: 'Una publicación fue rechazada',
    estado: 'Requiere revisión',
    colorEstado: C.aviso, fondoEstado: C.avisoFondo, icono: '!',
    preencabezado: `Motivo: ${rechazo.motivo || ''}`.slice(0, 140),
    asunto: '🟠 Noticia rechazada por la procesadora',
    textoPlano: ['ALERTAS EL UNSITO — Una publicación fue rechazada', '', resumen, '', ...filas.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`), '', ...acciones.map(([t, u]) => `${t}: ${u}`)].join('\n')
  });
}

/** Cualquier otro mensaje del tema de alertas se muestra tal cual en el formato de alerta. */
export function correoGenerico({ asunto, mensaje, sitio, logo, bajaUrl = '' }) {
  return correoAlerta({
    sitio, logo, bajaUrl, titulo: asunto || 'Aviso del sistema', resumen: mensaje, filas: [], acciones: [],
    estado: 'Aviso', colorEstado: C.azul, fondoEstado: '#E8EFF5', icono: 'i',
    preencabezado: String(mensaje).slice(0, 140), asunto: asunto || 'Aviso de El Unsito', textoPlano: String(mensaje)
  });
}
