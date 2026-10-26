# Publicar noticias con imagen

## Archivos del sitio

Reemplaza index.html y js/main.js en el bucket 906-unsis-daniel conservando las carpetas. Se reutilizan los estilos existentes.

El formulario envía titulo, detalle, fecha, categoria, imagen y alt a la Lambda de agregar. La imagen opcional se sube primero mediante POST ?file=nombre a la Lambda de prefirmadas y PUT a S3. La URL permanente del objeto se obtiene quitando la firma de uploadUrl; no se guarda la firma de subida. Al reintentar se reutilizan imagen e identificador para evitar duplicados.

Las noticias antiguas con titulo, detalle y fecha se muestran con categoría General y resumen generado del detalle.

## Lambda de agregar

Copia lambdas/agregar-noticia.mjs en el archivo del handler de tu Lambda de agregar y pulsa Deploy/Implementar. Si tu archivo se llama index.mjs, conserva ese nombre y el handler index.handler. Corrige el uso de randomUUID y guarda también los datos de imagen. La tabla noticias debe usar id como clave primaria de cadena, tal como asume tu código original. El rol necesita dynamodb:PutItem y dynamodb:GetItem sobre la tabla noticias (GetItem se utiliza si se reintenta un identificador ya guardado).

## Lambda de obtener

Copia lambdas/obtener-noticias.mjs en el handler de obtener y pulsa Deploy/Implementar. No agrega encabezados CORS manualmente. Consulta todas las páginas de DynamoDB y genera URLs de lectura temporales para imágenes del bucket, sin volverlo público. Su rol necesita dynamodb:Scan sobre noticias y s3:GetObject sobre arn:aws:s3:::mis-noticias-daniel-imagenes-906-2026/imagenes/*. Necesita los paquetes AWS SDK usados en el archivo, incluido @aws-sdk/s3-request-presigner como en tu Lambda de prefirmadas; si el runtime no lo incluye, adjúntalo en el paquete o una capa.

## CORS en las URL de función

Administra CORS únicamente en Configuración > URL de función. Usa como origen http://906-unsis-daniel.s3-website.us-east-2.amazonaws.com. Permite GET en obtener, POST y el encabezado content-type en agregar, y POST en prefirmadas. Conserva CORS PUT y Content-Type del bucket de imágenes, cuya subida ya funciona.

No subas los archivos de lambdas al bucket del sitio: se copian en las funciones correspondientes en AWS. No se desplegó ni probó una publicación real desde este entorno.
