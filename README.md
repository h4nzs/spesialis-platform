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
| Frontend      | Astro 5, React 19, Tailwind CSS 4 |
| API Layer     | Hono (Business Logic)             |
| CMS Layer     | Directus (Content & Admin)        |
| Database      | PostgreSQL 18                     |
| Storage       | Cloudflare R2                     |
| Infrastruktur | Docker Compose, Nginx             |
| Monorepo      | Turborepo, pnpm, TypeScript       |

---

## Repository Structure

```
spesialis/
├── apps/
│   ├── web/          # Astro Frontend — Website & Dashboards
│   ├── api/          # Hono API — Business Logic Layer
│   └── cms/          # Directus — CMS & Admin Panel
├── packages/
│   ├── config/       # Shared config (ESLint, Prettier, TS, Tailwind)
│   ├── database/     # Schema, Migration, Seed
│   ├── shared/       # Shared utilities (pure TS)
│   ├── types/        # Shared TypeScript types
│   ├── ui/           # Shared UI components
│   └── validation/   # Zod validation schemas
├── docs/             # Dokumentasi lengkap
├── infrastructure/   # Docker, Nginx config
├── scripts/          # Dev, build, deploy, backup scripts
└── tools/            # Generator, migration, seed CLI
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

---

## Development

```bash
# Install
pnpm install

# Run semua apps
pnpm dev

# Build
pnpm build

# Lint
pnpm lint

# Typecheck
pnpm typecheck
```

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
