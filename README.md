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
spesialis/
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
pnpm --filter @specialist/database db:migrate

# Seed demo data
pnpm --filter @specialist/api db:seed

# Seed CMS pages (4 system pages: tentang-kami, syarat-ketentuan, kebijakan-privasi, kontak)
pnpm --filter @specialist/database db:seed-pages

# Start dev servers
pnpm dev
```

Seeded accounts (password `password123`):

| Role        | Email                   |
| ----------- | ----------------------- |
| Super Admin | admin@spesialis.id      |
| Admin       | admin2@spesialis.id     |
| Dispatcher  | dispatcher@spesialis.id |
| Finance     | finance@spesialis.id    |
| Content Mgr | content@spesialis.id    |
| Partner     | partner@spesialis.id    |
| Partner     | partner2@spesialis.id   |
| Customer    | customer@spesialis.id   |
| Customer    | customer2@spesialis.id  |
| Corporate   | corporate@spesialis.id  |

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
pnpm --filter @specialist/database db:migrate           # Apply migrations
pnpm --filter @specialist/database db:generate           # Generate migration from schema
pnpm --filter @specialist/database db:push               # Push schema langsung ke DB
pnpm --filter @specialist/database db:seed-pages         # Seed 4 CMS system pages
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

## License

Private Repository.
