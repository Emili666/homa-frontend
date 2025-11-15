# Etapa 1: Build de la aplicación Angular
FROM node:18-alpine AS build

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Build de producción
RUN npm run build -- --configuration production

# Etapa 2: Servidor web Nginx
FROM nginx:alpine

# URL por defecto del backend (se puede sobrescribir con API_BASE_URL)
ENV API_BASE_URL=http://backend:8080

# Copiar los archivos build de Angular al directorio de Nginx
COPY --from=build /app/dist/homa-frontend /usr/share/nginx/html

# Copiar plantilla y entrypoint para generar la configuración final de Nginx
COPY nginx.template.conf /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto 80
EXPOSE 80

# Entrypoint y comando por defecto
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
