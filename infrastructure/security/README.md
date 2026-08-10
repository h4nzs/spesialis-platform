# Security Monitoring — Host Level (Phase 3)

Pengganti Wazuh ringan untuk VPS ≤4GB. Semua komponen berjalan di host
(manual SSH), mengirim alert melalui webhook ke alert gateway API
(`POST /api/v1/security/webhook`) — satu jalur notifikasi dengan CrowdSec.

## Komponen

| Direktori              | Fungsi                                                                        |
| ---------------------- | ----------------------------------------------------------------------------- |
| `trivy/`               | CVE scan image production harian → alert bila ada HIGH/CRITICAL               |
| `fim/`                 | File integrity: baseline sha256 + inotify daemon → alert create/modify/delete |
| `auditd/`              | Watch akses file sensitif (siapa akses/mengubah)                              |
| `unattended-upgrades/` | Auto security patches + notifikasi email                                      |

## Prasyarat (sekali saja, saat deploy)

```bash
# Paket
apt install -y trivy jq inotify-tools curl auditd unattended-upgrades

# Environment bersama — GANTI secret dengan nilai dari .env.prod API
mkdir -p /etc/security
install -m 600 infrastructure/security/webhook.env.example /etc/security/webhook.env

# State
mkdir -p /var/lib/fim /var/lib/trivy /var/log/security
```

## 1. Trivy CVE scan (harian)

```bash
install -m 755 infrastructure/security/trivy/scan.sh /usr/local/bin/trivy-scan.sh

# Cron root — jalankan `crontab -e` sebagai root:
# 15 3 * * * /usr/local/bin/trivy-scan.sh >> /var/log/security/trivy.log 2>&1
```

Catatan: scan pertama membangun cache image (±10 menit). Alert hanya
terkirim bila ada vulnerability HIGH/CRITICAL.

## 2. FIM (file integrity)

```bash
install -m 755 infrastructure/security/fim/fim-baseline.sh /usr/local/bin/fim-baseline.sh
install -m 755 infrastructure/security/fim/fim-watch.sh /usr/local/bin/fim-watch.sh
install -m 644 infrastructure/security/fim/fim.service /etc/systemd/system/fim.service

/usr/local/bin/fim-baseline.sh        # baseline awal
systemctl daemon-reload
systemctl enable --now fim            # otomatis rebuild baseline + watch
```

- Baseline: `/var/lib/fim/baseline.sha256` (rebuild manual setelah perubahan disengaja).
- Cooldown alert: 300 detik per file (atur `FIM_COOLDOWN_SECS` di webhook.env).
- `fim.service` merebuild baseline di setiap start — aman setelah maintenance.

## 3. auditd (file access log)

```bash
install -m 640 infrastructure/security/auditd/40-security.rules /etc/audit/rules.d/40-security.rules
augenrules --load && systemctl restart auditd
# Cek: auditctl -l | grep ap-
```

## 4. unattended-upgrades

```bash
install -m 644 infrastructure/security/unattended-upgrades/50unattended-upgrades.conf \
  /etc/apt/apt.conf.d/50unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades   # jawab Yes
systemctl enable --now unattended-upgrades.service
```

Catatan: email notifikasi (`Unattended-Upgrade::Mail`) butuh MTA terinstall
(postfix). Tanpa MTA, matikan baris Mail di config — log tetap ada di
`/var/log/unattended-upgrades/`. Reboot tetap manual (kernel di-blacklist).

## Verifikasi

```bash
systemctl status fim                          # FIM aktif
journalctl -u fim -n 20                       # log FIM
trivy-scan.sh                                 # test sekali (manual)
auditctl -l | grep ap-                        # rules auditd aktif
tail -f /var/log/security/fim.log             # alert FIM (jika ada)
```
