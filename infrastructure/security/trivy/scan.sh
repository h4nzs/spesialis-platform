#!/usr/bin/env bash
# Trivy CVE scan harian untuk image production, notifikasi ke alert gateway.
# Cron (root): 15 3 * * * /usr/local/bin/trivy-scan.sh >> /var/log/security/trivy.log 2>&1
set -euo pipefail

# Environment (override via /etc/security/webhook.env)
WEBHOOK_ENV="${WEBHOOK_ENV:-/etc/security/webhook.env}"
if [ -f "$WEBHOOK_ENV" ]; then
  # shellcheck source=/dev/null
  . "$WEBHOOK_ENV"
fi

IMAGE="${TRIVY_IMAGE:-ghcr.io/h4nzs/api:latest}"
SEVERITY="${TRIVY_SEVERITY:-HIGH,CRITICAL}"
WEBHOOK_URL="${SECURITY_WEBHOOK_URL:-https://ahlipanggilan.id/api/v1/security/webhook}"
SECRET="${SECURITY_WEBHOOK_SECRET:-}"
STATE_DIR="${TRIVY_STATE_DIR:-/var/lib/trivy}"
REPORT_FILE="${TRIVY_REPORT_FILE:-$STATE_DIR/report.json}"

LOG_TAG="[trivy-scan]"

log() { echo "$(date -Is) $LOG_TAG $*"; }

if [ -z "$SECRET" ]; then
  log "ERROR: SECURITY_WEBHOOK_SECRET kosong (atur di $WEBHOOK_ENV)"
  exit 1
fi

command -v trivy >/dev/null || { log "ERROR: trivy tidak terinstall"; exit 1; }
command -v jq >/dev/null || { log "ERROR: jq tidak terinstall"; exit 1; }

mkdir -p "$STATE_DIR"

log "scan dimulai: $IMAGE (severity: $SEVERITY)"
if ! trivy image --format json --severity "$SEVERITY" --ignore-unfixed --cache-dir "$STATE_DIR/cache" --timeout 15m -o "$REPORT_FILE" "$IMAGE" >/dev/null 2>&1; then
  log "ERROR: trivy gagal menjalankan scan untuk $IMAGE"
  exit 1
fi

total=$(jq '.Results | map(.Vulnerabilities // [] | length) | add // 0' "$REPORT_FILE")
if [ "$total" -eq 0 ] 2>/dev/null; then
  log "OK: tidak ada vulnerability ($SEVERITY) di $IMAGE"
  exit 0
fi

crit=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL")] | length' "$REPORT_FILE")
high=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "HIGH")] | length' "$REPORT_FILE")

# Ambil 5 vulnerability paling parah untuk pesan alert
detail=$(jq -r '[.Results[]?.Vulnerabilities[]?] | sort_by(if .Severity == "CRITICAL" then 0 else 1 end) | .[:5][] | "  - \(.VulnerabilityID) (\(.Severity)): \(.Title // .PkgName)"' "$REPORT_FILE" | head -c 1500)

severity_num=5
if [ "$crit" -eq 0 ]; then severity_num=4; fi

message=$(cat <<EOF
Scan $IMAGE menemukan $total vulnerability (CRITICAL: $crit, HIGH: $high).

Top:
$detail
EOF
)

payload=$(jq -nc \
  --arg sev "$severity_num" \
  --arg event "trivy/cve-$IMAGE" \
  --arg msg "$message" \
  --arg src "trivy" \
  '{severity: $sev, event: $event, message: $msg, source: $src}')

log "ditemukan $total vulnerability (critical=$crit, high=$high) — kirim alert"
if ! curl -sf -m 20 -X POST "$WEBHOOK_URL" \
  -H "X-Security-Key: $SECRET" \
  -H 'Content-Type: application/json' \
  -d "$payload" >/dev/null; then
  log "ERROR: webhook alert gagal dikirim"
  exit 1
fi
log "alert terkirim"
