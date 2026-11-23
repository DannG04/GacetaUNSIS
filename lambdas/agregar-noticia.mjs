import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { randomUUID } from 'node:crypto';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-2' }));
const sns = new SNSClient({ region: 'us-east-2' });
// Sin TOPICO_NOTICIAS_ARN la función guarda igual que antes y no envía correos.
const TOPICO_NOTICIAS = process.env.TOPICO_NOTICIAS_ARN;

// Mensaje JSON con atributo «tipo»: la Lambda enviar-correos lo convierte en un correo HTML.
// Un fallo de SNS no cambia la respuesta: la noticia ya quedó guardada.
async function notificarNoticia(item) {
  if (!TOPICO_NOTICIAS) return;
  const subject = `Nueva noticia: ${item.titulo.replace(/[\u0000-\u001f\u007f]+/g, ' ')}`;
  let imagenKey = '';
  try { if (item.imagen) imagenKey = decodeURIComponent(new URL(item.imagen).pathname.slice(1)); } catch { /* sin imagen */ }
  try {
    await sns.send(new PublishCommand({
      TopicArn: TOPICO_NOTICIAS,
      Subject: subject.length > 99 ? `${subject.slice(0, 98)}…` : subject,
      Message: JSON.stringify({ id: item.id, titulo: item.titulo, fecha: item.fecha, categoria: item.categoria, detalle: item.detalle, alt: item.alt, imagenKey }),
      MessageAttributes: { tipo: { DataType: 'String', StringValue: 'noticia' } }
    }));
    console.log(JSON.stringify({ evento: 'notificacion_enviada', funcion: 'agregar-noticia', noticiaId: item.id }));
  } catch (error) {
    console.error(JSON.stringify({ evento: 'notificacion_fallida', funcion: 'agregar-noticia', noticiaId: item.id, error: error.name, mensaje: error.message }));
  }
}

const responder = (statusCode, datos) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
export const handler = async event => {
  const metodo = event.requestContext?.http?.method || event.httpMethod;
  if (metodo === 'OPTIONS') return responder(200, {});
  if (metodo && metodo !== 'POST') return responder(405, { error: 'Utiliza POST.' });
  let body;
  try {
    body = event.body ? JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body) : event;
  } catch { return responder(400, { error: 'JSON no válido.' }); }
  if (!body || typeof body !== 'object') return responder(400, { error: 'Cuerpo no válido.' });
  const { titulo, detalle, fecha, categoria = 'General', imagen = '', alt = '' } = body;
  if ([titulo, detalle, fecha, categoria].some(x => typeof x !== 'string' || !x.trim())) return responder(400, { error: 'Faltan título, detalle, fecha o categoría.' });
  if (titulo.length > 180 || detalle.length > 30000 || categoria.length > 60 || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return responder(400, { error: 'Revisa la longitud de los campos y el formato de la fecha.' });
  if (typeof imagen !== 'string' || typeof alt !== 'string' || alt.length > 300) return responder(400, { error: 'Imagen o descripción no válida.' });
  if (imagen) {
    try {
      const url = new URL(imagen);
      if (url.protocol !== 'https:' || url.hostname !== 'mis-noticias-daniel-imagenes-906-2026.s3.us-east-2.amazonaws.com' || !url.pathname.startsWith('/imagenes/') || url.search || !alt.trim()) throw new Error();
    } catch { return responder(400, { error: 'La imagen debe pertenecer al bucket de imágenes y tener descripción.' }); }
  }
  const id = body.id || randomUUID();
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return responder(400, { error: 'Identificador no válido.' });
  const item = { id, titulo: titulo.trim(), detalle: detalle.trim(), fecha, categoria: categoria.trim(), imagen, alt: alt.trim(), creadoEn: new Date().toISOString() };
  try {
    await db.send(new PutCommand({ TableName: 'noticias', Item: item, ConditionExpression: 'attribute_not_exists(id)' }));
    await notificarNoticia(item);
    return responder(201, { mensaje: 'Noticia guardada con éxito', item });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      try {
        const existente = await db.send(new GetCommand({ TableName: 'noticias', Key: { id }, ConsistentRead: true }));
        return responder(200, { mensaje: 'La noticia ya fue guardada', item: existente.Item });
      } catch (consultaError) { console.error(consultaError); }
    }
    console.error(error);
    return responder(500, { error: 'No se pudo guardar la noticia.' });
  }
};
