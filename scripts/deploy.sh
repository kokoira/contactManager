#!/bin/bash
# EC2 上でアプリをデプロイするスクリプト
# 使い方: bash scripts/deploy.sh
#
# 事前に以下の環境変数を設定してください（/etc/environment 等）:
#   DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD
#   RAILS_ENV, PORT, CORS_ALLOWED_ORIGIN, SECRET_KEY_BASE

set -euo pipefail

APP_DIR=/var/www/contactmanager
REPO_URL=https://github.com/kokoira/contactManager.git

export RBENV_ROOT=/opt/rbenv
export PATH="$RBENV_ROOT/bin:$RBENV_ROOT/shims:$PATH"
eval "$(rbenv init -)"

# ── 環境変数チェック ─────────────────────────────────────────
required_vars=(DATABASE_HOST DATABASE_PORT DATABASE_USER DATABASE_PASSWORD SECRET_KEY_BASE)
for var in "${required_vars[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo "Error: 環境変数 $var が設定されていません。"
    echo "terraform output backend_env_hint を参照して設定してください。"
    exit 1
  fi
done

export RAILS_ENV=${RAILS_ENV:-production}
export PORT=${PORT:-3001}
export CORS_ALLOWED_ORIGIN=${CORS_ALLOWED_ORIGIN:-http://localhost}

echo "======================================"
echo " contactManager デプロイスクリプト"
echo "======================================"

# ── コード取得 ───────────────────────────────────────────────
echo "[1/5] コードを取得中..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull origin main
elif [ -z "$(ls -A "$APP_DIR" 2>/dev/null)" ]; then
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
else
  echo "Error: $APP_DIR が空でなく .git もありません。手動で確認してください。"
  exit 1
fi

# ── Rails バックエンド ───────────────────────────────────────
echo "[2/5] Rails をセットアップ中..."
cd "$APP_DIR/backend"
bundle install --without development test
bundle exec rails db:migrate

echo "[3/5] Rails を起動中 (port $PORT)..."
if [ -f tmp/pids/server.pid ]; then
  kill "$(cat tmp/pids/server.pid)" 2>/dev/null || true
  sleep 1
fi
mkdir -p log tmp/pids
nohup bundle exec rails server -b 127.0.0.1 -p "$PORT" -e "$RAILS_ENV" \
  >> log/production.log 2>&1 &
echo $! > tmp/pids/server.pid
echo "Rails PID: $!"

# ── Next.js フロントエンド ───────────────────────────────────
echo "[4/5] Next.js をビルド・起動中..."
cd "$APP_DIR/frontend"
pnpm install --no-frozen-lockfile
NEXT_PUBLIC_API_URL="http://${CORS_ALLOWED_ORIGIN#http://}" pnpm build

if [ -f /tmp/nextjs.pid ] && kill -0 "$(cat /tmp/nextjs.pid)" 2>/dev/null; then
  kill "$(cat /tmp/nextjs.pid)"
  sleep 1
fi
nohup env PORT=3000 pnpm start >> next.log 2>&1 &
echo $! > /tmp/nextjs.pid
echo "Next.js PID: $!"

# ── Nginx リロード ───────────────────────────────────────────
echo "[5/5] Nginx をリロード中..."
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "======================================"
echo " デプロイ完了!"
echo " http://${CORS_ALLOWED_ORIGIN#http://}/ にアクセスして確認してください。"
echo "======================================"
