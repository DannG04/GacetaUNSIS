# Guion de exposición — Equipo 3: Monitoreo y resiliencia

Reparto sugerido; el equipo puede cambiarlo. Las mismas notas están en la presentación (vista del orador).

## 1. Portada: Monitoreo y resiliencia

Expone: Daniel.

Buenos días. Somos el Equipo 3 y nos tocó monitoreo y resiliencia de la Gaceta Universitaria «El Unsito». En pocas palabras: hicimos que la publicación de noticias funcione sola dentro de AWS, y que cuando algo falle, el sistema lo detecte, lo registre, lo reintente y nos avise.

## 2. Contenido

Expone: Daniel.

Este es el recorrido: primero el problema que encontramos, luego quiénes somos, cómo lo resolvimos, qué evidencia tenemos en AWS, qué pasó cuando rompimos cosas a propósito y, al final, seguridad, costos y lo que aprendimos.

## 3. ¿Y si algo falla?

Expone: Daniel.

Cuando llegamos, la gaceta ya funcionaba: subía fotos a S3 y guardaba noticias en DynamoDB. El detalle es que el navegador era el que coordinaba todo. Primero subía la imagen y luego hacía una segunda llamada para guardar. Si esa segunda llamada se perdía —se cerró la pestaña, falló la red, falló la base de datos— la foto quedaba en S3 sin noticia y nadie se daba cuenta. La rúbrica nos pidió justo eso: quitar esa llamada del navegador, que el evento de S3 dispare la Lambda, y poder ver y manejar los errores.

## 4. Equipo de trabajo

Expone: Daniel.

Somos Daniel, Mayra, Gael y Elisa, de la Universidad de la Sierra Sur. Trabajamos en la región de Ohio, us-east-2, sobre el mismo bucket y la misma tabla que usa todo el grupo, así que una regla fue no romper nada de lo compartido.

## 5. Antes y ahora

Expone: Daniel.

Arriba está cómo funcionaba antes: el navegador hacía dos llamadas y la segunda era el punto débil. Abajo, cómo funciona ahora: el navegador solo sube la foto. En cuanto la foto llega a S3, S3 dispara un evento —la flecha roja— que despierta a una Lambda nueva, la procesadora, y ella guarda la noticia en DynamoDB. Todo lo que hace la procesadora queda registrado en CloudWatch, que es nuestro sistema de vigilancia.

## 6. El viaje de una noticia

Expone: Mayra.

Sigamos una noticia de principio a fin. Uno: la web manda los datos y recibe un permiso temporal para subir, que es la URL prefirmada; los datos se quedan guardados como pendientes. Dos: la foto sube directo a S3. Tres: S3 detecta que llegó un objeto nuevo en la carpeta imagenes y despierta a la procesadora; nadie la tiene que llamar. Cuatro: la procesadora junta la foto con sus datos, valida y guarda. Mientras tanto la web pregunta cada dos segundos: ¿ya quedó?

## 7. El disparador: S3 llama a Lambda

Expone: Mayra.

Esta es la pieza central. En la consola de Lambda se ve el desencadenador de S3 configurado. En el recuadro rojo: el bucket de imágenes, el tipo de evento ObjectCreated y el prefijo imagenes/. Elegimos ese prefijo a propósito: los datos pendientes se guardan en otra carpeta, pendientes/, y la procesadora no escribe en S3, así que no hay riesgo de que se llame a sí misma en un ciclo infinito.

## 8. Los logs cuentan la historia

Expone: Mayra.

En lugar de mensajes sueltos, la procesadora escribe una línea JSON por etapa: inicio, validado y guardado, cada una con el id de la noticia, el requestId y la duración. Así cualquiera puede buscar una noticia y ver exactamente en qué paso va o en cuál falló. Ojo: nunca registramos firmas de URL ni el texto completo de la noticia, solo identificadores. Toda esta publicación tardó 1.56 segundos.

## 9. La noticia llegó sola

Expone: Mayra.

Aquí está la prueba de que funciona. En DynamoDB aparece la noticia, y marcamos dos cosas: su id y el campo origen, que dice s3-evento. Ese campo lo pone la procesadora, así que sabemos que la noticia entró por el camino nuevo. Además, revisando la red del navegador, no hubo ninguna llamada a la Lambda de agregar. Al recargar, la noticia se ve en el sitio con su foto.

## 10. Provocamos errores a propósito

Expone: Gael.

Un sistema no es resiliente porque nunca falle, sino porque sabe qué hacer cuando falla. Así que rompimos cosas a propósito. La rúbrica pide tres casos. Uno: si la imagen no se sube, no hay evento y no queda nada a medias. Dos: si llega una imagen sin sus datos, es un error que no se arregla reintentando, así que lo registramos y terminamos. Tres: si falla la base de datos, ese sí vale la pena reintentarlo, así que lanzamos el error para que Lambda lo reintente y la alarma se encienda. Ahora les mostramos cada uno.

## 11. Imagen sin datos: se descarta

Expone: Gael.

Primera prueba de error: simulamos que llega una foto pero sus datos no existen. La procesadora lo detecta, escribe en el log validacion_fallida con el motivo, NoSuchKey, y termina limpia. Arriba, en rojo, se ve que la ejecución terminó sin errores; abajo, la línea del log con el motivo. Decidimos que esto sea terminal: reintentar no va a hacer aparecer los datos, y así no gastamos ejecuciones de más.

## 12. Falla DynamoDB: Lambda reintenta

Expone: Gael.

Segunda prueba, la más importante. Para simular que la base de datos falla sin dañar la tabla de todos, cambiamos una variable de entorno para que la procesadora apunte a una tabla que no existe. Publicamos una noticia y en los logs se ven tres errores, marcados en rojo, con el mismo requestId: el intento original y los dos reintentos que configuramos, abajo a la derecha. Cuando regresamos la variable a la tabla correcta, la noticia se guardó con el mismo id. No se perdió nada.

## 13. La métrica Errors lo detecta

Expone: Gael.

La rúbrica pide una señal observable. Elegimos la métrica Errors, que Lambda publica sola en CloudWatch. Aquí se ve el pico de errores y cómo la tasa de éxito bajó a cero durante la falla. En el panel de eventos asíncronos se ven los tres intentos y que uno se descartó al agotar los reintentos. Importante: esto solo funciona porque la procesadora relanza el error; si lo atrapara y devolviera un 500, la métrica no se movería.

## 14. La alarma se encendió… y se apagó

Expone: Gael.

Con la métrica creamos la alarma gaceta-procesadora-errores: si hay al menos un error en un minuto, se enciende. Arriba se ve el momento exacto, 23:46:42, en que pasó de Correcto a En modo alarma. Abajo, la franja roja es el tiempo que duró el problema y, al corregirlo, a las 23:51:42 volvió sola a Correcto. No le pusimos notificación por correo para no generar suscripciones, pero se puede agregar con SNS en un clic.

## 15. Sin duplicados y con paciencia

Expone: Gael.

Dos pruebas más. A la izquierda, P07: S3 puede entregar el mismo evento dos veces, así que lo forzamos. La procesadora escribe con una condición, solo si el id no existe, y el log marca duplicado: queda un solo registro. A la derecha, P08: mientras la base de datos estaba fallando, la web no se quedó colgada ni volvió a mandar la noticia; avisó que la imagen se subió y que la noticia sigue en procesamiento. Cuando se recuperó, apareció una sola vez.

## 16. 8 de 8 pruebas aprobadas

Expone: Elisa.

En resumen, planeamos ocho pruebas: dos de funcionamiento normal y seis de fallas y casos raros. Las ocho pasaron. Todas tienen fecha, hora, id de la noticia y su captura en la matriz de pruebas que entregamos.

## 17. Mínimo privilegio

Expone: Elisa.

Al principio la procesadora usaba un rol con PowerUserAccess, que es como darle la llave de todo el edificio para abrir una sola puerta. Creamos un rol propio, procesar-imagen-noticia-rol, que solo puede leer los pendientes, guardar noticias y escribir sus propios logs. No puede leer imágenes, ni borrar ni recorrer la tabla. Después de cambiarlo volvimos a correr las pruebas y todo siguió funcionando. Lo honesto: las otras tres Lambdas del proyecto todavía usan el rol amplio.

## 18. Costos y limpieza

Expone: Elisa.

Cuidamos el crédito de 100 dólares de referencia. Revisamos el saldo antes y después de cada sesión: empezamos con 120 y terminamos con 120, gasto cero, porque todo cayó en el nivel gratuito. Pusimos retención de logs de tres días y etiquetamos lo que creamos. A la derecha está la lista de limpieza, en orden: primero el disparador, para que no se invoque nada mientras borramos.

## 19. Lo que aprendimos

Expone: Elisa.

Para cerrar: lo que aporta nuestro trabajo es que la gaceta ya no depende de que el navegador termine bien. Si algo falla, queda registrado, se reintenta y suena una alarma. Lo que nos faltó, y lo decimos con claridad: una cola de mensajes fallidos con SQS, que era la ampliación opcional; que la alarma mande correo con SNS; que los pendientes caduquen solos; y darle un rol mínimo a cada Lambda, no solo a la nuestra.

## 20. Equipo 3 · Monitoreo y resiliencia

Expone: todo el equipo.

Gracias. ¿Tienen preguntas? Si quieren ver algo en vivo, podemos abrir CloudWatch y buscar los logs por id de noticia.
