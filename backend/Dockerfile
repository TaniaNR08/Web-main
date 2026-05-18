# ── Etapa de build ────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
# Instala solo dependencias de producción
RUN npm ci --omit=dev

# ── Imagen final ───────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Metadatos
LABEL org.opencontainers.image.title="SchoolWebPro Backend"
LABEL org.opencontainers.image.description="API Gateway + Microservicios San Francisco de Asis"

# Copia dependencias y código
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY services/ ./services/

# Puerto público (api-gateway)
EXPOSE 3001

# Variables de entorno por defecto (sobreescribir en Azure)
ENV NODE_ENV=production \
    MYSQL_HOST=localhost \
    MYSQL_USER=root \
    MYSQL_PASSWORD=changeme \
    PORT_GATEWAY=3001 \
    PORT_AUTH=3002 \
    PORT_GROUPS=3003 \
    PORT_TASKS=3004 \
    PORT_SUBMISSIONS=3005 \
    PORT_CONTENT=3006

# Inicia todos los servicios con concurrently
CMD ["node_modules/.bin/concurrently", \
     "node services/auth-service/server.js", \
     "node services/groups-service/server.js", \
     "node services/tasks-service/server.js", \
     "node services/submissions-service/server.js", \
     "node services/content-service/server.js", \
     "node services/api-gateway/server.js"]
