# Prueba local de las Lambdas (sin AWS)

Ejecuta el código de `entregables/codigo/` (prefirmar, procesar y obtener) contra S3 y DynamoDB simulados en el navegador y comprueba 13 casos: P01–P04, P07, la consulta `?id=`, el modo anterior `?file=` y la lista completa.

```bash
cd GacetaUNSIS            # raíz del repositorio
python3 -m http.server 8765
# abrir http://127.0.0.1:8765/documentacion/herramientas/prueba-local/prueba.html
```

Cada línea debe empezar con `PASA`. No sustituye la prueba en AWS (sección «Verificación» del manual): solo confirma la lógica del código.
