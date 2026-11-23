import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-2' }));
const s3 = new S3Client({ region: 'us-east-2' });
const BUCKET = 'mis-noticias-daniel-imagenes-906-2026';
const headers = { 'Content-Type': 'application/json' };
// Dominio de CloudFront, p. ej. https://dxxxx.cloudfront.net. Sin él se usan URLs prefirmadas como antes.
const CDN = (process.env.CDN_URL || '').replace(/\/+$/, '');
// Solo las fotos del flujo con evento S3 (imagenes/<uuid>/foto.ext) pasan por CloudFront: es el patrón
// de la ruta /imagenes/*/foto.* de la distribución. Las imágenes del flujo anterior siguen prefirmadas.
const FOTO_CDN = /^imagenes\/[0-9a-f-]{36}\/foto\.(jpg|png|webp)$/i;
export const handler = async event => {
  const metodo = event.requestContext?.http?.method || event.httpMethod;
  if (metodo === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (metodo && metodo !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Utiliza GET.' }) };
  // Entrega URLs de lectura temporales para mostrar imágenes incluso con bucket privado.
  const firmar = async noticia => {
    if (!noticia.imagen) return noticia;
    let url;
    try { url = new URL(noticia.imagen); } catch { return noticia; }
    if (url.hostname !== `${BUCKET}.s3.us-east-2.amazonaws.com` || !url.pathname.startsWith('/imagenes/')) return noticia;
    const key = decodeURIComponent(url.pathname.slice(1));
    if (CDN && FOTO_CDN.test(key)) return { ...noticia, imagen: `${CDN}/${key}` };
    const imagen = await getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 3600 });
    return { ...noticia, imagen };
  };
  try {
    // ?id= consulta una sola noticia para seguir el procesamiento asíncrono sin recorrer la tabla.
    const id = event.queryStringParameters?.id;
    if (id) {
      const { Item } = await db.send(new GetCommand({ TableName: 'noticias', Key: { id }, ConsistentRead: true }));
      return { statusCode: 200, headers, body: JSON.stringify(Item ? { estado: 'publicada', item: await firmar(Item) } : { estado: 'pendiente', id }) };
    }
    const noticias = [];
    let cursor;
    do {
      const pagina = await db.send(new ScanCommand({ TableName: 'noticias', ExclusiveStartKey: cursor }));
      noticias.push(...(pagina.Items || []));
      cursor = pagina.LastEvaluatedKey;
    } while (cursor);
    const resultado = await Promise.all(noticias.map(firmar));
    return { statusCode: 200, headers, body: JSON.stringify(resultado) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'No se pudieron obtener las noticias.' }) };
  }
};
