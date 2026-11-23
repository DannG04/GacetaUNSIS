import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

// TABLA permite apuntar a una tabla inexistente para simular fallos sin tocar la tabla compartida (P04).
const TABLA = process.env.TABLA || 'noticias';
const BUCKET = process.env.BUCKET || 'mis-noticias-daniel-imagenes-906-2026';
const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-2' }));
const s3 = new S3Client({ region: 'us-east-2' });
const sns = new SNSClient({ region: 'us-east-2' });
// Sin estas variables la procesadora funciona igual que antes y no envía correos.
const TOPICO_NOTICIAS = process.env.TOPICO_NOTICIAS_ARN;
const TOPICO_ALERTAS = process.env.TOPICO_ALERTAS_ARN;
const CLAVE = /^imagenes\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/foto\.(jpg|png|webp)$/i;
const log = (evento, datos = {}) => console.log(JSON.stringify({ evento, funcion: 'procesar-imagen', ...datos }));

class ErrorTerminal extends Error {}

// Asunto de SNS: menos de 100 caracteres y sin saltos de línea ni caracteres de control.
const asunto = texto => { const t = texto.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim(); return t.length > 99 ? `${t.slice(0, 98)}…` : t; };

// El mensaje es JSON con el atributo «tipo»: la Lambda enviar-correos lo convierte en un correo HTML.
// Un fallo de SNS no debe deshacer ni reintentar una noticia ya guardada: se registra y se continúa.
async function notificar(topico, tipo, subject, datos, contexto) {
  if (!topico) return;
  try {
    await sns.send(new PublishCommand({
      TopicArn: topico, Subject: asunto(subject), Message: JSON.stringify(datos),
      MessageAttributes: { tipo: { DataType: 'String', StringValue: tipo } }
    }));
    log('notificacion_enviada', { ...contexto, tipo, topico: topico.split(':').pop() });
  } catch (error) {
    console.error(JSON.stringify({ evento: 'notificacion_fallida', funcion: 'procesar-imagen', ...contexto, tipo, topico: topico.split(':').pop(), error: error.name, mensaje: error.message }));
  }
}

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
  // Solo la escritura que crea el registro avisa; los duplicados salen antes y no repiten el correo (P07).
  await notificar(TOPICO_NOTICIAS, 'noticia', `Nueva noticia: ${item.titulo}`,
    { id: item.id, titulo: item.titulo, fecha: item.fecha, categoria: item.categoria, detalle: item.detalle, alt: item.alt, imagenKey: key },
    { requestId, noticiaId });
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
        // La alarma no se entera de estos rechazos (no relanzan): se avisa directamente al editor.
        await notificar(TOPICO_ALERTAS, 'rechazo', 'El Unsito: noticia rechazada por la procesadora',
          { motivo: error.message, key, bucket: record.s3?.bucket?.name, noticiaId: String(key || '').match(/[0-9a-f-]{36}/i)?.[0], requestId, ocurrioEn: new Date().toISOString() },
          { requestId });
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
