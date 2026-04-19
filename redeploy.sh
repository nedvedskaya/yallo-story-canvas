#!/usr/bin/env bash
#
# Быстрый редеплой после git push.
# Использовать после: git push -> ./redeploy.sh
# Предполагает, что deploy.sh уже был успешно выполнен хотя бы раз.

set -euo pipefail

SERVER=root@89.23.99.157
SSH_KEY="${SSH_KEY:-$HOME/.ssh/yalo_key}"
TARGET=/opt/yalo-editor

echo ">> Редеплой $TARGET..."

ssh -i "$SSH_KEY" "$SERVER" TARGET="$TARGET" "bash -s" <<'REMOTE'
set -euo pipefail
cd "$TARGET"
git pull --ff-only
npm ci
npm run build
systemctl reload nginx
echo ">> REDEPLOY OK"
REMOTE
