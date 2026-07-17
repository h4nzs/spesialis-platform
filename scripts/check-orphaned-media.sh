#!/usr/bin/env bash
set -euo pipefail

# ── Spesialis Check Orphaned Media ──────────────────────────────
# Mendeteksi media records di database yang disk='Cloudflare R2'
# tapi file-nya sudah tidak ada di R2 bucket.
#
# Usage:
#   bash scripts/check-orphaned-media.sh          # read-only
#   bash scripts/check-orphaned-media.sh --delete --force   # hapus
#
# Schedule via cron (read-only — Minggu jam 3 pagi):
#   0 3 * * 0 cd /opt/ahlipanggilan && bash scripts/check-orphaned-media.sh
#
# Untuk auto-cleanup (lebih agresif — tiap hari jam 4 pagi):
#   0 4 * * * cd /opt/ahlipanggilan && bash scripts/check-orphaned-media.sh --delete --force >> /var/log/ahlipanggilan-orphaned.log 2>&1
#
# Prasyarat:
#   - Docker Compose production (docker-compose.prod.yml) running
#   - Environment file .env.prod tersedia
# ─────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
API_CONTAINER="ahlipanggilan-api"
TIMESTAMP="$(date '+%Y-%m-%d %H:%M:%S')"

echo "[${TIMESTAMP}] 🔍 Checking orphaned media records..."

# Cek apakah container API running
if ! docker ps --format '{{.Names}}' | grep -q "^${API_CONTAINER}$"; then
  echo "[${TIMESTAMP}] ❌ Container ${API_CONTAINER} tidak berjalan."
  echo "     Jalankan: docker compose -f ${DOCKER_COMPOSE_FILE} up -d"
  exit 1
fi

# Jalankan check di dalam container API
cd "$PROJECT_DIR"

# Gunakan db:check-media:prod (tanpa --env-file) karena env vars
# sudah tersedia dari environment: di docker-compose.prod.yml
if [ $# -gt 0 ]; then
  docker compose -f "${DOCKER_COMPOSE_FILE}" exec -T "${API_CONTAINER}" \
    pnpm --filter @ahlipanggilan/api db:check-media:prod "$@"
  EXIT_CODE=$?
else
  docker compose -f "${DOCKER_COMPOSE_FILE}" exec -T "${API_CONTAINER}" \
    pnpm --filter @ahlipanggilan/api db:check-media:prod
  EXIT_CODE=$?
fi

if [ $EXIT_CODE -eq 0 ]; then
  echo "[${TIMESTAMP}] ✅ Check orphaned media selesai."
else
  echo "[${TIMESTAMP}] ⚠️  Check orphaned media selesai dengan kode ${EXIT_CODE}."
fi

exit $EXIT_CODE
