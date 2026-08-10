#!/usr/bin/env bash
# FIM daemon: inotifywait watch file/dir sensitif → banding baseline → alert.
# Dijalankan sebagai systemd service (lihat fim.service).
set -uo pipefail

# Environment (override via /etc/security/webhook.env)
WEBHOOK_ENV="${WEBHOOK_ENV:-/etc/security/webhook.env}"
if [ -f "$WEBHOOK_ENV" ]; then
  # shellcheck source=/dev/null
  . "$WEBHOOK_ENV"
fi

STATE_DIR="${FIM_STATE_DIR:-/var/lib/fim}"
BASELINE="${FIM_BASELINE:-$STATE_DIR/baseline.sha256}"
COOLDOWN_DIR="$STATE_DIR/cooldown"
WEBHOOK_URL="${SECURITY_WEBHOOK_URL:-https://ahlipanggilan.id/api/v1/security/webhook}"
SECRET="${SECURITY_WEBHOOK_SECRET:-}"
COOLDOWN_SECS="${FIM_COOLDOWN_SECS:-300}"

LOG_TAG="[fim-watch]"
log() { echo "$(date -Is) $LOG_TAG $*"; }

# Direktori yang di-watch (semua file di dalamnya)
watch_dirs=(
  /etc/nginx
  /etc/ssh
  /etc/systemd/system
  /root/.ssh
  /home/deploy/spesialis-platform
)

if [ ! -f "$BASELINE" ]; then
  log "FATAL: baseline tidak ada — jalankan fim-baseline.sh dulu"
  exit 1
fi
if [ -z "$SECRET" ]; then
  log "FATAL: SECURITY_WEBHOOK_SECRET kosong (atur di $WEBHOOK_ENV)"
  exit 1
fi
command -v inotifywait >/dev/null || { log "FATAL: inotify-tools tidak terinstall"; exit 1; }
command -v jq >/dev/null || { log "FATAL: jq tidak terinstall"; exit 1; }
command -v curl >/dev/null || { log "FATAL: curl tidak terinstall"; exit 1; }

mkdir -p "$COOLDOWN_DIR"

send_alert() {
  local severity="$1" event="$2" message="$3"
  local key
  key=$(printf '%s|%s' "$event" "$message" | sha256sum | cut -d' ' -f1)
  local marker="$COOLDOWN_DIR/$key"
  local now
  now=$(date +%s)

  if [ -f "$marker" ] && [ $((now - $(cat "$marker"))) -lt "$COOLDOWN_SECS" ]; then
    return 0
  fi

  local payload
  payload=$(jq -nc --arg sev "$severity" --arg event "$event" --arg msg "$message" --arg src "fim" \
    '{severity: $sev, event: $event, message: $msg, source: $src}')

  if curl -sf -m 15 -X POST "$WEBHOOK_URL" \
    -H "X-Security-Key: $SECRET" \
    -H 'Content-Type: application/json' \
    -d "$payload" >/dev/null 2>&1; then
    echo "$now" > "$marker"
    log "alert terkirim: $event"
  else
    log "ERROR: webhook gagal untuk $event"
  fi
}

alert_modify() {
  local file="$1" expected
  expected=$(grep -F "  $file" "$BASELINE" | awk '{print $1}')
  local actual
  actual=$(sha256sum "$file" 2>/dev/null | awk '{print $1}')
  if [ -n "$expected" ] && [ -n "$actual" ] && [ "$expected" = "$actual" ]; then
    log "ignore (konten sama): $file"
    return 0
  fi
  send_alert 5 "fim/file-modified" "File sensitif berubah: $file"
}

alert_create() {
  local file="$1"
  if grep -qF "  $file" "$BASELINE"; then
    log "ignore (sudah di baseline): $file"
    return 0
  fi
  send_alert 4 "fim/new-file" "File baru di lokasi sensitif: $file"
}

alert_delete() {
  local file="$1"
  if ! grep -qF "  $file" "$BASELINE"; then
    log "ignore (tidak di baseline): $file"
    return 0
  fi
  send_alert 5 "fim/file-deleted" "File sensitif dihapus: $file"
}

log "fim-watch dimulai (cooldown ${COOLDOWN_SECS}s)"
inotifywait -m -r -e modify,create,delete,delete_self \
  --format '%w%f|%e' "${watch_dirs[@]}" |
  while IFS='|' read -r path event; do
    [ -n "$path" ] || continue
    case "$event" in
      MODIFY*) alert_modify "$path" ;;
      CREATE*) alert_create "$path" ;;
      DELETE*) alert_delete "$path" ;;
    esac
  done
