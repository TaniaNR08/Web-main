#!/bin/bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/azureuser/schoolweb}"
REPO_URL="${REPO_URL:-https://github.com/TaniaNR08/Web-main.git}"
BRANCH="${BRANCH:-devops}"

export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y
sudo apt-get install -y git nginx docker.io docker-compose-plugin

sudo usermod -aG docker azureuser || true

if [ ! -d "$APP_DIR/.git" ]; then
  git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
git fetch origin "$BRANCH" || true
git checkout "$BRANCH" || true
git pull origin "$BRANCH" || true

cd backend
docker compose up -d
npm install --omit=dev

if ! command -v pm2 >/dev/null; then
  sudo npm install -g pm2
fi

PUBLIC_IP=$(curl -s -H Metadata:true "http://169.254.169.254/metadata/instance/network/interface/0/ipv4/ipAddress/0/publicIpAddress?api-version=2021-02-01&format=text" || echo "")
export ALLOWED_ORIGINS="http://localhost:4200,http://${PUBLIC_IP}"

pm2 delete schoolweb-api 2>/dev/null || true
pm2 start npm --name schoolweb-api -- start
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u azureuser --hp /home/azureuser || true

cd ../frontend
npm install
npm run build
sudo mkdir -p /var/www/schoolweb
sudo cp -r dist/frontend/browser/* /var/www/schoolweb/

sudo cp "$APP_DIR/deploy/nginx-schoolweb.conf" /etc/nginx/sites-available/schoolweb
sudo ln -sf /etc/nginx/sites-available/schoolweb /etc/nginx/sites-enabled/schoolweb
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "Listo. Abre: http://${PUBLIC_IP}"
