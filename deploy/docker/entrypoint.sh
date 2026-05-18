#!/bin/bash
set -euo pipefail

if [ -n "${CONTAINER_APP_HOSTNAME:-}" ]; then
  export ALLOWED_ORIGINS="https://${CONTAINER_APP_HOSTNAME},http://${CONTAINER_APP_HOSTNAME}"
fi

echo "Esperando MySQL en ${MYSQL_HOST}..."
until mysqladmin ping -h"${MYSQL_HOST}" -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" --silent 2>/dev/null; do
  sleep 3
done
echo "MySQL disponible."

nginx

cd /app/backend
exec npm start
