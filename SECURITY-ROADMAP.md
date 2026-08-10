# Security Layer — Rencana Implementasi Ahli Panggilan

Dokumen perencanaan security layer untuk platform Ahli Panggilan (on-demand service booking).
Menggambarkan kondisi saat ini, arsitektur target, dan rencana implementasi bertahap (4 fase).

Status: **Rancangan** — eksekusi bertahap, mulai dari Phase 4 (app-level security).

---

## 1. Ringkasan Eksekutif

| Item              | Nilai                                                                    |
| ----------------- | ------------------------------------------------------------------------ |
| VPS               | ≤4 GB RAM (constraint: Wazuh penuh tidak feasible)                       |
| CDN/Edge          | Cloudflare (Free plan — domain sudah full-proxy)                         |
| Reverse proxy     | Nginx (config sudah di repo `infrastructure/docker/nginx/prod.conf`)     |
| Prioritas         | **Phase 4 (app-level security) dieksekusi pertama**                      |
| Mode detection v1 | **Alert-only** (auto-block menyusul setelah rules terbukti stabil)       |
| Notifikasi        | Email `spesialis.onovoda@gmail.com` + Discord webhook — terpusat via env |

---

## 2. Kondisi Security Saat Ini (Gap Analysis)

### Sudah ada

| Layer          | Detail                                                                                                                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloudflare     | Domain sudah full-proxy — nginx sudah set `set_real_ip_from` CF ranges + `CF-Connecting-IP` (`prod.conf:19-36`). Belum ada WAF rules / bot / rate-limit rules                                                        |
| Nginx          | Rate limit zones (`general` 30r/s, `api` 100r/s, `auth` 10r/s, `static` 200r/s), security headers (HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy), JSON access log |
| API rate limit | 2 lapis: global `rateLimit(100)` (`routes/index.ts:57`) + per-endpoint ketat (login 10/min, register 10/min, forgot-password 5/min, verify 10/min — `routes/auth.ts`)                                                |
| Auth           | JWT + Argon2id, cookie httpOnly + SameSite=Strict, RBAC 8 roles, refresh token rotate                                                                                                                                |
| Audit data     | `audit_logs` (perubahan data, `user_id NOT NULL`, immutable via DB trigger) — tidak menangkap failed login/429/anomali                                                                                               |
| Email          | Resend (prod) + SMTP/Mailpit fallback (`lib/email.ts`, `lib/resend.ts`) — bisa di-reuse untuk alert                                                                                                                  |
| A2A agent      | Metrics `llm-failures` di `/api/v1/health`                                                                                                                                                                           |

### Belum ada (gap)

- Security event log app-level (failed login, 429, payload anomali, enumeration)
- Detection engine berbasis rules (behavior aplikasi)
- Alert gateway terpusat (email + Discord)
- Auto-block IP app-level
- Konfigurasi Cloudflare WAF/bot/rate-limit
- Host IDS/IPS (CrowdSec)
- FIM / CVE scanning / monitoring host (Wazuh)
- Firewall host (UFW/nftables)

---

## 3. Arsitektur Target

```
                         INTERNET
                            │
                            ▼
                   ┌─────────────────┐
                   │   Cloudflare     │   Phase 1
                   │ DNS + WAF + DDoS │   Bot Fight Mode (Free)
                   │   Rate Limiting  │   1 rule: POST /api/auth/*
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │      Nginx      │   Phase 2 input: access log
                   │ Reverse Proxy   │ ───────────────┐
                   └────────┬────────┘                │
                  ┌─────────┴─────────┐               ▼
                  ▼                   ▼        ┌────────────┐
             ┌──────────┐       ┌──────────┐   │  CrowdSec  │  Phase 2
             │   Web    │       │   API    │   │ IDS + IPS  │  (ringan, ±150MB)
             │  Astro   │       │  Hono    │   └─────┬──────┘
             └──────────┘       └────┬─────┘         │ decision (block 403 / firewall)
                                     │               ▼
                              ┌──────▼──────┐   host firewall (UFW/nftables)
                              │ PostgreSQL  │
                              └─────────────┘

              Monitoring host (Phase 3 — pengganti Wazuh untuk ≤4GB RAM)
              ┌─────────────────────────────────────────────┐
              │  trivy (CVE scan container/image, cron)      │
              │  FIM script ringan (baseline checksum +      │
              │    inotifywait: .env, nginx.conf, compose)   │
              │  auditd (file access OS level)               │
              └────────────────────┬────────────────────────┘
                                   ▼
              ┌─────────────────────────────────────────────┐
              │  App-level security (Phase 4 — Hono)         │
              │  security_events (DB) + detector + rules     │
              │  alert gateway: email + Discord              │
              └─────────────────────────────────────────────┘
```

---

## 4. Phase 1 — Perimeter: Cloudflare + Nginx + Firewall

Constraint: **Cloudflare Free plan** — fitur dibatasi (1 rate-limit rule, 1 set WAF managed rules).

### 4.1 Cloudflare (konfigurasi dashboard)

1. **Bot Fight Mode** (Security → Bots, Free): aktifkan `Managed challenge` untuk traffic bot diketahui.
2. **WAF → Managed Rules**: aktifkan Cloudflare OWASP core ruleset (default 3.0 / paranoia level 1) — mitigasi SQLi/XSS/traversal di edge.
3. **Rate Limiting Rules** (1 rule gratis) → dipakai untuk yang paling penting:
   ```
   Field: URI Path contains /api/auth/  |  Method: POST
   Requests: 20 per 10 seconds
   Action: Managed Challenge
   ```
4. **DDoS Protection**: bawaan Cloudflare (otomatis, tidak perlu konfigurasi).
5. **Security Events** sebagai sumber intel: periksa IP/path/UA/country/ASN yang ditandai.

### 4.2 Nginx (hardening tambahan — mayoritas sudah ada)

Sudah: rate zones, security headers, JSON log, `proxy_cache` hanya untuk GET publik, A2A tanpa cache/buffering.

Belum (usulan):

- `limit_req` pada `POST` non-auth tetap dipertahankan (sudah).
- Review: pastikan `X-Original-Forwarded-For` di `location /api/` tidak bisa di-spoof oleh client langsung (hanya nginx yang menambahkannya — sudah aman karena nginx selalu set).
- Opsional: nonaktifkan `add_header` ganda pada respons yang di-cache (already handled via `always`).

### 4.3 Firewall host (manual SSH)

```
ufw default deny incoming
ufw allow OpenSSH (dari IP admin saja — opsional, lebih ketat)
ufw allow 80, 443 (HTTP/HTTPS via Cloudflare — atau batasi ke IP Cloudflare ranges)
ufw allow 22 (SSH)
ufw enable
```

Opsi lebih ketat: hanya izinkan 80/443 dari CIDR Cloudflare (ranges resmi), sehingga server tidak bisa diakses langsung oleh publik.

---

## 5. Phase 2 — CrowdSec (IDS/IPS ringan)

Feasible di VPS ≤4GB (±150MB RAM). Dipasang via **manual SSH** (host level).

**Status: persiapan repo selesai** — `infrastructure/crowdsec/` berisi compose,
acquisition, 3 custom scenarios, dan notifikasi webhook ke alert gateway.
Tinggal jalankan manual di host saat deploy (lihat README di direktori
tersebut).

### Komponen

| Komponen                    | Fungsi                                                   |
| --------------------------- | -------------------------------------------------------- |
| `crowdsec`                  | Engine — baca log, evaluasi scenario, hasilkan decisions |
| `crowdsec-firewall-bouncer` | Terapkan block di level firewall (nftables/iptables)     |

Catatan: `crowdsec-nginx-bouncer` TIDAK dipakai — nginx berjalan di container
alpine tanpa modul Lua; firewall bouncer menutupi kebutuhan blok.

### Alur

```
Attacker ──100 login attempts──▶ Nginx logs (volume ahlipanggilan_nginx-logs)
                                        │
                                        ▼
                                   CrowdSec
                                   ├── detect brute force (scenario ahlipanggilan/bruteforce-login)
                                   ├── identify IP
                                   └── decision: BAN
                                             │
                                             ▼
                                   Firewall bouncer → IP diblok (nftables)
                                             │
                                             ▼
                                   Webhook → /api/v1/security/webhook
                                             │
                                             ▼
                                   Alert gateway → email + Discord
```

### Setup (manual di host, saat deploy)

1. Jalankan `docker compose up -d` stack utama (membuat volume `ahlipanggilan_nginx-logs`).
2. `docker compose -f infrastructure/crowdsec/docker-compose.crowdsec.yml up -d crowdsec`
3. Generate bouncer key: `docker compose -f ... exec crowdsec cscli bouncers add ap-bouncer`
4. Isi `BOUNCER_API_KEY` lalu `up -d` firewall-bouncer.
5. Daftarkan notifikasi webhook (secret = `SECURITY_WEBHOOK_SECRET`):
   `cscli notifications add ahlipanggilan-alert-gateway`
6. Aktifkan Community Blocklist: `cscli hub update && cscli collections install crowdsecurity/linux`
7. Verifikasi: `cscli decisions list`, `cscli alerts list`.

### Custom scenarios (repo: `infrastructure/crowdsec/scenarios/`)

| Scenario                        | Deteksi                            | Threshold       |
| ------------------------------- | ---------------------------------- | --------------- |
| `ahlipanggilan-bruteforce.yaml` | 401 pada `POST /api/auth/*`        | 5 / 60s per IP  |
| `ahlipanggilan-otp-abuse.yaml`  | 400 pada `POST /api/auth/verify-*` | 10 / 60s per IP |
| `ahlipanggilan-404-storm.yaml`  | 404 pada `GET /api/*`              | 30 / 60s per IP |

Semua decision mengirim notifikasi webhook ke alert gateway API
(`POST /api/v1/security/webhook`, header `X-Security-Key`) yang meneruskan
ke email + Discord — satu jalur alert untuk seluruh stack.

---

## 6. Phase 3 — Monitoring Host (Pengganti Wazuh untuk VPS ≤4GB)

**Status: persiapan repo selesai** — `infrastructure/security/` berisi script
trivy (scan harian → webhook), FIM (baseline + inotify daemon + systemd unit),
rules auditd, dan config unattended-upgrades. Pemasangan manual di host saat
deploy (lihat `infrastructure/security/README.md`).

### Mengapa bukan Wazuh

Wazuh manager + indexer + dashboard butuh ±4GB RAM tambahan — tidak feasible di VPS ≤4GB yang sudah menjalankan postgres, redis, API, web, nginx, dan plausible (clickhouse).

### Pengganti ringan (tetap memenuhi tujuan FIM/CVE/notifikasi)

| Kebutuhan            | Tool                                | Detail                                                                                                                                                               |
| -------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CVE scan             | **trivy** (CLI)                     | `trivy image ghcr.io/h4nzs/api:latest` via cron harian; laporan diformat → alert gateway                                                                             |
| FIM (file integrity) | **Script checksum** + `inotifywait` | Baseline `sha256sum` file sensitif: `.env`, `.env.prod`, `nginx.conf`, `docker-compose.prod.yml`, `sshd_config`, systemd units. Deteksi create/modify/delete → alert |
| File access OS       | **auditd**                          | Watch file sensitif (`/etc/nginx`, `/root/.ssh`, `.env`) — siapa akses/mengubah                                                                                      |
| Package update       | `apt` unattended-upgrades           | Auto-update security patches + notifikasi                                                                                                                            |

File yang dimonitor FIM (daftar awal):

```
/var/www/app/.env.prod
/var/www/app/docker-compose.prod.yml
/etc/nginx/nginx.conf
/etc/nginx/sites-enabled/*
/etc/ssh/sshd_config
/etc/systemd/system/*.service
/root/.ssh/authorized_keys
```

Contoh alert FIM:

```
🚨 SECURITY ALERT  — Severity: HIGH  — Host: prod-api-01
File: /etc/nginx/nginx.conf
Action: MODIFIED  — 08:31:02 WIB
```

### Opsi masa depan

Jika ada server/VPS kedua (atau upgrade RAM ≥8GB): pasang Wazuh penuh (manager+indexer di server baru, agent di VPS prod). Ditunda sampai dibutuhkan.

---

## 7. Phase 4 — App-level Security (Hono) — **PRIORITAS EKSEKUSI**

Nilai terbesar tanpa dependensi infra: security event + detection + alert langsung di codebase.
**Mode v1: alert-only** — auto-block (403 via Redis blocklist) diaktifkan setelah rules terbukti stabil (fase berikutnya).

### 7.1 Tabel `security_events` (migration baru)

```
id          uuid pk default gen_random_uuid()
event_type  varchar(100) not null
user_id     uuid null (ref users — null untuk anonim)
ip_address  inet null
user_agent  text null
path        text null
severity    smallint not null  -- 1=info 2=low 3=medium 4=high 5=critical
metadata    jsonb null         -- reason, attempts, extra
created_at  timestamptz default now() not null

index: (ip_address, created_at)
index: (event_type, created_at)
```

Semua event tersimpan lengkap untuk forensik; detection real-time memakai counter Redis.

### 7.2 Modul baru `apps/api/src/lib/security/`

| File                | Tanggung jawab                                                                                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rules.ts`          | Satu daftar rule: `{ id, eventType, windowMs, threshold, severity, action }`. Signature regex (SQLi/XSS/traversal) di sini, bukan di middleware                                          |
| `security-event.ts` | `emitSecurityEvent(...)`: insert DB + increment Redis counter (`security:evt:<ip>:<type>`, TTL window) + panggil detector                                                                |
| `detector.ts`       | Evaluasi counter vs threshold → breach & lewat cooldown → kirim ke `alert.ts`                                                                                                            |
| `alert.ts`          | **ALERT GATEWAY terpusat** — baca env `SECURITY_ALERT_*`; kirim email (Resend via `email.ts`) + Discord webhook (embed); throttle+dedup Redis; no-op jika `SECURITY_ALERT_ENABLED=false` |

### 7.3 Katalog event & rule v1

| Event                  | Pemicu                                             | Window | Threshold | Severity |
| ---------------------- | -------------------------------------------------- | ------ | --------- | -------- |
| `AUTH_LOGIN_FAILED`    | login gagal (invalid_credentials / user_not_found) | 1 mnt  | 5         | high     |
| `AUTH_LOGIN_SUCCESS`   | login sukses (info)                                | —      | —         | info     |
| `AUTH_FORGOT_PASSWORD` | forgot-password dipanggil                          | 1 mnt  | 10        | medium   |
| `AUTH_PASSWORD_RESET`  | reset sukses (info)                                | —      | —         | info     |
| `AUTH_OTP_FAILED`      | verify-otp/verify-email gagal                      | 1 mnt  | 10        | high     |
| `AUTH_RATE_LIMITED`    | rate limiter 429 pada path `/api/auth/`            | 1 mnt  | 20        | medium   |
| `SUSPICIOUS_PAYLOAD`   | regex SQLi/XSS/traversal pada request              | 1 mnt  | 5         | medium   |
| `ENDPOINT_ENUMERATION` | 404 storm (dari `app.notFound()`)                  | 1 mnt  | 30        | low      |
| `BOOKING_CREATED`      | booking baru dibuat                                | 1 mnt  | 10        | low      |

Field `action` pada rule disiapkan (`'alert'` untuk semua di v1) — iterasi berikutnya menyalakan `'block'` per-rule.

### 7.4 Alert gateway (konfigurasi terpusat — env)

```env
# .env.prod / .env.example
SECURITY_ALERT_ENABLED=true
SECURITY_ALERT_EMAILS=spesialis.onovoda@gmail.com
SECURITY_ALERT_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SECURITY_ALERT_FROM=            # fallback ke RESEND_FROM
SECURITY_ALERT_MAX_PER_MIN=5    # throttle global
```

- Email: reuse `sendNotificationEmail` / Resend — SMTP fallback bila Resend tidak diset.
- Discord: `fetch` POST ke webhook dengan embed:
  ```
  🚨 SECURITY ALERT
  Severity: HIGH
  Host: prod-api-01
  Event: AUTH_LOGIN_FAILED (multiple failed login attempts)
  Source: 185.xxx.xxx.xxx
  Attempts: 12
  Path: /api/auth/login
  Time: 08:32 WIB
  Action: ALERT (auto-block akan aktif di iterasi berikutnya)
  ```
- Throttle: dedup per `ruleId + IP`, cooldown default 1 menit/rule, global cap `SECURITY_ALERT_MAX_PER_MIN`.
- **Semua jalur alert** (app detection, CrowdSec webhook, trivy, FIM) masuk lewat `alert.ts`.

### 7.5 Wiring

- `middleware/security.ts` (baru): payload regex → `SUSPICIOUS_PAYLOAD`; dipasang global di `routes/index.ts`.
- `app.notFound()` → `ENDPOINT_ENUMERATION`.
- `rate-limiter.ts`: saat 429 dan path mulai `/api/auth/` → `AUTH_RATE_LIMITED`.
- `auth.ts`: hook `emitSecurityEvent` pada login failed/success, forgot-password, password reset, otp/verify gagal.
- Booking route: `BOOKING_CREATED`.

### 7.6 Ops

- Migration + update `schema.test.ts` (45 → 46 tabel).
- Cleanup: job hapus `security_events` > 30 hari (interval harian di API).
- Unit tests: detector (threshold/cooldown), alert throttle, event emit, rules.
- Verifikasi: `pnpm test` + `pnpm typecheck` + `pnpm lint`; smoke manual curl → event muncul di DB & alert terkirim saat threshold breach.

### 7.7 Iterasi berikutnya (setelah v1 stabil)

- Auto-block: `middleware/blocklist.ts` — cek Redis `security:blocklist:<ip>` sebelum rate limiter → 403; rule dengan `action: 'block'` memasukkan IP (TTL 15 mnt).
- Rule tambahan: `MASS_ACCOUNT_CREATION`, `MASS_BOOKING_CANCELLED`, `ADMIN_ACTION_ANOMALY`, `PRIVILEGE_ESCALATION_PATTERN`, `SUSPICIOUS_USER_AGENT`.
- Dashboard admin `security_events` (opsional, di admin panel).

---

## 8. Notifikasi — Prinsip

1. **Satu gateway**: `apps/api/src/lib/security/alert.ts` — semua channel (email, Discord, nanti Telegram) dikelola di satu modul.
2. **Konfigurasi via env**, default di `.env.example` — ganti penerima tanpa utak-atik kode.
3. **Throttle & dedup** — anti spam (detection storm tidak membanjiri inbox).
4. Prioritas channel: email (Resend) + Discord webhook. Telegram menyusul bila diinginkan (satu fungsi tambahan di `alert.ts`).

---

## 9. Roadmap & Status

| Phase | Isi                                                            | Status                                      |
| ----- | -------------------------------------------------------------- | ------------------------------------------- |
| **4** | App-level security (events + detector + rules + alert gateway) | **Rancangan disetujui — menunggu eksekusi** |
| 1     | Cloudflare WAF/bot/rate-limit + hardening nginx + UFW          | Belum                                       |
| 2     | CrowdSec + bouncer (host, manual SSH)                          | Belum                                       |
| 3     | trivy + FIM script + auditd (pengganti Wazuh)                  | Belum                                       |

Urutan eksekusi: **Phase 4 → 1 → 2 → 3** (Phase 4 memberi value paling cepat dan menjadi dasar detection behavior aplikasi).

---

## 10. Referensi

- Nginx prod config: `infrastructure/docker/nginx/prod.conf`
- Rate limiter API: `apps/api/src/middleware/rate-limiter.ts`
- Auth routes: `apps/api/src/routes/auth.ts`
- Email/Resend: `apps/api/src/lib/email.ts`, `apps/api/src/lib/resend.ts`
- Audit data: `packages/database/src/schema/audit-logs.ts`
- Docker compose prod: `docker-compose.prod.yml`
