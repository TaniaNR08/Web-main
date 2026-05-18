FROM node:20-bookworm-slim AS frontend-build
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build -- --configuration production

FROM node:20-bookworm-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends nginx default-mysql-client \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/package.json backend/package-lock.json backend/
RUN cd backend && npm ci --omit=dev
COPY backend/ backend/
COPY --from=frontend-build /fe/dist/frontend/browser /var/www/schoolweb
COPY deploy/nginx-schoolweb.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default \
  && rm -f /etc/nginx/sites-enabled/default.bak
COPY deploy/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENV MYSQL_HOST=mysql
ENV MYSQL_USER=root
ENV MYSQL_PASSWORD=170522iris.
EXPOSE 80
CMD ["/entrypoint.sh"]
