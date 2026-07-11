# Deployment

**Platform:** Specialist Platform
**Terakhir diperbarui:** 2026-07-11

---

## Architecture

```
Browser ──► HTTPS ──► Nginx (443)
                         │
                    ┌────┴────┐
                    │         │
               /api/*     everything else
                    │         │
               Hono API   Astro (SSR)
               (:3000)     (:4321)
                    │         │
                    └────┬────┘
                         │
                    PostgreSQL
                    (:5432)
```

Semua service berjalan dalam 1 VPS via Docker Compose:

| Service  | Container           | Port Internal | Role                        |
| -------- | ------------------- | ------------- | --------------------------- |
| Nginx    | specialist-nginx    | 80 / 443      | Reverse proxy, SSL, caching |
| API      | specialist-api      | 3000          | Hono API server             |
| Web      | specialist-web      | 4321          | Astro SSR + static assets   |
| Postgres | specialist-postgres | 5432          | Database                    |

---

## Prerequisites

- **VPS** — minimal 2GB RAM, 2 vCPU, 40GB SSD
- **Domain** — pointing to VPS IP (A record)
- **Docker** 24+ & Docker Compose v2 terinstall
- **GitHub repository** — dengan Actions enabled
- **SSL certificates** — Let's Encrypt via Certbot

### Install Docker pada VPS

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Logout & login kembali agar group生效
```

---

## First-Time Setup di VPS

### 1. Clone Repository & Konfigurasi

```bash
# Buat user deploy (recommended)
sudo adduser deploy
sudo usermod -aG docker deploy
su - deploy

# Clone repo
git clone https://github.com/<org>/ahlipanggilan.git /home/deploy/ahlipanggilan
cd /home/deploy/ahlipanggilan

# Buat environment file
cp .env.prod.example .env.prod
nano .env.prod   # isi semua secrets
```

### 2. Setup SSL Certificate

```bash
# Jalankan Nginx dulu untuk ACME challenge
docker compose -f docker-compose.prod.yml up -d nginx

# Dapatkan sertifikat
sudo apt install certbot -y
sudo certbot certonly --webroot \
  -w /var/www/letsencrypt \
  -d ahlipanggilan.id \
  -d www.ahlipanggilan.id

# Verifikasi
sudo ls -la /etc/letsencrypt/live/ahlipanggilan.id/

# Set auto-renewal hook untuk reload Nginx
sudo sed -i 's/^#\(deploy-hook\)/\1/' /etc/letsencrypt/cli.ini || true
echo 'deploy-hook = docker compose -f /home/deploy/ahlipanggilan/docker-compose.prod.yml exec -T nginx nginx -s reload' \
  | sudo tee -a /etc/letsencrypt/cli.ini > /dev/null

# Test renewal
sudo certbot renew --dry-run
```

### 3. Start Full Stack

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Cek status
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

# Cek log
docker compose -f docker-compose.prod.yml logs -f
```

### 4. Verifikasi

```bash
# Health check API
curl -f https://ahlipanggilan.id/api/v1/health

# Akses halaman utama
curl -s -o /dev/null -w '%{http_code}' https://ahlipanggilan.id/
# → 200

# Cek SSL
curl -sI https://ahlipanggilan.id/ | grep -i 'strict-transport\|server'
```

### 5. Enable HSTS

Setelah HTTPS terverifikasi dengan baik:

1. Buka `infrastructure/docker/nginx/prod.conf`
2. Uncomment baris `add_header Strict-Transport-Security ...`
3. Restart Nginx:

```bash
docker compose -f docker-compose.prod.yml restart nginx
```

---

## CI/CD Pipeline

### Workflow

Setiap `push` ke branch `main`:

```
Push ke main
    │
    ▼
┌─────────────────────┐
│  CI (ci.yml)        │
│  • Format check     │
│  • Lint & Typecheck │
│  • Unit tests       │
│  • E2E tests        │
└─────────┬───────────┘
          │ (pass)
          ▼
┌─────────────────────┐
│  Deploy (deploy.yml)│
│  • Build API image  │
│  • Build Web image  │
│  • Push ke GHCR     │
│  • SSH ke VPS       │
│  • Pull & restart   │
└─────────────────────┘
```

### Image Registry

Docker images di-push ke **GitHub Container Registry (GHCR)**:

```
ghcr.io/<org>/api:latest
ghcr.io/<org>/api:<commit-sha>
ghcr.io/<org>/web:latest
ghcr.io/<org>/web:<commit-sha>
```

Tag `latest` dan `commit-sha` memudahkan rollback.

### Konfigurasi GitHub Secrets

| Secret        | Deskripsi                                             |
| ------------- | ----------------------------------------------------- |
| `VPS_HOST`    | IP address atau domain VPS                            |
| `VPS_USER`    | SSH username (e.g., `deploy`)                         |
| `VPS_SSH_KEY` | Private SSH key (deploy key)                          |
| `VPS_PATH`    | Path ke project di VPS (`/home/deploy/ahlipanggilan`) |

**Konfigurasi Variable** (Settings → Variables):

| Variable      | Value  |
| ------------- | ------ |
| `VPS_ENABLED` | `true` |

### Setup SSH Deploy Key

```bash
# Di VPS
ssh-keygen -t ed25519 -N "" -C "deploy@ahlipanggilan" -f ~/.ssh/deploy_key
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys

# Copy private key → GitHub Secret VPS_SSH_KEY
cat ~/.ssh/deploy_key
```

---

## Rollback

Apabila deploy bermasalah, rollback ke versi sebelumnya:

```bash
# Via SSH ke VPS
cd /home/deploy/ahlipanggilan

# List image tags yang tersedia
docker images --format 'table {{.Repository}}\t{{.Tag}}' | grep ahlipanggilan

# Rollback ke SHA tertentu
IMAGE_TAG=<previous-commit-sha> \
  docker compose -f docker-compose.prod.yml up -d

# Verifikasi
docker ps --format 'table {{.Names}}\t{{.Image}}'
```

---

## Environment Variables Reference

| Variable               | Wajib | Default            | Deskripsi                          |
| ---------------------- | ----- | ------------------ | ---------------------------------- |
| `DOMAIN`               | ✅    | `ahlipanggilan.id` | Domain utama                       |
| `SITE_URL`             | ✅    | `https://...`      | Public site URL                    |
| `PUBLIC_API_URL`       | ✅    | `https://.../api`  | Public API URL                     |
| `DATABASE_PASSWORD`    | ✅    | —                  | PostgreSQL password                |
| `JWT_SECRET`           | ✅    | —                  | `openssl rand -hex 32`             |
| `CORS_ORIGIN`          | ✅    | `https://...`      | Allowed CORS origins               |
| `REVALIDATION_TOKEN`   | ✅    | —                  | `openssl rand -hex 16`             |
| `SMTP_HOST`            | ✅    | —                  | SMTP server (email notifikasi)     |
| `SMTP_USER`            | ⬜    | —                  | SMTP username                      |
| `SMTP_PASS`            | ⬜    | —                  | SMTP password                      |
| `SMTP_FROM`            | ✅    | —                  | Sender email address               |
| `R2_ENDPOINT`          | ⬜    | —                  | Cloudflare R2 endpoint             |
| `R2_BUCKET`            | ⬜    | —                  | R2 bucket name                     |
| `R2_ACCESS_KEY`        | ⬜    | —                  | R2 access key                      |
| `R2_SECRET_KEY`        | ⬜    | —                  | R2 secret key                      |
| `WHATSAPP_API_KEY`     | ⬜    | —                  | Fonnte API key (WhatsApp)          |
| `CLOUDFLARE_API_TOKEN` | ⬜    | —                  | Cloudflare API token (cache purge) |
| `CLOUDFLARE_ZONE_ID`   | ⬜    | —                  | Cloudflare zone ID                 |
| `IMAGE_REGISTRY`       | ⬜    | `ghcr.io`          | Container registry                 |
| `IMAGE_OWNER`          | ⬜    | GitHub owner       | Registry owner                     |
| `IMAGE_TAG`            | ⬜    | `latest`           | Image tag for deploy               |

---

## Production Checklist

- [ ] **HTTPS** — SSL certificate valid, auto-renewal via Certbot cron
- [ ] **HSTS** — Aktifkan setelah HTTPS terverifikasi
- [ ] **Firewall** — Hanya buka port 22, 80, 443
- [ ] **Database backup** — Daily backup via `scripts/backup.sh`
- [ ] **Rate limiting** — Aktif di Nginx (30r/s general, 100r/s API)
- [ ] **Caching** — Nginx proxy cache (10s untuk API GET)
- [ ] **Compression** — Gzip aktif (level 6)
- [ ] **Security headers** — CSP, X-Frame-Options, dll via Hono/Astro
- [ ] **Media uploads** — Batas 50MB via Nginx `client_max_body_size`
- [ ] **Health checks** — Docker healthcheck di semua service
- [ ] **Log rotation** — Log dibatasi 10MB per file, max 3 file
- [ ] **Resource limits** — Memory limit per container (512M API/Web, 128M Nginx)
- [ ] **Monitoring** — Uptime Kuma / Grafana (future)
- [ ] **Secrets management** — `.env.prod` tidak di-commit, secrets via GitHub

---

## Backup & Restore

### Database Backup

```bash
# Backup harian (via scripts/backup.sh)
docker exec specialist-postgres pg_dump -U specialist specialist \
  | gzip > /backup/specialist-$(date +%Y%m%d).sql.gz

# Restore
gunzip -c /backup/specialist-20260711.sql.gz \
  | docker exec -i specialist-postgres psql -U specialist specialist
```

### Rollback Deployment

```bash
# Rollback ke image sebelumnya
IMAGE_TAG=<commit-sha> \
  docker compose -f docker-compose.prod.yml up -d
```

---

## Monitoring (Future)

- **Uptime Kuma** — HTTP monitoring untuk endpoint
- **Grafana + Prometheus** — Metrics aggregator
- **Docker logs** — `docker compose logs -f --tail=100`
- **Sentri** — Error tracking (opsional)

---

## Troubleshooting

| Problem                  | Cause                              | Solution                                        |
| ------------------------ | ---------------------------------- | ----------------------------------------------- |
| `502 Bad Gateway`        | Service belum siap                 | `docker compose logs -f nginx`                  |
| `CORS` error             | CORS_ORIGIN tidak sesuai           | Update `.env.prod` → restart API                |
| `CSRF_REJECTED`          | Origin tidak ada dalam daftar izin | Tambahkan domain ke CORS_ORIGIN                 |
| SSL certificate expiring | Certbot auto-renewal               | `sudo certbot renew --dry-run`                  |
| Disk penuh               | Docker images & logs               | `docker system prune -af --filter "until=720h"` |
