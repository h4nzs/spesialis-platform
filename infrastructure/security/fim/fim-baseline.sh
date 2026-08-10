#!/usr/bin/env bash
# FIM: bangun baseline sha256sum untuk file sensitif.
# Jalankan sekali sebagai root setelah provisioning, dan setiap kali ada
# perubahan file yang disengaja: sudo fim-baseline.sh
set -euo pipefail

STATE_DIR="${FIM_STATE_DIR:-/var/lib/fim}"
BASELINE="${FIM_BASELINE:-$STATE_DIR/baseline.sha256}"

mkdir -p "$STATE_DIR"

log() { echo "$(date -Is) [fim-baseline] $*"; }

files=(
  /home/deploy/spesialis-platform/.env.prod
  /home/deploy/spesialis-platform/docker-compose.prod.yml
  /home/deploy/spesialis-platform/infrastructure/docker/nginx/prod.conf
  /etc/ssh/sshd_config
  /etc/systemd/system/*.service
  /root/.ssh/authorized_keys
)

: > "$BASELINE.tmp"
count=0
for pattern in "${files[@]}"; do
  for f in $pattern; do
    [ -f "$f" ] || continue
    sha256sum "$f" >> "$BASELINE.tmp"
    count=$((count + 1))
  done
done

mv "$BASELINE.tmp" "$BASELINE"
log "baseline ditulis: $BASELINE ($count file)"
