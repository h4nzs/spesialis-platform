# RUNBOOK — Deploy Security Layer di VPS + Cloudflare

Untuk VPS produksi (sudah diverifikasi):

- Debian 13 (trixie), RAM 1.9GB, disk 30GB (46% terpakai), hostname `server`
- Repo aplikasi: `/home/deploy/spesialis-platform`
- API hanya bind `127.0.0.1:3000` (khusus nginx host)
- User `deploy` **tanpa passwordless sudo** → langkah root pakai `sudo -i` (masukkan password)
- Semua commit security belum di-deploy (repo lokal masih versi lama)

Waktu total: ±60 menit (termasuk scan trivy pertama ±10 menit).

---

## Part 1 — Deploy aplikasi terbaru (dari lokal)

Semua commit security (A2A hardening, Phase 4 events, webhook, compose `nginx-logs`) harus naik dulu:

```bash
# 1. Push semua commit ke GitHub
git push origin main

# 2. Deploy (replika CI: lint → typecheck → build → test → push image → migrate → up)
VPS_PATH=/home/deploy/spesialis-platform bash scripts/manual-deploy.sh

# 3. Verifikasi dari lokal
curl -s https://ahlipanggilan.id/api/v1/health | jq '.a2a, .status'   # a2a.llmFailures ada
curl -sI https://ahlipanggilan.id/api/v1/health | grep -i 'HTTP/'
```

Deploy otomatis menjalankan migration (`0042_create_security_events.sql` — tabel `security_events`).

> Jika memakai GitHub Actions: cukup `git push origin main`, lalu pantau workflow. Manual deploy di atas adalah alternatifnya.

---

## Part 2 — Cloudflare Dashboard

Login dash.cloudflare.com → **ahlipanggilan.id**.

### 2.1 DNS (verifikasi, bukan ubah)

- Semua record (root, `www`, `stats`) harus **Proxied** (awan oranye).
- Tidak ada record yang DNS-only (abu-abu) untuk domain publik.

### 2.2 Security → Bots

- **Bot Fight Mode**: ON

### 2.3 Security → WAF → Managed Rules

- **Cloudflare OWASP Core Ruleset**: Deploy
- Configuration: PARANOIA Level **2**, mode **Log** selama 1 minggu → lalu **Block**
  (Log dulu untuk hindari false positive pada /api/auth/*)

### 2.4 Security → WAF → Rate Limiting Rules → Create rule

| Field     | Nilai                                |
| --------- | ------------------------------------ |
| Nama      | `auth-rate-limit`                    |
| URI path  | `starts with` `/api/auth/`           |
| Method    | `POST`                               |
| Kecepatan | **20 requests / 10 seconds**         |
| Action    | **Block** (atau Challenge bila ragu) |
| Selama    | 10 menit                             |

### 2.5 SSL/TLS

- Mode: **Full (strict)** (harus, karena nginx pakai Let's Encrypt)
- Edge Certificates → Always Use HTTPS: **ON**

### 2.6 Caching

- Biarkan default (nginx cache 10s + header sudah ada; jangan aktifkan "Cache Everything").

### 2.7 Hanya saat insiden

- Security → Settings → **Under Attack Mode**: ON (manual, lalu OFF kembali)

Verifikasi setelah semua: `curl -sI https://ahlipanggilan.id/api/v1/health | grep -i 'cf-ray'` → ada header `cf-ray` = lewat Cloudflare.

---

## Part 3 — VPS: install paket & environment

Login root dulu:

```bash
ssh -i /home/ken/.ssh/deploy-key deploy@202.155.18.245
sudo -i    # masukkan password
```

### 3.1 Install paket

```bash
apt update
apt install -y trivy jq inotify-tools curl auditd unattended-upgrades ufw ca-certificates

trivy --version && inotifywait --version | head -1   # verifikasi
```

### 3.2 Environment webhook (dipakai FIM + trivy)

```bash
mkdir -p /etc/security /var/lib/fim /var/lib/trivy /var/log/security

# Salin template — path di repo VPS (sudah versi terbaru setelah deploy Part 1)
install -m 600 /home/deploy/spesialis-platform/infrastructure/security/webhook.env.example \
  /etc/security/webhook.env

# Isi secret — ambil dari .env.prod API
grep SECURITY_WEBHOOK_SECRET /home/deploy/spesialis-platform/.env.prod
nano /etc/security/webhook.env     # tempel nilai secret (file kedua baris)
chmod 600 /etc/security/webhook.env
```

### 3.3 UFW (firewall dasar)

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw enable
ufw status verbose
```

> Docker publish port tidak dimanage UFW; akses ke 80/443 via rule di atas tetap bekerja.
> Verifikasi dari luar setelah ini: `curl -sI https://ahlipanggilan.id` dari komputer lokal.

---

## Part 4 — FIM, auditd, unattended-upgrades, trivy cron

Masih di `sudo -i`.

### 4.1 FIM (file integrity)

```bash
install -m 755 /home/deploy/spesialis-platform/infrastructure/security/fim/fim-baseline.sh /usr/local/bin/fim-baseline.sh
install -m 755 /home/deploy/spesialis-platform/infrastructure/security/fim/fim-watch.sh /usr/local/bin/fim-watch.sh
install -m 644 /home/deploy/spesialis-platform/infrastructure/security/fim/fim.service /etc/systemd/system/fim.service

systemctl daemon-reload
systemctl enable --now fim          # ExecStartPre membuat baseline otomatis

systemctl status fim                # aktif
cat /var/lib/fim/baseline.sha256    # daftar file yang di-monitor
```

### 4.2 auditd

```bash
install -m 640 /home/deploy/spesialis-platform/infrastructure/security/auditd/40-security.rules \
  /etc/audit/rules.d/40-security.rules
augenrules --load
systemctl restart auditd
auditctl -l | grep ap-              # verifikasi rules aktif
```

### 4.3 unattended-upgrades (Debian — config sudah versi Debian)

```bash
install -m 644 /home/deploy/spesialis-platform/infrastructure/security/unattended-upgrades/50unattended-upgrades.conf \
  /etc/apt/apt.conf.d/50unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades   # pilih Yes

systemctl enable --now apt-daily-upgrade.timer
systemctl status apt-daily-upgrade.timer
```

> Email notifikasi butuh postfix. Tanpa postfix hapus baris `Unattended-Upgrade::Mail` — log tetap ada di `/var/log/unattended-upgrades/`.

### 4.4 Trivy cron (scan harian)

```bash
install -m 755 /home/deploy/spesialis-platform/infrastructure/security/trivy/scan.sh /usr/local/bin/trivy-scan.sh

# Cron root (masuk via: crontab -e)
# 15 3 * * * /usr/local/bin/trivy-scan.sh >> /var/log/security/trivy.log 2>&1

# Uji sekali sekarang (scan pertama ±10 menit — bangun cache image)
/usr/local/bin/trivy-scan.sh
cat /var/log/security/trivy.log     # harus ada "OK" atau "ditemukan N vulnerability"
```

---

## Part 5 — CrowdSec (IDS/IPS)

Masih di `sudo -i`, dari repo VPS:

```bash
cd /home/deploy/spesialis-platform/infrastructure/crowdsec

# 5.1 Pastikan volume log nginx sudah dibuat oleh deploy Part 1
docker volume ls | grep nginx-logs   # harus ada: spesialis-platform_nginx-logs

# 5.2 Start engine (membaca log nginx, scenario custom, collections)
docker compose -f docker-compose.crowdsec.yml up -d crowdsec
docker compose -f docker-compose.crowdsec.yml logs -f crowdsec   # Ctrl+C setelah "backend ready"

# 5.3 Generate key bouncer firewall
docker compose -f docker-compose.crowdsec.yml exec crowdsec cscli bouncers add ap-bouncer
# → simpan output key, lalu:
export BOUNCER_API_KEY=<key-dari-output>

# 5.4 Start firewall bouncer (block level nftables)
docker compose -f docker-compose.crowdsec.yml up -d
docker ps | grep crowdsec           # crowdsec + crowdsec-firewall-bouncer UP

# 5.5 Aktifkan notifikasi webhook → alert gateway (email + Discord)
#     (HANYA instalasi pertama — deploy.yml/deploy-vps.sh otomatis menyalin
#      template ini ke volume + substitusi secret + restart crowdsec setiap deploy)
#     Catatan: registrasi notifikasi dilakukan OTOMATIS oleh crowdsec saat
#     restart (membaca semua file /etc/crowdsec/notifications/*.yaml).
#     cscli v1.7.8 TIDAK punya perintah `notifications add` — jangan dipakai.
docker cp notifications/alert-gateway.yaml \
  crowdsec:/etc/crowdsec/notifications/ahlipanggilan-alert-gateway.yaml
docker exec crowdsec sed -i "s/SECRET_PLACEHOLDER/<SECURITY_WEBHOOK_SECRET-dari-.env.prod>/g" \
  /etc/crowdsec/notifications/ahlipanggilan-alert-gateway.yaml
docker restart crowdsec

# 5.6 Patch scenario hub (HANYA instalasi pertama — deploy.yml otomatis
#     menyalin infrastructure/crowdsec/hub-patches/ ke volume setiap deploy;
#     wajib karena bouncer/profil tidak bisa menambah decision tanpa
#     `remediation: true` di labels scenario, dan race konsumsi event antar
#     scenario dicegah dengan `reprocess: true` pada scenario hub yang
#     filter-nya tumpang tindih):
VOL=/var/lib/docker/volumes/crowdsec_crowdsec-config/_data
cp infrastructure/crowdsec/hub-patches/http-generic-bf.yaml \
  $VOL/hub/scenarios/crowdsecurity/http-generic-bf.yaml
cp infrastructure/crowdsec/hub-patches/http-crawl-non_statics.yaml \
  $VOL/scenarios/http-crawl-non_statics.yaml
docker restart crowdsec

# 5.7 Verifikasi
docker compose -f docker-compose.crowdsec.yml exec crowdsec cscli scenarios list   # 3 custom ada
docker compose -f docker-compose.crowdsec.yml exec crowdsec cscli collections list
docker compose -f docker-compose.crowdsec.yml exec crowdsec cscli notifications list
```

> Community Blocklist diaktifkan otomatis lewat env `COLLECTIONS` (`crowdsecurity/nginx crowdsecurity/linux`).

> **Temuan live (produksi, CrowdSec 1.7.8):**
>
> - **Filter scenario** harus pakai `evt.Meta.http_path` — `evt.Parsed.http_path`
>   TIDAK ADA di parser nginx bawaan (grok menangkap `request`, meta http_path
>   di-set dari `evt.Parsed.request`). Filter yang salah = bucket tak pernah pour.
> - **`remediation: true` wajib di labels scenario**, kalau tidak profil tidak
>   menghasilkan decision (alert tanpa decision, `cscli decisions list` kosong).
> - **`capacity` leaky = jumlah event trigger** — pakai `capacity: threshold-1`
>   (mis. threshold 5 → capacity 4), karena overflow terjadi saat count = capacity.
> - **Race konsumsi event antar scenario**: bucket di-load dengan urutan acak per
>   restart; scenario `reprocess: false` (default) MEMAKAN event sehingga scenario
>   lain (urut belakangan) tidak pernah melihatnya. Solusi: `reprocess: true` di
>   SEMUA scenario yang filter-nya tumpang tindih (401-bf, crawl-non_statics).
> - **Notifikasi http**: plugin mengirim literal `format:` sebagai body — key
>   `payload:` DIABAIKAN. Template menerima LIST `models.Alert` (pakai
>   `{{range .}}`), dan `models.Alert` TIDAK punya field `.Severity` (hardcode).
> - **Test IP** yang kena ban ter-blokir di level firewall — uji dari IP berbeda
>   atau tunggu 10 menit (ban sementara).
> - Alert lama bisa tampil "tanpa decision" — cek `cscli alerts inspect <id>`
>   field `Remediation` (false = label remediation belum ada saat alert dibuat).

---

## Part 6 — Uji end-to-end (dari lokal)

```bash
# 6.1 App-level detection: 6x login salah dari IP sama → alert HIGH (email + Discord)
for i in $(seq 1 6); do
  curl -s -o /dev/null -w '%{http_code}\n' -X POST https://ahlipanggilan.id/api/v1/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"tidak-ada@example.com","password":"salah"}'
done
# → harapnya 401 ×5 lalu 429 (rate limit) — cek email/Discord terima alert brute-force-login

# 6.2 CrowdSec: 6x 401 (harus masuk decision)
ssh -i /home/ken/.ssh/deploy-key deploy@202.155.18.245 \
  "docker exec crowdsec cscli decisions list"

# 6.3 FIM: touch file sensitif → alert (tanpa mengubah isi)
#     (di VPS, root): touch /home/deploy/spesialis-platform/infrastructure/docker/nginx/prod.conf && sleep 5
#     → di /var/log/security/ ada alert "fim/file-modified"; email/Discord terima alert

# 6.4 404 monitor + security events tersimpan
psql -h localhost -U specialist specialist -c "select event_type, severity, count(*) from security_events group by 1,2 order by 3 desc limit 10;"
#   (via: docker exec -it ahlipanggilan-postgres psql -U specialist specialist)
```

---

## Checklist selesai

- [ ] Deploy naik, `/api/v1/health` OK, migration 0042 jalan
- [ ] Cloudflare: Bot Fight ON, OWASP ruleset (Log→Block), rate rule auth, Full (strict)
- [ ] UFW: 22/80/443, default deny
- [ ] FIM active (`systemctl status fim`), baseline ada
- [ ] auditd rules `ap-*` ter-load
- [ ] apt-daily-upgrade.timer aktif
- [ ] Cron trivy 03:15, scan uji sukses
- [ ] CrowdSec + firewall bouncer UP, 3 scenarios, notifikasi webhook aktif
- [ ] Test 6.1–6.4: alert email/Discord benar-benar masuk
