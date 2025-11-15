# ==============================================================
# ETAPA 1: Build - Compilar aplicación Angular
# ==============================================================
FROM node:18-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias con npm ci (más confiable que npm install)
RUN npm ci

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build -- --configuration production

# ==============================================================
# ETAPA 2: Runtime - Servir con Nginx
# ==============================================================
FROM nginx:alpine

# Instalar envsubst para templates dinámicos
RUN apk add --no-cache gettext

# Variables de ambiente
ENV API_BASE_URL=http://backend:8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/healthz || exit 1

# Copiar archivos compilados de Angular
COPY --from=build /app/dist/homa-frontend /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.template.conf /etc/nginx/templates/default.conf.template

# Copiar entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Crear directorio de assets y dar permisos al entrypoint
RUN chmod +x /docker-entrypoint.sh && \
    mkdir -p /usr/share/nginx/html/assets

# Exponer puerto
EXPOSE 80

# Entrypoint para inyectar variables de ambiente
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
