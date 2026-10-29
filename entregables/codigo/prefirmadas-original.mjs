// Respaldo de la Lambda "cors" (prefirmadas) desplegada en us-east-2, transcrita desde la consola el 2026-10-27.
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

const REGION = "us-east-2";
const BUCKET = "mis-noticias-daniel-imagenes-906-2026";

const s3 = new S3Client({ region: REGION });

export const handler = async (event) => {
    const headers = {
        "Content-Type": "application/json"
    };

    const httpMethod = event.requestContext?.http?.method || event.httpMethod;
    if (httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers,
            body: ""
        };
    }

    try {
        const params = event.queryStringParameters ?? {};

        const fileName = params.file?.trim();

        if (!fileName ||
            !/\.(jpg|jpeg|png|webp)$/i.test(fileName)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: "Archivo no válido"
                })
            };
        }

        const contentTypePorExtension = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp"
        };

        const extension = fileName.split(".").pop().toLowerCase();
        const contentType = contentTypePorExtension[extension];
        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `imagenes/${randomUUID()}-${safeName}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ContentType: contentType
        });

        const uploadUrl = await getSignedUrl(s3, command, {
            expiresIn: 300
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                uploadUrl
            })
        };

    } catch (error) {
        console.error("Error generando URL:", error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: "No se pudo generar la URL prefirmada"
            })
        };
    }
};
