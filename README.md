# Specialist Platform

Modern Professional On-Demand Service Platform.

---

## Overview

Specialist Platform adalah platform layanan jasa profesional berbasis Headless Architecture yang menghubungkan Customer, Partner, Corporate, dan Admin dalam satu ekosistem.

Platform dirancang untuk scalable, SEO-first, dan production-ready.

---

## Technology Stack

| Layer         | Teknologi                         |
| ------------- | --------------------------------- |
| Frontend      | Astro 7, React 19, Tailwind CSS 4 |
| API Layer     | Hono (Business Logic)             |
| Database      | PostgreSQL 18, Drizzle ORM        |
| Storage       | Cloudflare R2                     |
| Infrastruktur | Docker Compose, Nginx             |
| Monorepo      | Turborepo, pnpm, TypeScript       |

---

## Repository Structure

```
ahlipanggilan/
├── apps/
│   ├── web/          # Astro Frontend — Website & Dashboards (62 pages)
│   └── api/          # Hono API — Business Logic Layer (67 route files)
├── packages/
│   ├── cli/          # CLI tools (db, cms, generator)
│   ├── config/       # Shared config (ESLint, Prettier, TS, Tailwind)
│   ├── database/     # Schema (34 files), Migration (9 migrations), Seed
│   ├── shared/       # Shared utilities (API client, constants, formatters)
│   ├── types/        # Shared TypeScript types
│   ├── ui/           # Shared UI components (106+ React components)
│   └── validation/   # Zod validation schemas (50+ files)
├── docs/             # Dokumentasi lengkap (product, architecture, database, dll)
├── infrastructure/   # Docker, Nginx config
├── scripts/          # Dev, build, deploy, backup scripts
├── tools/            # Generator, migration, seed CLI
└── .ai/              # AI Agent konfigurasi & prompts
```

---

## Documentation

Semua dokumentasi berada pada folder `docs/`.

**Mulai membaca:**

| Dokumen              | Path                                     |
| -------------------- | ---------------------------------------- |
| Product Requirements | `docs/product/product-requirements.md`   |
| System Architecture  | `docs/architecture/architecture.md`      |
| API Specification    | `docs/architecture/api-specification.md` |
| Database Design      | `docs/architecture/database-design.md`   |
| Business Rules       | `docs/product/business-rules.md`         |
| Glossary             | `docs/product/glossary.md`               |
| CMS Functional Spec  | `docs/functional-spec/cms.md`            |
| CMS API              | `docs/api/cms-api.md`                    |
| Admin API            | `docs/api/admin-api.md`                  |

---

## Quick Start

### 1. Prerequisites

- Node.js >= 24
- pnpm 11 (`npm i -g pnpm`)
- Docker (for PostgreSQL)

### 2. One-command start

```bash
# Minimal (DB + migrate + dev servers)
pnpm start

# With demo data + email dev
pnpm start:all
```

`pnpm start` does:

- Creates `.env` from `.env.example` if missing
- Starts PostgreSQL via Docker
- Waits for the database to be ready
- Runs migrations
- Starts API (port 3000) + Web (port 4321) in watch mode

`pnpm start:all` adds:

- Seeds demo data (9 users, 14 services, 10 orders)
- Starts Mailpit for email development (`http://localhost:8025`)

For subsequent runs without re-seeding:

```bash
pnpm start
```

### 3. Manual step-by-step

```bash
# Install dependencies
pnpm install

cp .env.example .env

# Start database
docker compose up -d postgres

# Run migrations
pnpm --filter @ahlipanggilan/database db:migrate

# Seed demo data
pnpm --filter @ahlipanggilan/api db:seed

# Seed CMS pages (4 system pages: tentang-kami, syarat-ketentuan, kebijakan-privasi, kontak)
pnpm --filter @ahlipanggilan/database db:seed-pages

# Start dev servers
pnpm dev
```

Seeded accounts (password `password123`):

| Role        | Email                       |
| ----------- | --------------------------- |
| Super Admin | admin@ahlipanggilan.id      |
| Admin       | admin2@ahlipanggilan.id     |
| Dispatcher  | dispatcher@ahlipanggilan.id |
| Finance     | finance@ahlipanggilan.id    |
| Content Mgr | content@ahlipanggilan.id    |
| Partner     | partner@ahlipanggilan.id    |
| Partner     | partner2@ahlipanggilan.id   |
| Customer    | customer@ahlipanggilan.id   |
| Customer    | customer2@ahlipanggilan.id  |
| Corporate   | corporate@ahlipanggilan.id  |

### 4. Start dev servers

```bash
pnpm dev
```

- Frontend: `http://localhost:4321`
- API: `http://localhost:3000`
- Health check: `http://localhost:3000/api/v1/health`

---

## Commands

| Perintah          | Efek                                     |
| ----------------- | ---------------------------------------- |
| `pnpm start`      | 🚀 Dev start (DB + migrate + dev server) |
| `pnpm start:seed` | Start + seed demo data                   |
| `pnpm start:all`  | Start + seed + Mailpit                   |
| `pnpm start:prod` | Build + start production servers         |
| `pnpm reset`      | Remove all Docker containers & volumes   |
| `pnpm status`     | Show running services                    |
| `pnpm dev`        | Run API + Web in watch mode              |
| `pnpm build`      | Build all apps                           |
| `pnpm lint`       | ESLint check                             |
| `pnpm typecheck`  | TypeScript type check                    |
| `pnpm test`       | Run Vitest tests                         |
| `pnpm format`     | Prettier format                          |
| `pnpm cli`        | Unified CLI (`pnpm cli help`)            |

### Database Commands

```bash
pnpm --filter @ahlipanggilan/database db:migrate           # Apply migrations
pnpm --filter @ahlipanggilan/database db:generate           # Generate migration from schema
pnpm --filter @ahlipanggilan/database db:push               # Push schema langsung ke DB
pnpm --filter @ahlipanggilan/database db:seed-pages         # Seed 4 CMS system pages
```

### Unified CLI (`pnpm cli`)

```bash
pnpm cli db:generate              # Generate migration from schema
pnpm cli db:migrate               # Apply pending migrations
pnpm cli db:push                  # Push schema langsung ke DB
pnpm cli db:seed                  # Seed demo data
pnpm cli generate resource <name> # Scaffold route + test baru
pnpm cli start                    # Start full dev environment
pnpm cli help                     # Show all commands
```

---

## Project Status

| Feature                     | Status |
| --------------------------- | ------ |
| Guest Booking               | ✅     |
| Customer Dashboard          | ✅     |
| Partner Registration        | ✅     |
| Partner Verification        | ✅     |
| Corporate Inquiry           | ✅     |
| Corporate Dashboard         | ✅     |
| Admin Dashboard             | ✅     |
| CMS Articles                | ✅     |
| CMS Pages (4 system)        | ✅     |
| CMS FAQ                     | ✅     |
| CMS Services                | ✅     |
| SEO (Metadata, JSON-LD, OG) | ✅     |
| SEO Redirect Management     | ✅     |
| SEO 404 Monitor             | ✅     |
| SEO IndexNow                | ✅     |
| SEO Schema Builder          | ✅     |
| SEO RoleManager             | ✅     |
| SEO Sitemap Settings        | ✅     |
| Payment (manual)            | ✅     |
| Assignment (manual)         | ✅     |
| Audit Log                   | ✅     |
| Media Upload                | ✅     |
| E2E Tests (~140+)           | ✅     |

---

## Engineering Principles

- Clean Architecture
- SOLID
- DRY
- KISS
- Security First
- Performance First
- SEO First
- Documentation First

---

## How to Deploy

First time on your VPS:

```bash
# 1. Clone and configure
git clone <repo> && cd ahlipanggilan
cp .env.prod.example .env.prod && nano .env.prod   # fill in secrets

# 2. Get SSL certificates
docker compose -f docker-compose.prod.yml up -d nginx   # starts HTTP-only for ACME
sudo certbot certonly --webroot -w /var/www/letsencrypt -d ahlipanggilan.id

# 3. Start the full stack
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 4. Once HTTPS works, uncomment the HSTS line in prod.conf
# Then: docker compose restart nginx
```

---

## Prerequisites

Before it'll run, you need to configure these in GitHub:
Secrets (Settings → Secrets and variables → Actions → Secrets):
┌─────────────┬────────────────────────┐
│ Name │ Value │
├─────────────┼────────────────────────┤
│ VPS_HOST │ VPS IP or domain │
│ VPS_USER │ SSH username │
│ VPS_SSH_KEY │ Private SSH key │
│ VPS_PATH │ Path to project on VPS │
└─────────────┴────────────────────────┘
Variable (Settings → Secrets and variables → Actions → Variables):
┌─────────────┬───────┐
│ Name │ Value │
├─────────────┼───────┤
│ VPS_ENABLED │ true │
└─────────────┴───────┘
And on the VPS, you'll need:
// bash
git clone <repo> /home/deploy/ahlipanggilan
cp .env.prod.example .env.prod # fill in your secrets

# Get SSL certs (as described earlier)

## License

Private Repository.
