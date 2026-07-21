# Plausible Analytics — Self-Hosted

> **Status:** ✅ Live di `https://stats.ahlipanggilan.id` \
> **Image:** `ghcr.io/plausible/community-edition:latest` \
> **Stack:** Plausible (Elixir/Phoenix) + PostgreSQL 16 + ClickHouse 24 \
> **Fungsi:** Privacy-first web analytics, alternatif Google Analytics, tanpa cookie. \
> **First deployed:** 20 Juli 2026

---

## Daftar Isi

1. [Arsitektur](#1-arsitektur)
2. [Environment Variables](#2-environment-variables)
3. [Swap Memory](#3-swap-memory)
4. [Migration Script](#4-migration-script)
5. [Nginx Configuration](#5-nginx-configuration)
6. [Integrasi Frontend](#6-integrasi-frontend)
7. [Setup Awal](#7-setup-awal)
8. [Maintenance](#8-maintenance)
9. [Troubleshooting](#9-troubleshooting)
10. [Referensi](#10-referensi)

---

## 1. Arsitektur

```
Internet → Cloudflare → stats.ahlipanggilan.id
                              ↓
              Nginx (server block stats.ahlipanggilan.id)
                              ↓
                    http://plausible:8000
                         /              \
               PostgreSQL 16          ClickHouse 24
              (plausible-db)     (plausible-clickhouse)
```

### Diagram Container

| Container                            | Image                                    | Port | Memory Limit | Reservation | Fungsi                    |
| ------------------------------------ | ---------------------------------------- | ---- | ------------ | ----------- | ------------------------- |
| `ahlipanggilan-plausible`            | `ghcr.io/plausible/community-edition`    | 8000 | **512M**     | 256M        | App server (Phoenix)      |
| `ahlipanggilan-plausible-db`         | `postgres:16-alpine`                     | 5432 | 256M         | 128M        | Metadata, sessions, users |
| `ahlipanggilan-plausible-clickhouse` | `clickhouse/clickhouse-server:24-alpine` | 8123 | **768M**     | 384M        | Analytics data (columnar) |

### Memory Allocation (Host 1.9GB RAM + 2GB Swap)

| Container              | Limit | Aktual | Headroom                                   |
| ---------------------- | ----- | ------ | ------------------------------------------ |
| `postgres`             | 512M  | ~35M   | ✅                                         |
| `api`                  | 256M  | ~155M  | ✅                                         |
| `web`                  | 384M  | ~163M  | ✅ (dinaikkan dr 256M untuk SSR headroom)  |
| `nginx`                | 128M  | ~6M    | ✅                                         |
| `plausible-db`         | 256M  | ~65M   | ✅                                         |
| `plausible-clickhouse` | 768M  | ~674M  | ✅ (dengan `max_server_memory_usage=650M`) |
| `plausible`            | 512M  | ~199M  | ✅ (diturunkan dr 768M — cukup)            |

> **Host VPS:** 1.9GB RAM + **2GB swap** (swap file `/swapfile`, aktif via `swapon`).
> **Riwayat:** ClickHouse awalnya crash `MEMORY_LIMIT_EXCEEDED` dengan limit 512MB (RSS 457MB). Limit dinaikkan ke 768MB + `max_server_memory_usage=650MB` untuk self-regulation. Swap memastikan host tidak OOM saat semua container peak bersamaan.

### Network

Semua container terhubung ke bridge network **`specialist`** — bisa resolve satu sama lain via container name (`plausible`, `plausible-db`, `plausible-clickhouse`).

### Entrypoint Flow

Plausible container menjalankan migration script (bukan langsung app):

```
Command: ["sh", "/plausible-migrate.sh"]
   ↓
Entrypoint (/entrypoint.sh):
  $1 = "sh" → bukan "run" atau "db"
  → exec "$@" → exec sh /plausible-migrate.sh
   ↓
plausible-migrate.sh:
  1. Ecto.Migrator.run: PostgreSQL migrations
  2. Create admin user (jika belum ada)
  3. exec /entrypoint.sh run → exec /app/bin/plausible start
```

---

## 2. Environment Variables

### Di `.env.prod` (wajib diset)

```bash
# ── Plausible Analytics ──────────────────────────────────────────
PLAUSIBLE_DOMAIN=stats.ahlipanggilan.id
PLAUSIBLE_SECRET_KEY=<output dari: openssl rand -hex 64>
PLAUSIBLE_DB_PASSWORD=<password acak, min 12 karakter>
PLAUSIBLE_ADMIN_EMAIL=admin@ahlipanggilan.id
PLAUSIBLE_ADMIN_NAME=Admin
PLAUSIBLE_ADMIN_PASSWORD=<password admin dashboard>
```

### Di `docker-compose.prod.yml` (hardcoded / referensi env var)

| Variabel Container        | Nilai                                                                       | Keterangan                                                                                    |
| ------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `BASE_URL`                | `https://${PLAUSIBLE_DOMAIN}`                                               | **WAJIB.** URL publik dashboard. Wajib pakai nama `BASE_URL`, **bukan** `PLAUSIBLE_BASE_URL`. |
| `DATABASE_URL`            | `postgres://plausible:${PLAUSIBLE_DB_PASSWORD}@plausible-db:5432/plausible` | Koneksi ke PostgreSQL internal                                                                |
| `CLICKHOUSE_DATABASE_URL` | `http://plausible-clickhouse:8123/plausible`                                | Koneksi ke ClickHouse. **WAJIB** diakhiri `/<database_name>` (misal `/plausible`).            |
| `SECRET_KEY_BASE`         | `${PLAUSIBLE_SECRET_KEY}`                                                   | Dari env var                                                                                  |
| `DISABLE_AUTH`            | `'false'`                                                                   | Auth tetap aktif                                                                              |
| `DISABLE_REGISTRATION`    | `'true'`                                                                    | Mencegah registrasi publik                                                                    |
| `DISABLE_SUBSCRIPTION`    | `'true'`                                                                    | Nonaktifkan fitur subscription                                                                |
| `ADMIN_USER_EMAIL`        | `${PLAUSIBLE_ADMIN_EMAIL}`                                                  | Untuk auto-create admin via migration script                                                  |
| `ADMIN_USER_NAME`         | `${PLAUSIBLE_ADMIN_NAME:-Admin}`                                            | Nama admin                                                                                    |
| `ADMIN_USER_PWD`          | `${PLAUSIBLE_ADMIN_PASSWORD}`                                               | Password admin                                                                                |

### Variabel WAJIB yang sering salah

| Variabel                | Salah ❌                           | Benar ✅                                     |
| ----------------------- | ---------------------------------- | -------------------------------------------- |
| BASE_URL                | `PLAUSIBLE_BASE_URL`               | `BASE_URL`                                   |
| CLICKHOUSE_DATABASE_URL | `http://plausible-clickhouse:8123` | `http://plausible-clickhouse:8123/plausible` |
| SECRET_KEY_BASE         | `PLAUSIBLE_SECRET_KEY` (env var)   | Referensi env var: `${PLAUSIBLE_SECRET_KEY}` |

### Di Nginx (`server block stats.ahlipanggilan.id`)

| Variabel Template     | Nilai                                           |
| --------------------- | ----------------------------------------------- |
| `${PLAUSIBLE_DOMAIN}` | `stats.ahlipanggilan.id`                        |
| SSL cert path         | `/etc/letsencrypt/live/stats.ahlipanggilan.id/` |

> **Catatan:** Nginx Alpine entrypoint menjalankan `envsubst` pada file template. Karena itu, gunakan `${VAR}` saja (tanpa `:-default` syntax, karena `envsubst` tidak support fallback).

### ClickHouse Config Override

**File:** `infrastructure/docker/clickhouse/config.d/memory-limit.xml`

Konfigurasi ini di-mount ke `/etc/clickhouse-server/config.d/` di container `plausible-clickhouse` untuk meng-override default:

```xml
<clickhouse>
    <!-- Memori: cegah OOM crash (default max_memory_usage = 0 = unlimited) -->
    <max_server_memory_usage>681574400</max_server_memory_usage>

    <!-- Network: docker default Alpine hanya listen di 127.0.0.1 -->
    <listen_host>0.0.0.0</listen_host>
    <listen_host>::</listen_host>
</clickhouse>
```

Kenapa perlu:

- `max_server_memory_usage=650MB` — ClickHouse self-regulate sebelum kena cgroup 768MB Docker
- `listen_host` — image Alpine default hanya `127.0.0.1` dan `::1` (loopback), container lain tidak bisa konek

---

## 3. Swap Memory

VPS hanya punya **1.9GB RAM**. Untuk mencegah OOM saat semua container peak bersamaan, ditambahkan swap 2GB.

### Setup (sekali, via root)

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Persisten setelah reboot
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Verifikasi

```bash
swapon --show
# NAME      TYPE SIZE USED PRIO
# /swapfile file   2G  ...   -2

free -h
#               total  used  free  shared  buff/cache  available
# Mem:           1.9Gi  ...   ...    ...        ...        ~500Mi
# Swap:          2.0Gi  ...  1.4Gi
```

---

## 4. Migration Script

**File:** `plausible-migrate.sh` (di root proyek, mount ke container sebagai `/plausible-migrate.sh:ro`)

### Fungsi

Script ini menjalankan migrasi database SEBELUM Plausible app start. Ini diperlukan karena image Plausible **tidak** auto-run migration saat startup.

### Alur Script

```bash
#!/bin/sh
set -e

# 1. PostgreSQL migrations (Ecto)
echo "Running PostgreSQL migrations..."
/app/bin/plausible eval '
{:ok,_}=Application.ensure_all_started(:ecto_sql)
{:ok,pid}=Plausible.Repo.start_link(pool_size: 2)
Ecto.Migrator.run(Plausible.Repo,"/app/lib/plausible-0.0.1/priv/repo/migrations",:up,all: true)
GenServer.stop(pid)
'

# 2. Admin user creation (jika belum ada)
# Why: Migration script create tables BEFORE Plausible app starts,
# which tricks the app's "fresh install" detection into skipping
# admin user creation from env vars.
echo "Checking admin user..."
/app/bin/plausible eval '
{:ok,_}=Application.ensure_all_started(:ecto_sql)
{:ok,pid}=Plausible.Repo.start_link(pool_size: 2)

email = System.get_env("ADMIN_USER_EMAIL") || System.get_env("PLAUSIBLE_ADMIN_EMAIL") || ""
password = System.get_env("ADMIN_USER_PWD") || System.get_env("PLAUSIBLE_ADMIN_PASSWORD") || ""

if email == "" or password == "" do
  IO.puts("WARNING: env vars not set, skipping.")
else
  try do
    result = Plausible.Repo.query!("SELECT id FROM users WHERE email = $1", [email])
    if result.num_rows == 0 do
      name = System.get_env("ADMIN_USER_NAME") || "Admin"
      hash = Bcrypt.hash_pwd_salt(password)
      now = NaiveDateTime.utc_now()
      Plausible.Repo.query!(
        "INSERT INTO users (email, name, password_hash, inserted_at, updated_at,
         email_verified, totp_enabled, allow_next_upgrade_override)
         VALUES ($1, $2, $3, $4, $5, true, false, false)",
        [email, name, hash, now, now]
      )
      IO.puts("Admin user created: #{email}")
    else
      IO.puts("Admin user already exists: #{email}")
    end
  rescue
    e -> IO.puts("Warning: Could not create admin user: #{inspect(e)}")
  end
end
GenServer.stop(pid)
'

# 3. Start Plausible app
echo "Starting Plausible..."
exec /entrypoint.sh run
```

### Kenapa Pakai Raw SQL untuk Admin Creation?

`Plausible.Auth.signup/1` dan `Plausible.Auth.User` module **tidak tersedia** di production release image — hanya ada saat full OTP app running. Alternatif yang dicoba dan gagal:

| Approach                                          | Hasil                       |
| ------------------------------------------------- | --------------------------- |
| `Plausible.Auth.signup(%{...})`                   | ❌ `UndefinedFunctionError` |
| `Plausible.Repo.get_by(Plausible.Auth.User, ...)` | ❌ Module not found         |
| Raw SQL (`Repo.query!`)                           | ✅ Berhasil                 |

### Catatan Penting

- **ClickHouse migration TIDAK dijalankan via script** — tabel ClickHouse dibuat manual via `structure.sql` (lihat [Setup Langkah 3](#7-setup-awal)). Module `Plausible.ClickhouseRepo` dan `Plausible.IngestRepo` tidak tersedia di production release untuk di-eval.
- **`if/else/end` harus di DALAM `try do` block** — Elixir tidak mengizinkan `try do ... else ... rescue ... end`. `else` hanya untuk `if`.
- **`pool_size: 2`** — pakai spasi setelah colon (Elixir keyword syntax).
- **`all: true`** — pakai spasi setelah colon.

---

## 5. Nginx Configuration

**File:** `infrastructure/docker/nginx/prod.conf`

### Server Block Plausible

```nginx
# Plausible Analytics — stats subdomain
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${PLAUSIBLE_DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${PLAUSIBLE_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${PLAUSIBLE_DOMAIN}/privkey.pem;

    # Main proxy
    location / {
        proxy_pass http://plausible:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket for real-time dashboard
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
    }

    # Event API
    location /api/ {
        proxy_pass http://plausible:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_buffering on;
    }
}
```

### Template Variables

Nginx Alpine entrypoint menjalankan `envsubst` pada file `.template`. Variabel `${PLAUSIBLE_DOMAIN}` diisi dari environment container `nginx` di `docker-compose.prod.yml`.

> **⚠️ `envsubst` limitation:** Tidak support `${VAR:-default}` syntax. Hanya `${VAR}` saja. Default value harus diset di environment container atau file compose.

---

## 6. Integrasi Frontend

**File:** `apps/web/src/layouts/BaseLayout.astro`

Script tracking ditambahkan secara **conditional** — hanya aktif di production saat `PLAUSIBLE_DOMAIN` ter-set:

```astro
---
const plausibleDomain = process.env.PLAUSIBLE_DOMAIN ?? ''
const plausibleSrc = plausibleDomain ? `https://${plausibleDomain}/js/script.js` : ''
---

<!-- Di <head> -->
{
  plausibleSrc && (
    <script defer data-domain="ahlipanggilan.id" src={plausibleSrc} />
  )
}
```

**Catatan:**

- `defer` — tidak blocking render
- **Tanpa `integrity`** — menghindari SRI hash mismatch (script Plausible bisa berubah antar versi)
- **Tanpa cookie** — GDPR compliant out of the box
- **Domain sendiri** (`stats.ahlipanggilan.id`) — first-party, tidak diblokir adblocker/DuckDuckGo/Brave Shield

---

## 7. Setup Awal

> **Hanya sekali** di VPS untuk deployment pertama. Untuk update selanjutnya cukup `git pull` + restart container.

### Prasyarat

- VPS dengan Docker & Docker Compose terinstall
- Domain `ahlipanggilan.id` pointing ke IP VPS
- Subdomain `stats.ahlipanggilan.id` (A record → IP VPS)

### Langkah 1: Konfigurasi DNS

```
stats.ahlipanggilan.id  →  A record  →  <IP VPS>
```

### Langkah 2: SSL Certificate

```bash
# Stop nginx sementara (port 80 harus free)
docker stop ahlipanggilan-nginx

# Dapatkan cert
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/letsencrypt:/var/www/letsencrypt \
  certbot/certbot certonly --webroot \
  -w /var/www/letsencrypt \
  -d stats.ahlipanggilan.id \
  --non-interactive --agree-tos \
  --email admin@ahlipanggilan.id

# Start nginx kembali
docker start ahlipanggilan-nginx
```

### Langkah 3: Bootstrap Database

Jalankan **sekali** setelah stack Plausible pertama kali naik:

```bash
# 3a. Buat database di ClickHouse
docker exec -it ahlipanggilan-plausible-clickhouse \
  clickhouse-client --query "CREATE DATABASE IF NOT EXISTS plausible"

# 3b. Bootstrap PostgreSQL dengan structure.sql dari image
docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm plausible \
  cat /app/lib/plausible-0.0.1/priv/repo/structure.sql \
  | docker exec -i ahlipanggilan-plausible-db psql -U plausible

# 3c. Bootstrap ClickHouse dengan struktur tabel dari image
# Urutan penting: location_data TABLE dulu, baru DICTIONARY, baru sisanya
docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm plausible \
  cat /app/lib/plausible-0.0.1/priv/ingest_repo/structure.sql > /tmp/ch-structure.sql

# Ganti database name dari plausible_events_db → plausible
sed -i 's/plausible_events_db/plausible/g' /tmp/ch-structure.sql

# Eksekusi ke ClickHouse (note: dictionary & alias columns bisa error urutan)
# Ganti dengan method step-by-step jika error:
cat /tmp/ch-structure.sql | docker exec -i ahlipanggilan-plausible-clickhouse \
  clickhouse-client --database=plausible 2>&1

# 3d. Restart Plausible
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d plausible
```

> **Jika structure.sql error karena dictionary dependency** (error "Dictionary not found"), split menjadi langkah terpisah:
>
> **Step 1 — Buat `location_data` TABLE:**
>
> ```bash
> docker exec -i ahlipanggilan-plausible-clickhouse clickhouse-client --database=plausible \
>   -q "CREATE TABLE IF NOT EXISTS plausible.location_data (type LowCardinality(String), id String, name String) ENGINE = MergeTree ORDER BY (type, id) SETTINGS index_granularity = 128;"
> ```
>
> **Step 2 — Buat `location_data_dict` DICTIONARY:**
>
> ```bash
> docker exec -i ahlipanggilan-plausible-clickhouse clickhouse-client --database=plausible \
>   -q "CREATE DICTIONARY IF NOT EXISTS plausible.location_data_dict (type String, id String, name String) PRIMARY KEY type, id SOURCE(CLICKHOUSE(TABLE location_data DB plausible)) LIFETIME(MIN 0 MAX 0) LAYOUT(COMPLEX_KEY_CACHE(SIZE_IN_CELLS 500000));"
> ```
>
> **Step 3 — Buat sisanya (sessions_v2, events_v2, imported\_\*, dll):**
> File SQL untuk langkah ini ada di repo: `plausible/clickhouse-tables.sql`:
>
> ```bash
> # Copy dari repo lokal ke VPS
> scp -i ~/.ssh/deploy-key ./plausible/clickhouse-tables.sql deploy@202.155.18.245:/tmp/
> # Atau download langsung dari repo di VPS
> curl -o /tmp/clickhouse-tables.sql https://raw.githubusercontent.com/h4nzs/spesialis/main/plausible/clickhouse-tables.sql
>
> # Eksekusi ke ClickHouse
> docker exec -i ahlipanggilan-plausible-clickhouse clickhouse-client --database=plausible \
>   < /tmp/clickhouse-tables.sql
> ```

### Langkah 4: Verifikasi

```bash
# Tunggu startup
sleep 30

# Cek status container
docker ps | grep plausible

# Test dari dalam network nginx
docker exec ahlipanggilan-nginx curl -sSf -o /dev/null -w "%{http_code}\n" http://plausible:8000/

# Test dari luar (via Cloudflare)
curl -s -o /dev/null -w "%{http_code}\n" https://stats.ahlipanggilan.id
```

Semua harus return **200** (atau **302** redirect ke login — normal untuk first visit).

### Langkah 5: Login Dashboard

1. Buka `https://stats.ahlipanggilan.id`
2. Login dengan email + password dari `PLAUSIBLE_ADMIN_EMAIL` / `PLAUSIBLE_ADMIN_PASSWORD`
3. Domain `ahlipanggilan.id` sudah terdaftar dari seed data `structure.sql` — langsung muncul di dashboard
4. Jika belum ada, klik **Add website** → masukkan `ahlipanggilan.id`

### Langkah 6: Matikan Cloudflare Web Analytics (jika aktif)

Agar tidak dobel tracking:

- Login Cloudflare dashboard
- **Analytics & Logs** → **Web Analytics**
- Hapus site `ahlipanggilan.id` atau matikan auto-inject
- Juga matikan **Rocket Loader** di **Speed** → **Optimization** (bisa interfere dengan Plausible script)

### Langkah 7: Aktifkan HSTS (setelah HTTPS terverifikasi)

Nginx config masih punya HSTS yang terkomentari. Setelah semua berfungsi:

1. Edit `infrastructure/docker/nginx/prod.conf` — uncomment baris:
   ```nginx
   # add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
   ```
2. Restart nginx: `docker restart ahlipanggilan-nginx`
3. Test: `curl -sI https://ahlipanggilan.id | grep -i strict`

---

## 8. Maintenance

### Restart Container

```bash
docker restart ahlipanggilan-plausible
```

Migration script akan jalan ulang — idempoten (PG migration skip yang sudah applied, admin user skip yang sudah ada).

### Update Versi Plausible

```bash
cd ~/spesialis-platform
git pull origin main
docker compose -f docker-compose.prod.yml --env-file .env.prod pull plausible
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d plausible
```

### Update Migration Script

```bash
# Edit local: plausible-migrate.sh
# Sync ke VPS
scp -i ~/.ssh/deploy-key -o StrictHostKeyChecking=no \
  ./plausible-migrate.sh deploy@202.155.18.245:~/spesialis-platform/

# Restart
docker restart ahlipanggilan-plausible
```

### Deploy Ulang Stack Penuh

```bash
cd ~/spesialis-platform
docker compose -f docker-compose.prod.yml --env-file .env.prod down
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### Reset Password Admin (jika lupa)

> ⚠️ **Tidak bisa** dengan mengosongkan `password_hash` lalu restart — migration script cek `num_rows == 0`, bukan password kosong.

**Prosedur benar — generate bcrypt hash lalu update langsung:**

> ⚠️ Password baru **tidak boleh** mengandung karakter single quote (`'`) karena akan memecah shell string.

```bash
# Generate hash dulu (ganti 'password-baru' dengan password yang diinginkan)
HASH=$(docker exec ahlipanggilan-plausible /app/bin/plausible eval \
  'IO.puts(Bcrypt.hash_pwd_salt("password-baru"))' 2>/dev/null | tail -1)

# Update di database
docker exec ahlipanggilan-plausible-db psql -U plausible \
  -c "UPDATE users SET password_hash = '$HASH' WHERE email = 'admin@ahlipanggilan.id';"
```

Verifikasi: login dengan password baru di `https://stats.ahlipanggilan.id`.

### Backup Database

```bash
# PostgreSQL
docker exec ahlipanggilan-plausible-db pg_dump -U plausible > \
  ~/backups/plausible-pg-$(date +%Y%m%d-%H%M%S).sql

# ClickHouse — backup via clickhouse-client
docker exec ahlipanggilan-plausible-clickhouse clickhouse-client \
  --query "SELECT database, table FROM system.tables WHERE database='plausible'"
```

### Cek Logs

```bash
# Real-time logs
docker logs -f ahlipanggilan-plausible

# 30 baris terakhir
docker logs --tail 30 ahlipanggilan-plausible

# Filter error saja
docker logs ahlipanggilan-plausible 2>&1 | grep -i error
```

---

## 9. Troubleshooting

### 9.1 Container crash-loop / restart terus

**Diagnosa:**

```bash
docker logs ahlipanggilan-plausible --tail 30
docker ps | grep plausible
```

**Penyebab umum:**

| Error                                                    | Penyebab                                         | Solusi                                                                                                   |
| -------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `BASE_URL configuration option is required`              | Env var `BASE_URL` tidak diset                   | Ganti nama ke `BASE_URL`, **bukan** `PLAUSIBLE_BASE_URL`                                                 |
| `invalid URL http://..., path should be a database name` | ClickHouse URL tanpa path database               | Tambah `/plausible` di akhir: `http://plausible-clickhouse:8123/plausible`                               |
| `relation "salts" does not exist`                        | Database PostgreSQL belum di-bootstrap           | Jalanin `structure.sql` (lihat Setup Langkah 3b)                                                         |
| `relation "teams" does not exist`                        | `structure.sql` tidak sinkron dengan versi image | Re-bootstrap dengan `structure.sql` dari image yang sama                                                 |
| `Database plausible does not exist`                      | ClickHouse database belum dibuat                 | `CREATE DATABASE IF NOT EXISTS plausible`                                                                |
| `Dictionary (plausible.location_data_dict) not found`    | Urutan setup ClickHouse salah                    | Buat `location_data` dulu, baru dictionary, baru tabel lain                                              |
| `SyntaxError: unexpected reserved word: end`             | Syntax Elixir salah di migration script          | Cek `try do ... else ... rescue ... end` — `else` harus di dalam `try`, bukan level `try`                |
| `could not find migration runner process`                | Mencoba Ecto.Migrator untuk ClickHouse via eval  | ClickHouse repo modules tidak tersedia di eval. Tabel ClickHouse harus dibuat manual via `structure.sql` |
| Exit code 137 (OOM killed)                               | Memory container kurang                          | Naikkan memory limit (min 512M untuk Plausible, 512M untuk ClickHouse)                                   |
| Container restart terus tanpa error log                  | Crash sebelum sempat log                         | Cek `docker logs` segera setelah restart, atau `docker events`                                           |

### 9.2 Login "Wrong email or password"

**Penyebab & solusi:**

| Masalah                  | Cek                                                 | Solusi                                                                                                           |
| ------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Hash password terpotong  | `SELECT email, left(password_hash, 20) FROM users;` | Hash bcrypt mengandung karakter `$` yang bisa diinterpretasi shell. Update hash: jalankan migration script ulang |
| `email_verified = false` | `SELECT email, email_verified FROM users;`          | Update: `UPDATE users SET email_verified = true WHERE email = '...';`                                            |
| User tidak ada           | `SELECT email FROM users;`                          | Migration script auto-create dari env var. Pastikan `ADMIN_USER_EMAIL` dan `ADMIN_USER_PWD` ter-set              |

### 9.3 Nginx crash-loop setelah deploy

**Diagnosa:**

```bash
docker logs ahlipanggilan-nginx --tail 30
```

| Error                                              | Penyebab                                                  | Solusi                                                                           |
| -------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `the closing bracket in "VAR" variable is missing` | `envsubst` gagal parsing `:-default` syntax               | Hapus `:-default`, gunakan `${VAR}` saja. Default di-set di `docker-compose.yml` |
| `host not found in upstream "plausible"`           | Nginx resolve hostname saat startup, Plausible belum siap | Restart nginx: `docker restart ahlipanggilan-nginx`                              |
| `connect() failed (111: Connection refused)`       | Container upstream dapat IP baru setelah restart          | Restart nginx: `docker restart ahlipanggilan-nginx`                              |
| SSL error / cert not found                         | Belum generate SSL cert untuk subdomain                   | Jalankan certbot untuk `stats.ahlipanggilan.id`                                  |

### 9.4 Stats dashboard 502 Bad Gateway

**Langkah diagnosa bertahap:**

```bash
# 1. Container hidup?
docker ps | grep plausible

# 2. Logs Plausible?
docker logs ahlipanggilan-plausible --tail 20

# 3. Test dari dalam network (bypass Cloudflare)
docker exec ahlipanggilan-nginx curl -sSf -o /dev/null -w "%{http_code}\n" http://plausible:8000/

# 4. Test dari luar
curl -s -o /dev/null -w "%{http_code}\n" https://stats.ahlipanggilan.id
```

Kalau dari nginx ke Plausible **200** tapi dari luar **502**:

- Purge Cloudflare cache: Dashboard CF → **Caching** → **Purge Everything**
- Pastikan DNS `stats.ahlipanggilan.id` pointing ke IP VPS, bukan proxied (atau proxied)

### 9.5 Dashboard error "There has been a server error"

**Penyebab umum:**

| Penyebab                                 | Ciri-ciri                                                                           | Solusi                                                                                                           |
| ---------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Tabel ClickHouse belum dibuat            | Log: `relation "events_v2" does not exist`                                          | Bootstrap ulang ClickHouse (lihat Setup Langkah 3)                                                               |
| **ClickHouse listen hanya di 127.0.0.1** | Log: `Mint.TransportError) connection refused`                                      | Tambah `<listen_host>0.0.0.0</listen_host>` ke config override (`config.d/memory-limit.xml`), restart ClickHouse |
| **ClickHouse kena OOM**                  | Log: `MEMORY_LIMIT_EXCEEDED`, crash-loop                                            | Naikkan limit memory (768M) + set `max_server_memory_usage=650MB` di config override                             |
| **Kolom ClickHouse kurang**              | Log: `No such column scroll_depth / recovery_id / engagement_time / click_id_param` | Tambah kolom via `ALTER TABLE` (lihat 9.10)                                                                      |

### 9.6 Domain "cannot be registered" di dashboard

Domain `ahlipanggilan.id` sudah ada dari seed data `structure.sql`. Tidak perlu register ulang — langsung muncul di daftar dashboard. Jika tidak muncul, cek site_memberships:

```bash
docker exec -i ahlipanggilan-plausible-db psql -U plausible \
  -c "SELECT sm.user_id, u.email, s.domain FROM site_memberships sm
      JOIN users u ON u.id = sm.user_id
      JOIN sites s ON s.id = sm.site_id;"
```

### 9.7 SRI hash mismatch di browser console

```
None of the "sha512" hashes in the integrity attribute match the content...
```

**Bukan dari kode kita** — script `beacon.min.js` dari `static.cloudflareinsights.com` di-inject otomatis oleh Cloudflare. Solusi: nonaktifkan Cloudflare Web Analytics dan Rocket Loader.

### 9.8 DuckDuckGo / adblocker memblokir script

Script Plausible di-host di domain **kita sendiri** (`stats.ahlipanggilan.id`), bukan domain publik tracker:

- DuckDuckGo → ✅ **tidak** diblokir (first-party)
- uBlock Origin → ✅ **tidak** diblokir
- Brave Shield → ✅ **tidak** diblokir

Jika masih terblokir, pastikan `stats.ahlipanggilan.id` mengarah ke server kita (bukan IP publik tracker).

### 9.9 Script Plausible tidak muncul di halaman

**Penyebab umum:**

| Penyebab                                         | Ciri                                                           | Solusi                                                                                                                                |
| ------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `PLAUSIBLE_DOMAIN` tidak di-set di container web | DevTools Network tidak ada request ke `stats.ahlipanggilan.id` | Tambah `PLAUSIBLE_DOMAIN: ${PLAUSIBLE_DOMAIN:-stats.ahlipanggilan.id}` ke env service `web` di `docker-compose.prod.yml`, restart web |
| Browser cache                                    | Script sudah ada tapi tidak dirender                           | Hard refresh (Ctrl+Shift+R) atau buka incognito                                                                                       |
| Adblocker inject                                 | —                                                              | Pastikan domain stats adalah subdomain sendiri (first-party), bukan domain tracker publik                                             |

```bash
# Cek env var di container web
docker exec ahlipanggilan-web env | grep PLAUSIBLE

# Cek langsung di browser: DevTools → Network → filter "stats"
# Harus ada request ke https://stats.ahlipanggilan.id/js/script.js

# Cek apakah tag script dirender di HTML
curl -s https://ahlipanggilan.id | grep -o "plausible.*script"
```

### 9.10 ClickHouse error "No such column" setelah update Plausible

Image Plausible Community Edition sering update dengan migration yang menambah kolom baru ke ClickHouse. Karena ClickHouse migration tidak bisa dijalankan via Ecto (module tidak tersedia di production release), kolom baru harus ditambah manual.

**Diagnosa:**

```bash
# Cek error di log
docker logs ahlipanggilan-plausible --tail 30 | grep -i "no such column"
```

**Solusi — tambah kolom yang kurang:**

```bash
# events_v2
docker exec ahlipanggilan-plausible-clickhouse clickhouse-client --query="
  ALTER TABLE plausible.events_v2
    ADD COLUMN IF NOT EXISTS scroll_depth UInt8 AFTER revenue_source_currency,
    ADD COLUMN IF NOT EXISTS recovery_id UInt64 AFTER scroll_depth,
    ADD COLUMN IF NOT EXISTS engagement_time UInt32 AFTER recovery_id;"

# sessions_v2
docker exec ahlipanggilan-plausible-clickhouse clickhouse-client --query="
  ALTER TABLE plausible.sessions_v2
    ADD COLUMN IF NOT EXISTS recovery_id UInt64 AFTER channel,
    ADD COLUMN IF NOT EXISTS click_id_param LowCardinality(String) AFTER recovery_id;"
```

**Cegah:** Update file `plausible/clickhouse-tables.sql` di repo dengan kolom baru, supaya fresh install tidak kena masalah yang sama.

---

## 10. Referensi

- **Repository:** [Plausible Community Edition](https://github.com/plausible/community-edition)
- **Wiki:** [Self-Hosting Configuration](https://github.com/plausible/community-edition/wiki)
- **Docs:** [Plausible Self-Hosting](https://plausible.io/docs/self-hosting-configuration)
- **ClickHouse:** [Documentation](https://clickhouse.com/docs)
- **File konfigurasi:**
  - `docker-compose.prod.yml` — service `plausible`, `plausible-db`, `plausible-clickhouse`
  - `plausible-migrate.sh` — migration script (mounted sebagai volume)
  - `infrastructure/docker/nginx/prod.conf` — server block `stats.ahlipanggilan.id`
  - `apps/web/src/layouts/BaseLayout.astro` — frontend tracking script
  - `.env.prod` — environment variables
