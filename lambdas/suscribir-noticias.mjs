import { SNSClient, SubscribeCommand } from '@aws-sdk/client-sns';

// Suscribe un correo al tema de noticias. SNS envía el correo de confirmación;
// la suscripción no recibe noticias hasta que la persona pulsa «Confirm subscription».
const TOPICO = process.env.TOPICO_NOTICIAS_ARN;
const sns = new SNSClient({ region: 'us-east-2' });
const CORREO = /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const responder = (statusCode, datos) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
const log = (evento, datos = {}) => console.log(JSON.stringify({ evento, funcion: 'suscribir-noticias', ...datos }));

export const handler = async (event, context) => {
  const requestId = context?.awsRequestId;
  const metodo = event.requestContext?.http?.method || event.httpMethod;
  if (metodo === 'OPTIONS') return responder(200, {});
  if (metodo && metodo !== 'POST') return responder(405, { error: 'Utiliza POST.' });
  if (!TOPICO) { console.error(JSON.stringify({ evento: 'sin_configuracion', funcion: 'suscribir-noticias', requestId })); return responder(500, { error: 'El servicio de suscripción no está configurado.' }); }

  let body;
  try {
    body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || '{}');
  } catch { return responder(400, { error: 'JSON no válido.' }); }
  const correo = typeof body?.correo === 'string' ? body.correo.trim().toLowerCase() : '';
  if (!correo || correo.length > 254 || !CORREO.test(correo)) return responder(400, { error: 'Escribe un correo electrónico válido.' });

  try {
    // Sin ReturnSubscriptionArn, SNS responde «pending confirmation» si falta confirmar y el ARN si ya estaba confirmada.
    const r = await sns.send(new SubscribeCommand({
      TopicArn: TOPICO, Protocol: 'email', Endpoint: correo,
      // El texto plano de SNS no llega al lector: la versión HTML la envía enviar-correos por SES.
      Attributes: { FilterPolicy: JSON.stringify({ canal: ['texto'] }) }
    }));
    const confirmada = /^arn:aws:sns:/.test(r.SubscriptionArn || '');
    // Solo se registra el dominio: el correo completo es un dato personal.
    log('suscripcion_solicitada', { requestId, confirmada, dominio: correo.split('@')[1] });
    return responder(200, {
      mensaje: confirmada
        ? 'Este correo ya está suscrito a las noticias de El Unsito.'
        : 'Te enviamos un correo de confirmación. Ábrelo y pulsa «Confirm subscription» para empezar a recibir las noticias.',
      confirmada
    });
  } catch (error) {
    console.error(JSON.stringify({ evento: 'fallo', funcion: 'suscribir-noticias', requestId, error: error.name, mensaje: error.message }));
    if (error.name === 'InvalidParameterException') return responder(400, { error: 'SNS no aceptó ese correo electrónico.' });
    if (error.name === 'ThrottledException' || error.name === 'ThrottlingException') return responder(429, { error: 'Hay demasiadas solicitudes. Intenta de nuevo en un minuto.' });
    return responder(500, { error: 'No se pudo registrar la suscripción.' });
  }
};
