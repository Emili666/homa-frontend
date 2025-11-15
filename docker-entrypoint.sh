#!/bin/sh
set -e

# Variables de ambiente
API_BASE_URL=${API_BASE_URL:-http://homa-backend:8080}

# Generar configuraci?n de Nginx
envsubst '$API_BASE_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Generar config.js con la URL din?mica
cat > /usr/share/nginx/html/assets/config.js <<EOF
// Configuraci?n din?mica inyectada en tiempo de ejecuci?n
window.__APP_CONFIG__ = {
  API_URL: "$API_BASE_URL/api"
};
console.log("[App Config] API URL set to:", window.__APP_CONFIG__.API_URL);
EOF

echo " API_BASE_URL: $API_BASE_URL"
echo " config.js generado"

exec "$@"
