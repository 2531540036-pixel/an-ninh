#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
umask 077
export PORT="${PORT:-3000}"
export HOST="${HOST:-0.0.0.0}"
if [[ -n "${CODESPACE_NAME:-}" ]]; then
  export SITE_URL="https://${CODESPACE_NAME}-${PORT}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
  export TRUST_PROXY=1
  export NODE_ENV=production
else
  export SITE_URL="${SITE_URL:-http://127.0.0.1:${PORT}}"
fi
mkdir -p "${DATA_DIR:-data}"
if [[ ! -f dist/index.html ]]; then
  npm run build
fi
if [[ "$(node --input-type=module -e 'import {db} from "./db.mjs";console.log(db.prepare("SELECT count(*) n FROM admins").get().n);db.close();')" == "0" ]]; then
  npm run admin:create > "${DATA_DIR:-data}/admin-first-login.txt"
  printf 'Tài khoản Admin mới được lưu riêng tại %s/admin-first-login.txt\n' "${DATA_DIR:-data}"
fi
if ! curl --fail --silent "http://127.0.0.1:${PORT}/api/site" > /dev/null; then
  nohup npm start > "${DATA_DIR:-data}/server.log" 2>&1 < /dev/null &
  printf '%s\n' "$!" > "${DATA_DIR:-data}/server.pid"
fi
for attempt in {1..15}; do
  if curl --fail --silent "http://127.0.0.1:${PORT}/api/site" > /dev/null; then
    printf '\nWebsite đã khởi chạy: %s\n' "$SITE_URL"
    printf 'Nếu chưa tự mở, chọn tab PORTS → cổng %s → Open in Browser.\n' "$PORT"
    exit 0
  fi
  sleep 1
done
printf 'Chưa khởi chạy được. Xem nhật ký tại %s/server.log\n' "${DATA_DIR:-data}" >&2
exit 1
