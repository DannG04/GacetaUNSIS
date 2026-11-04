export const estado = { s3: {}, tabla: {}, fallarDB: false };
class Cmd { constructor(input){ this.input = input; } }
export class DynamoDBClient { constructor(){} }
export class S3Client { constructor(){} async send(c){
  if (c instanceof GetObjectCommand){ const v = estado.s3[c.input.Key]; if(!v){ const e=new Error('nf'); e.name='NoSuchKey'; throw e;} return { Body:{ transformToString: async()=>v } }; }
  if (c instanceof PutObjectCommand){ estado.s3[c.input.Key]=c.input.Body; return {}; } } }
export const DynamoDBDocumentClient = { from: () => ({ async send(c){
  if (estado.fallarDB){ const e=new Error('Requested resource not found'); e.name='ResourceNotFoundException'; throw e; }
  if (c instanceof PutCommand){ if (estado.tabla[c.input.Item.id]){ const e=new Error('cond'); e.name='ConditionalCheckFailedException'; throw e;} estado.tabla[c.input.Item.id]=c.input.Item; return {}; }
  if (c instanceof GetCommand){ return { Item: estado.tabla[c.input.Key.id] }; }
  if (c instanceof ScanCommand){ return { Items: Object.values(estado.tabla) }; } } }) };
export class PutCommand extends Cmd {} export class GetCommand extends Cmd {} export class ScanCommand extends Cmd {}
export class GetObjectCommand extends Cmd {} export class PutObjectCommand extends Cmd {}
export async function getSignedUrl(_, c){ return 'https://firmada.example/' + c.input.Key; }
