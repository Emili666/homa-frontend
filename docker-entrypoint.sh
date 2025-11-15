#!/bin/sh
set -e

# Variables de ambiente
BACKEND_INTERNAL=${BACKEND_INTERNAL:-http://homa-backend:8080}
BACKEND_PUBLIC=${BACKEND_PUBLIC:-http://localhost:8080}

# Generar configuración de Nginx (usa URL interna del contenedor)
API_BASE_URL=$BACKEND_INTERNAL
envsubst '$API_BASE_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Generar config.js con la URL pública (para que el navegador use localhost:8080)
cat > /usr/share/nginx/html/assets/config.js <<EOF
// Configuración dinámica inyectada en tiempo de ejecución
window.__APP_CONFIG__ = {
  API_URL: "$BACKEND_PUBLIC/api"
};
console.log("[App Config] API URL set to:", window.__APP_CONFIG__.API_URL);
EOF

echo "Backend interno (Nginx): $BACKEND_INTERNAL"
echo "Backend público (Browser): $BACKEND_PUBLIC"
echo "config.js generado"

exec "$@"
