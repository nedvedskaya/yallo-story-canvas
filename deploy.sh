#!/usr/bin/env bash
#
# Первичный деплой редактора ЯЛО на VPS.
# Предварительные шаги (вручную, до запуска):
#   1. Создать A-запись DNS: editor.yalokontent.ru -> 89.23.99.157
#      Проверка: dig +short editor.yalokontent.ru @8.8.8.8
#   2. Подставить реальный email в CERTBOT_EMAIL ниже.
#   3. Убедиться, что GitHub-репозиторий публичный (иначе на сервере нужен
#      deploy-key и REPO_URL=git@github.com:...).
#
# Идемпотентно: можно запускать повторно, сломанного не будет.

set -euo pipefail

SERVER=root@89.23.99.157
SSH_KEY="${SSH_KEY:-$HOME/.ssh/yalo_key}"
DOMAIN=editor.yalokontent.ru
REPO_URL=https://github.com/nedvedskaya/yallo-story-canvas.git
TARGET=/opt/yalo-editor
CERTBOT_EMAIL=olga@yalokontent.ru  # замени на реальный

echo ">> Подключаюсь к $SERVER и разворачиваю $DOMAIN..."

ssh -i "$SSH_KEY" "$SERVER" \
    DOMAIN="$DOMAIN" REPO_URL="$REPO_URL" TARGET="$TARGET" \
    CERTBOT_EMAIL="$CERTBOT_EMAIL" \
    "bash -s" <<'REMOTE'
set -euo pipefail

echo ">> [server] Проверяю Node.js..."
node -v | grep -q '^v20\.' || { echo "ERROR: нужен Node.js 20.x"; exit 1; }

echo ">> [server] Клонирую / обновляю репозиторий..."
if [ -d "$TARGET/.git" ]; then
    cd "$TARGET" && git pull --ff-only
else
    git clone "$REPO_URL" "$TARGET"
    cd "$TARGET"
fi

echo ">> [server] Пишу production .env..."
cat > "$TARGET/.env" <<ENV
VITE_API_URL=/api
ENV

echo ">> [server] npm ci + build..."
cd "$TARGET"
npm ci
npm run build

NGINX_CONF=/etc/nginx/sites-available/$DOMAIN
if [ ! -f "$NGINX_CONF" ]; then
    echo ">> [server] Создаю nginx config..."
    cat > "$NGINX_CONF" <<NGINX
server {
    listen 80;
    server_name $DOMAIN;
    root $TARGET/dist;
    index index.html;
    access_log /var/log/nginx/$DOMAIN.access.log;

    # API backend — proxy без trailing slash, чтобы сохранить /api префикс
    # (backend FastAPI монтирует editor_router с prefix="/api")
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
    }

    # SPA: все неизвестные пути -> index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Vite статика: длинный cache для /assets/, короткий для index.html
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    location = /index.html {
        add_header Cache-Control "no-cache";
    }
}
NGINX
    ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/$DOMAIN"
    nginx -t
    systemctl reload nginx

    echo ">> [server] Выпускаю SSL через certbot..."
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos \
        -m "$CERTBOT_EMAIL" --redirect
    systemctl reload nginx
else
    echo ">> [server] nginx config уже существует, просто reload"
    systemctl reload nginx
fi

echo ">> [server] DEPLOY OK: https://$DOMAIN"
REMOTE
