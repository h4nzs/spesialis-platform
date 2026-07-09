#!/usr/bin/env bash
set -euo pipefail

# ── Spesialis Database Backup ────────────────────────────────────
# Usage: bash scripts/backup.sh [output-dir]
#   Default output dir: ./backups/
#
# Requires: pg_dump (PostgreSQL client), .env with DATABASE_URL
#
# Schedule via cron:
#   0 3 * * * cd /opt/spesialis && bash scripts/backup.sh /mnt/backups
#
# Retention: 30 days (manages itself — see cleanup block below)
# ─────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="${1:-$PROJECT_DIR/backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
FILENAME="spesialis_db_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

mkdir -p "$OUTPUT_DIR"

# Source .env if available
if [ -f "$PROJECT_DIR/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  . "$PROJECT_DIR/.env"
  set +a
fi

DB_URL="${DATABASE_URL:-postgres://specialist:specialist@localhost:5432/specialist}"

echo "📦 Backing up database to ${OUTPUT_DIR}/${FILENAME}..."

pg_dump "$DB_URL" \
  --no-owner \
  --no-acl \
  --format=custom \
  --compress=9 \
  --file="${OUTPUT_DIR}/${FILENAME}"

echo "✅ Backup created: ${FILENAME} ($(du -h "${OUTPUT_DIR}/${FILENAME}" | cut -f1))"

# Cleanup backups older than retention period
find "$OUTPUT_DIR" -name 'spesialis_db_*.sql.gz' -mtime "+${RETENTION_DAYS}" -delete

echo "🧹 Cleaned up backups older than ${RETENTION_DAYS} days"
echo "📋 Backup complete"
