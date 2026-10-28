import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

// TABLA permite apuntar a una tabla inexistente para simular fallos sin tocar la tabla compartida (P04).
const TABLA = process.env.TABLA || 'noticias';
const BUCKET = process.env.BUCKET || 'mis-noticias-daniel-imagenes-906-2026';
const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-2' }));
const s3 = new S3Client({ region: 'us-east-2' });
const CLAVE = /^imagenes\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/foto\.(jpg|png|webp)$/i;
const log = (evento, datos = {}) => console.log(JSON.stringify({ evento, funcion: 'procesar-imagen', ...datos }));

class ErrorTerminal extends Error {}

function validar(p, id, key) {
  if (!p || typeof p !== 'object') throw new ErrorTerminal('El pendiente no es un objeto JSON.');
  if (p.id !== id || p.imagenKey !== key) throw new ErrorTerminal('El pendiente no corresponde a la imagen.');
  if ([p.titulo, p.detalle, p.fecha, p.categoria, p.alt].some(x => typeof x !== 'string' || !x.trim())) throw new ErrorTerminal('Faltan campos en el pendiente.');
  if (p.titulo.length > 180 || p.detalle.length > 30000 || p.categoria.length > 60 || p.alt.length > 300 || !/^\d{4}-\d{2}-\d{2}$/.test(p.fecha)) throw new ErrorTerminal('Campos fuera de límite.');
}

async function procesar(record, requestId) {
  const inicio = Date.now();
  const bucket = record.s3?.bucket?.name;
  // Las claves de S3 llegan codificadas como URL y con + en lugar de espacios.
  const key = decodeURIComponent(String(record.s3?.object?.key || '').replace(/\+/g, ' '));
  const base = { requestId, bucket, key };
  log('inicio', base);
  if (bucket !== BUCKET) throw new ErrorTerminal(`Bucket no esperado: ${bucket}`);
  const coincidencia = key.match(CLAVE);
  // Imágenes del flujo anterior (imagenes/<marca>-<nombre>) no tienen pendiente: se ignoran sin error.
  if (!coincidencia) { log('omitido_sin_formato', base); return; }
  const noticiaId = coincidencia[1].toLowerCase();
  const tamano = record.s3.object.size;
  if (!tamano || tamano > 10 * 1024 * 1024) throw new ErrorTerminal(`Tamaño no válido: ${tamano}`);

  let pendiente;
  try {
    const objeto = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: `pendientes/${noticiaId}.json` }));
    pendiente = JSON.parse(await objeto.Body.transformToString());
  } catch (error) {
    if (error.name === 'NoSuchKey' || error instanceof SyntaxError) throw new ErrorTerminal(`Pendiente ausente o inválido (${error.name}).`);
    throw error;
  }
  validar(pendiente, noticiaId, key);
  log('validado', { ...base, noticiaId });

  const item = {
    id: noticiaId, titulo: pendiente.titulo.trim(), detalle: pendiente.detalle.trim(), fecha: pendiente.fecha,
    categoria: pendiente.categoria.trim(), alt: pendiente.alt.trim(),
    imagen: `https://${bucket}.s3.us-east-2.amazonaws.com/${key}`,
    origen: 's3-evento', creadoEn: new Date().toISOString()
  };
  try {
    await db.send(new PutCommand({ TableName: TABLA, Item: item, ConditionExpression: 'attribute_not_exists(id)' }));
    log('guardado', { ...base, noticiaId, tabla: TABLA, duracionMs: Date.now() - inicio });
  } catch (error) {
    // Un reintento o un evento repetido no crea un segundo registro (P07).
    if (error.name === 'ConditionalCheckFailedException') { log('duplicado', { ...base, noticiaId, duracionMs: Date.now() - inicio }); return; }
    throw error;
  }
}

export const handler = async (event, context) => {
  const requestId = context?.awsRequestId;
  const fallos = [];
  for (const record of event.Records || []) {
    try {
      await procesar(record, requestId);
    } catch (error) {
      const key = record.s3?.object?.key;
      if (error instanceof ErrorTerminal) {
        // Validación: reintentar no lo corrige. Se registra y no se relanza.
        log('validacion_fallida', { requestId, key, motivo: error.message });
      } else {
        console.error(JSON.stringify({ evento: 'fallo', funcion: 'procesar-imagen', requestId, key, error: error.name, mensaje: error.message }));
        fallos.push(error);
      }
    }
  }
  // Relanzar los fallos operativos incrementa la métrica Errors y activa los reintentos asíncronos (P04–P06).
  if (fallos.length) throw new Error(`${fallos.length} registro(s) fallaron: ${fallos.map(e => e.name).join(', ')}`);
  return { procesados: (event.Records || []).length };
};
