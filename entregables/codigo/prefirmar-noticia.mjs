import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

const BUCKET = process.env.BUCKET || 'mis-noticias-daniel-imagenes-906-2026';
const s3 = new S3Client({ region: 'us-east-2' });
const EXTENSIONES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const responder = (statusCode, datos) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
const log = (evento, datos = {}) => console.log(JSON.stringify({ evento, funcion: 'prefirmar', ...datos }));

// Valida los mismos campos que la Lambda de agregar para no dejar pendientes inservibles.
function validar(body) {
  const { titulo, detalle, fecha, categoria = 'General', alt = '', tipo } = body;
  if ([titulo, detalle, fecha, categoria].some(x => typeof x !== 'string' || !x.trim())) return 'Faltan título, detalle, fecha o categoría.';
  if (titulo.length > 180 || detalle.length > 30000 || categoria.length > 60 || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return 'Revisa la longitud de los campos y el formato de la fecha.';
  if (typeof alt !== 'string' || !alt.trim() || alt.length > 300) return 'La imagen necesita una descripción de máximo 300 caracteres.';
  if (!EXTENSIONES[tipo]) return 'La imagen debe ser JPG, PNG o WebP.';
  if (body.id !== undefined && (typeof body.id !== 'string' || !UUID.test(body.id))) return 'Identificador no válido.';
  return '';
}

export const handler = async (event, context) => {
  const inicio = Date.now();
  const metodo = event.requestContext?.http?.method || event.httpMethod;
  if (metodo === 'OPTIONS') return responder(200, {});
  if (metodo && metodo !== 'POST') return responder(405, { error: 'Utiliza POST.' });
  let body = {};
  try {
    if (event.body) body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body);
  } catch { return responder(400, { error: 'JSON no válido.' }); }

  try {
    // Flujo anterior (POST ?file=nombre sin cuerpo): se conserva mientras se migra el frontend.
    if (!body || typeof body !== 'object' || !body.titulo) {
      const nombre = String(event.queryStringParameters?.file || '').trim();
      const extension = nombre.split('.').pop().toLowerCase();
      const tipo = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[extension];
      if (!nombre || !tipo) return responder(400, { error: 'Archivo no válido' });
      const key = `imagenes/${randomUUID()}-${nombre.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: tipo }), { expiresIn: 300 });
      log('url_legada', { requestId: context?.awsRequestId, key, duracionMs: Date.now() - inicio });
      return responder(200, { uploadUrl, key });
    }

    const error = validar(body);
    if (error) {
      log('validacion_rechazada', { requestId: context?.awsRequestId, motivo: error });
      return responder(400, { error });
    }
    const id = body.id || randomUUID();
    const key = `imagenes/${id}/foto.${EXTENSIONES[body.tipo]}`;
    const pendiente = {
      id, titulo: body.titulo.trim(), detalle: body.detalle.trim(), fecha: body.fecha,
      categoria: (body.categoria || 'General').trim(), alt: body.alt.trim(), imagenKey: key,
      solicitadoEn: new Date().toISOString()
    };
    // El JSON se guarda antes de emitir la URL: la procesadora siempre lo encontrará al llegar la imagen.
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET, Key: `pendientes/${id}.json`, Body: JSON.stringify(pendiente), ContentType: 'application/json'
    }));
    const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: body.tipo }), { expiresIn: 300 });
    log('pendiente_creado', { noticiaId: id, requestId: context?.awsRequestId, bucket: BUCKET, key, duracionMs: Date.now() - inicio });
    return responder(200, { uploadUrl, noticiaId: id, key });
  } catch (error) {
    console.error(JSON.stringify({ evento: 'fallo', funcion: 'prefirmar', requestId: context?.awsRequestId, error: error.name, mensaje: error.message }));
    return responder(500, { error: 'No se pudo preparar la subida.' });
  }
};
