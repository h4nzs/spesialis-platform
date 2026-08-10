#!/usr/bin/env bash
# =============================================================================
# Deploy script yang dijalankan DI VPS (dikirim via scp oleh manual-deploy.sh)
# Replika langkah deploy.yml bagian "Deploy to VPS".
#
# Argumen: $1 = IMAGE_TAG, $2 = IMAGE_OWNER, $3 = VPS_PATH
# =============================================================================
set -euo pipefail

IMAGE_TAG="$1"
IMAGE_OWNER="$2"
VPS_PATH="$3"

cd "$VPS_PATH"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Deploy di VPS — tag=${IMAGE_TAG} owner=${IMAGE_OWNER}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Sync repository code ──────────────────────────────────────────────
echo "▶ Sync kode dari GitHub (git reset --hard origin/main)"
git fetch origin main
git reset --hard origin/main
git clean -fd -e .env.prod

# ── Simpan tag deploy sebelumnya (untuk rollback) ────────────────────
PREVIOUS_TAG=$(docker inspect ahlipanggilan-api --format '{{.Config.Image}}' 2>/dev/null | sed 's|.*:||' || echo "")
echo "   Deploy sebelumnya: ${PREVIOUS_TAG:-(tidak ada — deploy pertama)}"

export IMAGE_TAG
export IMAGE_OWNER
export COMPOSE_ENV_FILE="--env-file .env.prod"

# ── Free up disk ──────────────────────────────────────────────────────
echo "▶ Free up disk (docker image prune)"
BEFORE=$(df -h / | awk 'NR==2 {print $4}')
docker image prune -a -f 2>/dev/null || true
docker builder prune -a -f 2>/dev/null || true
AFTER=$(df -h / | awk 'NR==2 {print $4}')
echo "   Disk: $BEFORE → $AFTER free"

# ── Pull images ───────────────────────────────────────────────────────
echo "▶ Pull ghcr.io/${IMAGE_OWNER}/api:${IMAGE_TAG} + web"
docker compose -f docker-compose.prod.yml $COMPOSE_ENV_FILE pull

# ── SSL (hanya jika belum ada) ────────────────────────────────────────
if [ ! -f /etc/letsencrypt/live/ahlipanggilan.id/fullchain.pem ]; then
  echo "▶ SSL cert belum ada — request via certbot"
  docker run --rm -p 80:80 \
    -v /etc/letsencrypt:/etc/letsencrypt \
    -v /var/www/letsencrypt:/var/www/letsencrypt \
    certbot/certbot certonly --standalone \
    -d ahlipanggilan.id -d www.ahlipanggilan.id \
    --non-interactive --agree-tos \
    --email admin@ahlipanggilan.id || \
    echo "   SSL setup skipped -- akan dicoba lagi deploy berikutnya"
else
  echo "▶ SSL cert ditemukan — skip"
fi

# ── Start postgres & tunggu healthy ───────────────────────────────────
echo "▶ Start postgres"
docker compose -f docker-compose.prod.yml $COMPOSE_ENV_FILE up -d postgres

DB_READY=false
for i in $(seq 1 20); do
  HEALTH=$(docker inspect --format='{{.State.Health.Status}}' ahlipanggilan-postgres 2>/dev/null || echo "missing")
  if [ "$HEALTH" = "healthy" ]; then
    echo "   Database healthy!"
    DB_READY=true
    break
  fi
  echo "   Postgres health: $HEALTH (menunggu...)"
  sleep 3
done

if [ "$DB_READY" = false ]; then
  echo "⚠ Database tidak healthy — TIDAK reset volume otomatis."
  echo "  Periksa manual: docker logs ahlipanggilan-postgres"
fi

# ── Backup + migrate ──────────────────────────────────────────────────
if [ "$DB_READY" = true ]; then
  echo "▶ Backup database sebelum migrate"
  BACKUP_DIR="${VPS_PATH}/db-backups"
  mkdir -p "$BACKUP_DIR"
  BACKUP_FILE="$BACKUP_DIR/pre-migrate-$(date +%Y%m%d-%H%M%S).sql"
  docker compose -f docker-compose.prod.yml $COMPOSE_ENV_FILE exec -T postgres \
    pg_dump -U specialist specialist > "$BACKUP_FILE" && \
    echo "   Backup: $BACKUP_FILE" || \
    echo "   ⚠ Backup gagal — lanjut saja"

  find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete 2>/dev/null || true

  echo "▶ Jalankan migration (drizzle)"
  docker compose -f docker-compose.prod.yml $COMPOSE_ENV_FILE run --rm api \
    pnpm --filter @ahlipanggilan/database db:migrate
else
  echo "⚠ Skipping migration (DB tidak healthy)"
fi

# ── Start full stack + health check ───────────────────────────────────
echo "▶ Start full stack"
docker compose -f docker-compose.prod.yml $COMPOSE_ENV_FILE up -d

DEPLOY_SUCCESS=false
for i in $(seq 1 10); do
  if curl -sf http://localhost:3000/api/v1/health >/dev/null 2>&1; then
    DEPLOY_SUCCESS=true
    break
  fi
  sleep 3
done

if [ "$DEPLOY_SUCCESS" = true ]; then
  echo "✅ API health check passed — deployment successful!"
else
  echo "⚠ API health check FAILED"
  echo "=== API LOGS ==="
  docker logs ahlipanggilan-api --tail 30 2>/dev/null || echo "(no logs)"
  echo "================"
fi

# ── Sync komponen security (CrowdSec volume + nginx) ─────────────────
# Idempotent: jalankan setiap deploy. Notifikasi & hub-patches disalin
# dari repo ke volume CrowdSec (dengan secret dari .env.prod), lalu
# crowdsec di-restart agar memuat scenario/acquis/notifikasi terbaru.
# Nginx di-restart agar template prod.conf dirender ulang (envsubst).
# Catatan: pakai `docker cp` (bukan path volume langsung) karena file
# volume milik root sedangkan deploy berjalan sebagai user non-root yang
# hanya punya akses docker daemon.
echo "▶ Sync komponen security (CrowdSec volume + nginx)"
if docker ps -a --format '{{.Names}}' | grep -q '^crowdsec$'; then
  SECRET=$(grep -E '^SECURITY_WEBHOOK_SECRET=' "$VPS_PATH/.env.prod" | head -1 | cut -d= -f2-)

  if [ -n "$SECRET" ]; then
    sed "s/SECRET_PLACEHOLDER/$SECRET/g" \
      "$VPS_PATH/infrastructure/crowdsec/notifications/alert-gateway.yaml" \
      > /tmp/ahlipanggilan-alert-gateway.yaml
    docker cp /tmp/ahlipanggilan-alert-gateway.yaml \
      crowdsec:/etc/crowdsec/notifications/ahlipanggilan-alert-gateway.yaml
    rm -f /tmp/ahlipanggilan-alert-gateway.yaml
    echo "   ✓ notifikasi CrowdSec disinkronkan"
  else
    echo "   ⚠ SECURITY_WEBHOOK_SECRET kosong di .env.prod — notifikasi tidak di-sync"
  fi

  if [ -d "$VPS_PATH/infrastructure/crowdsec/hub-patches" ]; then
    # Semua patch scenario (reprocess:true — cegah race konsumsi event
    # antar scenario) + pattern SQLi/XSS disalin ke volume setiap deploy;
    # rm dulu agar symlink hub tidak mengganggu.
    for PATCH in "$VPS_PATH/infrastructure/crowdsec/hub-patches/"*; do
      BASE=$(basename "$PATCH")
      case "$BASE" in
        *.txt)
          docker exec crowdsec rm -f "/etc/crowdsec/patterns/$BASE" 2>/dev/null || true
          for i in 1 2 3; do
            docker cp "$PATCH" "crowdsec:/etc/crowdsec/patterns/$BASE" 2>/dev/null && break
            sleep 1
          done
          ;;
        *.yaml)
          docker exec crowdsec rm -f "/etc/crowdsec/scenarios/$BASE" 2>/dev/null || true
          for i in 1 2 3; do
            docker cp "$PATCH" "crowdsec:/etc/crowdsec/scenarios/$BASE" 2>/dev/null && break
            sleep 1
          done
          ;;
      esac
    done
    docker exec crowdsec sh -c "ls /etc/crowdsec/scenarios/ | grep -c http" \
      || echo "   ⚠ verifikasi scenario gagal"
    echo "   ✓ hub-patches CrowdSec disinkronkan"
  fi

  docker compose -f "$VPS_PATH/infrastructure/crowdsec/docker-compose.crowdsec.yml" \
    up -d crowdsec || echo "   ⚠ compose crowdsec gagal"
  # catatan: registrasi notifikasi otomatis dari file yaml saat restart
  # (cscli v1.7.8 tidak punya perintah `notifications add`)
  docker restart crowdsec && echo "   ✓ crowdsec di-restart" || echo "   ⚠ restart crowdsec gagal"
  # pattern SQLi/XSS: entrypoint container kadang gagal men-download
  # data file scenario (file jadi kosong) — selalu restore dari repo
  # SETELAH restart (restart berikutnya bisa menimpa lagi).
  for PAT in sqli_probe_patterns.txt xss_probe_patterns.txt; do
    for i in 1 2 3; do
      docker cp "$VPS_PATH/infrastructure/crowdsec/hub-patches/$PAT" \
        "crowdsec:/etc/crowdsec/patterns/$PAT" 2>/dev/null && break
      sleep 1
    done
  done
  docker exec crowdsec sh -c "wc -l /etc/crowdsec/patterns/sqli_probe_patterns.txt /etc/crowdsec/patterns/xss_probe_patterns.txt" \
    || echo "   ⚠ verifikasi pattern gagal"
  echo "   ✓ pattern SQLi/XSS disinkronkan"
else
  echo "   ⚠ crowdsec belum terinstall — langkah security dilewati (RUNBOOK Part 5)"
fi

echo "▶ Restart nginx (apply prod.conf)"
docker compose -f "$VPS_PATH/docker-compose.prod.yml" $COMPOSE_ENV_FILE restart nginx \
  || echo "   ⚠ restart nginx gagal"

echo "▶ Final health check"
for i in $(seq 1 6); do
  if curl -sf http://localhost:3000/api/v1/health >/dev/null 2>&1; then
    echo "   ✅ API healthy"
    break
  fi
  sleep 3
done

# ── Auto-rollback ─────────────────────────────────────────────────────
if [ "$DEPLOY_SUCCESS" = false ] && [ -n "$PREVIOUS_TAG" ] && [ "$PREVIOUS_TAG" != "$IMAGE_TAG" ]; then
  echo "↩ Rollback ke deploy sebelumnya: $PREVIOUS_TAG"
  export IMAGE_TAG=$PREVIOUS_TAG
  docker compose -f docker-compose.prod.yml $COMPOSE_ENV_FILE up -d

  ROLLBACK_OK=false
  for i in $(seq 1 10); do
    if curl -sf http://localhost:3000/api/v1/health >/dev/null 2>&1; then
      ROLLBACK_OK=true
      break
    fi
    sleep 3
  done

  if [ "$ROLLBACK_OK" = true ]; then
    echo "✅ Rollback sukses (${PREVIOUS_TAG})."
    echo "   ⚠ Migration sudah ter-apply dan TIDAK di-rollback."
    echo "   Restore manual jika perlu:"
    echo "   docker compose -f docker-compose.prod.yml \${COMPOSE_ENV_FILE} exec -T postgres psql -U specialist specialist < db-backups/pre-migrate-<timestamp>.sql"
  else
    echo "❌ Rollback GAGAL — intervensi manual diperlukan"
  fi
elif [ "$DEPLOY_SUCCESS" = false ]; then
  echo "❌ Deploy gagal dan tidak ada versi sebelumnya untuk rollback"
fi

# ── Cleanup ───────────────────────────────────────────────────────────
docker image prune -a -f 2>/dev/null || true
echo "=== Container status ==="
docker ps --format 'table {{.Names}}\t{{.Status}}'

# Exit code: gagal hanya jika rollback terjadi (agar caller tahu)
[ "$DEPLOY_SUCCESS" = true ] || [ "$ROLLBACK_OK" = true ]
