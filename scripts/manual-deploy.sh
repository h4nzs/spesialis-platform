#!/usr/bin/env bash
# =============================================================================
# Manual Deploy — replika CI + Deploy workflow (untuk saat GitHub Actions down)
# =============================================================================
# Menjalankan apa yang dilakukan workflow CI + Deploy secara manual:
#   1. CI checks (format, lint, typecheck, build, unit test)
#   2. Build image API + Web
#   3. Push ke ghcr.io (tag: latest + <sha>)
#   4. Eksekusi scripts/deploy-vps.sh di VPS (sync, pull, migrate, up, health)
#
# Penggunaan:
#   VPS_PATH=/home/deploy/spesialis-platform bash scripts/manual-deploy.sh
#
# Variabel opsional:
#   CI_CHECKS=false   — skip CI checks (hanya build + deploy)
#   IMAGE_TAG=<sha>   — default: commit HEAD lokal
#   IMAGE_OWNER=h4nzs — default
#   VPS_HOST=vps      — SSH alias / host (default dari ~/.ssh/config)
# =============================================================================
set -euo pipefail

cd "$(dirname "$0")/.."

CI_CHECKS="${CI_CHECKS:-true}"
IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse HEAD)}"
IMAGE_OWNER="${IMAGE_OWNER:-h4nzs}"
VPS_HOST="${VPS_HOST:-vps}"
VPS_PATH="${VPS_PATH:?set VPS_PATH — contoh: VPS_PATH=/home/deploy/spesialis-platform}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Manual Deploy — tag=${IMAGE_TAG} owner=${IMAGE_OWNER} vps=${VPS_HOST}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. CI checks (sama dengan workflow CI) ────────────────────────────
if [ "$CI_CHECKS" = "true" ]; then
  echo "▶ pnpm format:check"
  pnpm format:check
  echo "▶ pnpm db:check-migrations"
  pnpm db:check-migrations
  echo "▶ pnpm lint"
  pnpm lint
  echo "▶ analytics:validate + analytics:lint"
  pnpm --filter @ahlipanggilan/analytics analytics:validate
  pnpm --filter @ahlipanggilan/analytics analytics:lint
  echo "▶ pnpm typecheck"
  pnpm typecheck
  echo "▶ pnpm build"
  pnpm build
  echo "▶ pnpm test"
  pnpm test
else
  echo "⚠ CI checks di-skip (CI_CHECKS=false)"
fi

# ── 2. Login GHCR ─────────────────────────────────────────────────────
echo "▶ docker login ghcr.io (akun ${IMAGE_OWNER})"
echo "$(gh auth token)" | docker login ghcr.io -u "$IMAGE_OWNER" --password-stdin

# ── 3. Build & push images ────────────────────────────────────────────
echo "▶ Build API: ghcr.io/${IMAGE_OWNER}/api:${IMAGE_TAG}"
docker build -f infrastructure/docker/api/Dockerfile \
  -t "ghcr.io/${IMAGE_OWNER}/api:latest" \
  -t "ghcr.io/${IMAGE_OWNER}/api:${IMAGE_TAG}" .

echo "▶ Build Web: ghcr.io/${IMAGE_OWNER}/web:${IMAGE_TAG}"
docker build -f infrastructure/docker/web/Dockerfile \
  -t "ghcr.io/${IMAGE_OWNER}/web:latest" \
  -t "ghcr.io/${IMAGE_OWNER}/web:${IMAGE_TAG}" .

echo "▶ Push API"
docker push "ghcr.io/${IMAGE_OWNER}/api:latest"
docker push "ghcr.io/${IMAGE_OWNER}/api:${IMAGE_TAG}"
echo "▶ Push Web"
docker push "ghcr.io/${IMAGE_OWNER}/web:latest"
docker push "ghcr.io/${IMAGE_OWNER}/web:${IMAGE_TAG}"

# ── 4. Deploy ke VPS ──────────────────────────────────────────────────
echo "▶ Kirim scripts/deploy-vps.sh ke ${VPS_HOST} dan jalankan"
scp scripts/deploy-vps.sh "${VPS_HOST}:/tmp/deploy-vps.sh"
ssh "${VPS_HOST}" "bash /tmp/deploy-vps.sh '${IMAGE_TAG}' '${IMAGE_OWNER}' '${VPS_PATH}'"
ssh "${VPS_HOST}" "rm -f /tmp/deploy-vps.sh"

# ── 5. Verifikasi dari luar ───────────────────────────────────────────
echo "▶ Verifikasi https://ahlipanggilan.id"
sleep 15
curl -sSf "https://ahlipanggilan.id/api/v1/health" \
  && echo "   API health OK" \
  || echo "⚠ API health gagal — cek docker logs ahlipanggilan-api di VPS"
curl -sSf "https://ahlipanggilan.id/" -o /dev/null -w "   Web HTTP %{http_code}\n" \
  || echo "⚠ Web check gagal"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Selesai. Rollback: IMAGE_TAG=<sha-lama> VPS_PATH=$VPS_PATH"
echo "   ssh vps \"cd $VPS_PATH && IMAGE_TAG=<sha-lama> IMAGE_OWNER=$IMAGE_OWNER docker compose -f docker-compose.prod.yml --env-file .env.prod up -d\""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
