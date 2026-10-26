import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-2' }));
const s3 = new S3Client({ region: 'us-east-2' });
const BUCKET = 'mis-noticias-daniel-imagenes-906-2026';
const headers = { 'Content-Type': 'application/json' };
export const handler = async event => {
  const metodo = event.requestContext?.http?.method || event.httpMethod;
  if (metodo === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (metodo && metodo !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Utiliza GET.' }) };
  try {
    const noticias = [];
    let cursor;
    do {
      const pagina = await db.send(new ScanCommand({ TableName: 'noticias', ExclusiveStartKey: cursor }));
      noticias.push(...(pagina.Items || []));
      cursor = pagina.LastEvaluatedKey;
    } while (cursor);
    // Entrega URLs de lectura temporales para mostrar imágenes incluso con bucket privado.
    const resultado = await Promise.all(noticias.map(async noticia => {
      if (!noticia.imagen) return noticia;
      let url;
      try { url = new URL(noticia.imagen); } catch { return noticia; }
      if (url.hostname !== `${BUCKET}.s3.us-east-2.amazonaws.com` || !url.pathname.startsWith('/imagenes/')) return noticia;
      const imagen = await getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: decodeURIComponent(url.pathname.slice(1)) }), { expiresIn: 3600 });
      return { ...noticia, imagen };
    }));
    return { statusCode: 200, headers, body: JSON.stringify(resultado) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'No se pudieron obtener las noticias.' }) };
  }
};
