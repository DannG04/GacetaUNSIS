import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-2' }));
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
