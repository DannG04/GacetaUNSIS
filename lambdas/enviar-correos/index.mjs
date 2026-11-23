import { SNSClient, ListSubscriptionsByTopicCommand } from '@aws-sdk/client-sns';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { S3Client, CopyObjectCommand } from '@aws-sdk/client-s3';
import { correoNoticia, correoAlarma, correoRechazo, correoGenerico } from './plantillas-correo.mjs';

// Suscrita (sin filtro) a gaceta-noticias y gaceta-alertas-editor. SNS sigue siendo el registro
// de suscriptores; las suscripciones de correo tienen el filtro {"canal":["texto"]} y por eso
// no reciben el texto plano: esta función les envía la versión HTML por SES.
const REGION = 'us-east-2';
const REMITENTE = process.env.REMITENTE; // p. ej. "El Unsito <correo-verificado@dominio>"
const SITIO = process.env.SITIO_URL || 'http://906-unsis-daniel.s3-website.us-east-2.amazonaws.com/';
const BUCKET_SITIO = process.env.BUCKET_SITIO || '906-unsis-daniel';
const BUCKET_IMAGENES = process.env.BUCKET_IMAGENES || 'mis-noticias-daniel-imagenes-906-2026';
// Con CloudFront (CDN_URL = https://dxxxx.cloudfront.net) el logo y las fotos salen de la distribución
// y la foto ya no se copia al bucket del sitio. Sin CDN_URL se comporta como antes.
const CDN = (process.env.CDN_URL || '').replace(/\/+$/, '');
const FOTO_CDN = /^imagenes\/[0-9a-f-]{36}\/foto\.(jpg|png|webp)$/i;
const PUBLICO = CDN ? `${CDN}/` : `https://${BUCKET_SITIO}.s3.${REGION}.amazonaws.com/`;
const LOGO = process.env.LOGO_URL || `${PUBLICO}imagenes/correo/logo.png`;

const sns = new SNSClient({ region: REGION });
const ses = new SESv2Client({ region: REGION });
const s3 = new S3Client({ region: REGION });
const log = (evento, datos = {}) => console.log(JSON.stringify({ evento, funcion: 'enviar-correos', ...datos }));

async function suscriptores(topico) {
  const lista = []; let NextToken;
  do {
    const r = await sns.send(new ListSubscriptionsByTopicCommand({ TopicArn: topico, NextToken }));
    for (const s of r.Subscriptions || []) {
      // Las pendientes devuelven «PendingConfirmation» en lugar de ARN.
      if (s.Protocol === 'email' && s.SubscriptionArn?.startsWith('arn:')) lista.push({ correo: s.Endpoint, arn: s.SubscriptionArn });
    }
    NextToken = r.NextToken;
  } while (NextToken);
  return lista;
}

// Misma página de baja que usa SNS en sus correos.
const urlBaja = s => `https://sns.${REGION}.amazonaws.com/unsubscribe.html?SubscriptionArn=${encodeURIComponent(s.arn)}&Endpoint=${encodeURIComponent(s.correo)}`;

// La imagen original vive en un bucket privado; se copia al bucket público del sitio para que el correo la muestre siempre.
async function imagenPublica(noticia) {
  const key = String(noticia.imagenKey || '');
  const m = key.match(/^imagenes\/[\w-]+(?:\/foto)?[\w.-]*\.(jpg|jpeg|png|webp)$/i);
  if (!m) return '';
  if (CDN && FOTO_CDN.test(key)) return `${CDN}/${key}`;
  const destino = `correo/${noticia.id}.${m[1].toLowerCase()}`;
  try {
    await s3.send(new CopyObjectCommand({ Bucket: BUCKET_SITIO, Key: destino, CopySource: `${BUCKET_IMAGENES}/${key}`, MetadataDirective: 'COPY' }));
    return PUBLICO + destino;
  } catch (error) {
    console.error(JSON.stringify({ evento: 'imagen_no_copiada', funcion: 'enviar-correos', noticiaId: noticia.id, error: error.name, mensaje: error.message }));
    return '';
  }
}

function construir(record, imagenUrl) {
  const { Message, Subject, MessageAttributes = {} } = record.Sns;
  const tipo = MessageAttributes.tipo?.Value;
  let datos = null;
  try { datos = JSON.parse(Message); } catch { /* texto plano */ }
  const base = { sitio: SITIO, logo: LOGO };
  if (datos?.AlarmName && datos?.NewStateValue) return { tipo: 'alarma', plantilla: baja => correoAlarma({ ...base, alarma: datos, bajaUrl: baja }) };
  if (tipo === 'noticia' && datos?.id && datos?.titulo) return { tipo, plantilla: baja => correoNoticia({ ...base, noticia: datos, imagenUrl, bajaUrl: baja }) };
  if (tipo === 'rechazo' && datos) return { tipo, plantilla: baja => correoRechazo({ ...base, rechazo: datos, bajaUrl: baja }) };
  return { tipo: 'generico', plantilla: baja => correoGenerico({ ...base, asunto: Subject, mensaje: Message, bajaUrl: baja }) };
}

export const handler = async (event, context) => {
  if (!REMITENTE) throw new Error('Falta la variable REMITENTE.');
  for (const record of event.Records || []) {
    const inicio = Date.now();
    const topico = record.Sns.TopicArn;
    const attrs = record.Sns.MessageAttributes || {};
    let imagenUrl = '';
    if (attrs.tipo?.Value === 'noticia') {
      try { imagenUrl = await imagenPublica(JSON.parse(record.Sns.Message)); } catch { /* sin imagen */ }
    }
    const { tipo, plantilla } = construir(record, imagenUrl);
    const destinatarios = await suscriptores(topico);
    let enviados = 0;
    for (const s of destinatarios) {
      const baja = urlBaja(s);
      const { asunto, html, texto } = plantilla(baja);
      try {
        await ses.send(new SendEmailCommand({
          FromEmailAddress: REMITENTE,
          Destination: { ToAddresses: [s.correo] },
          Content: { Simple: {
            Subject: { Data: asunto, Charset: 'UTF-8' },
            Body: { Html: { Data: html, Charset: 'UTF-8' }, Text: { Data: texto, Charset: 'UTF-8' } },
            Headers: [{ Name: 'List-Unsubscribe', Value: `<${baja}>` }]
          } }
        }));
        enviados++;
      } catch (error) {
        // Un destinatario rechazado (p. ej. no verificado en el sandbox de SES) no detiene a los demás.
        // No se relanza: un reintento de SNS reenviaría el correo a quienes ya lo recibieron.
        console.error(JSON.stringify({ evento: 'envio_fallido', funcion: 'enviar-correos', requestId: context?.awsRequestId, tipo, dominio: s.correo.split('@')[1], error: error.name, mensaje: error.message }));
      }
    }
    log('correos_enviados', { requestId: context?.awsRequestId, tipo, topico: topico.split(':').pop(), destinatarios: destinatarios.length, enviados, conImagen: Boolean(imagenUrl), duracionMs: Date.now() - inicio });
  }
  return { ok: true };
};
