#!/usr/bin/env bash
# Comprobación de la HTTP API gaceta-api (INTEGRACION-API-GATEWAY.md, pruebas A01–A11).
# No escribe datos: los POST del editor van sin token o con uno falso (401 del autorizador JWT)
# y el de suscripciones lleva un correo inválido (400 de la Lambda, sin llamar a SNS).
#
# Uso: bash pruebas/api-gateway.sh https://abc123.execute-api.us-east-2.amazonaws.com/api
#      bash pruebas/api-gateway.sh https://d27gjonf76v1aq.cloudfront.net/api   (fase 3)
set -u
BASE="${1:?Indica la URL base terminada en /api}"
BASE="${BASE%/}"
SITIO="${ORIGEN_SITIO:-https://d27gjonf76v1aq.cloudfront.net}"
fallos=0

revisar() { # nombre, esperado (regex), obtenido
  if [[ "$3" =~ ^($2)$ ]]; then echo "  OK    $1 → $3"; else echo "  FALLA $1 → $3 (se esperaba $2)"; fallos=$((fallos + 1)); fi
}
estado() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
cuerpo() { curl -s "$@"; }

echo "API: $BASE"
revisar "A01 GET /noticias" 200 "$(estado "$BASE/noticias")"
revisar "A02 GET /noticias?id=<inexistente> devuelve pendiente" '.*"estado":"pendiente".*' \
  "$(cuerpo "$BASE/noticias?id=00000000-0000-4000-8000-000000000000")"
revisar "A03 Preflight CORS desde $SITIO" '200|204' \
  "$(estado -X OPTIONS "$BASE/noticias" -H "Origin: $SITIO" -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: content-type')"
revisar "A04 CORS permite el origen del sitio" "access-control-allow-origin: $SITIO" \
  "$(curl -s -D - -o /dev/null -X OPTIONS "$BASE/noticias" -H "Origin: $SITIO" -H 'Access-Control-Request-Method: POST' | tr -d '\r' | grep -i '^access-control-allow-origin' | tr 'A-Z' 'a-z' || true)"
revisar "A05 CORS rechaza un origen ajeno (sin encabezado)" '' \
  "$(curl -s -D - -o /dev/null -X OPTIONS "$BASE/noticias" -H 'Origin: https://ejemplo.invalid' -H 'Access-Control-Request-Method: POST' | tr -d '\r' | grep -i '^access-control-allow-origin' || true)"
revisar "A06 POST /noticias sin token → 401 del autorizador" 401 \
  "$(estado -X POST "$BASE/noticias" -H 'Content-Type: application/json' -d '{}')"
revisar "A07 POST /subidas sin token → 401 del autorizador" 401 \
  "$(estado -X POST "$BASE/subidas" -H 'Content-Type: application/json' -d '{}')"
revisar "A08 POST /suscripciones inválido → 400 de suscribir-noticias" 400 \
  "$(estado -X POST "$BASE/suscripciones" -H 'Content-Type: application/json' -d '{"correo":"no-es-correo"}')"
revisar "A09 Ruta inexistente → 404 de API Gateway" 404 "$(estado -X DELETE "$BASE/noticias")"
revisar "A10 POST /noticias con token falso → 401" 401 \
  "$(estado -X POST "$BASE/noticias" -H 'Content-Type: application/json' -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.e30.firma' -d '{}')"
revisar "A11 CORS permite el encabezado authorization" '.*authorization.*' \
  "$(curl -s -D - -o /dev/null -X OPTIONS "$BASE/noticias" -H "Origin: $SITIO" -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: authorization,content-type' | tr -d '\r' | grep -i '^access-control-allow-headers' | tr 'A-Z' 'a-z' || true)"

echo
if ((fallos)); then echo "$fallos comprobaciones fallaron."; exit 1; fi
echo "Todas las comprobaciones pasaron."
