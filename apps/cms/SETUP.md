# Directus CMS Setup

## Status: ✅ Configured

Directus CMS telah dikonfigurasi dengan:

- 4 CMS collections (`cms_articles`, `cms_faq`, `cms_pages`, `cms_homepage_sections`)
- 26 business entity collections di-hidden (tidak muncul di sidebar)
- 2 roles: **Administrator** (full access) dan **Content Manager** (CMS only)
- Policy **CMS Full Access** dengan 24 permissions (CRUD pada 6 collections)
- Content Manager role sudah ter-link ke policy **CMS Full Access**

## Prerequisites

- Docker & Docker Compose
- PostgreSQL running (`docker compose up postgres -d`)

## Quick Start

```bash
# Start CMS (if not running)
docker compose up cms -d

# Wait for CMS to be ready, then run setup
pnpm cms:setup
```

## Access

| URL                          | Keterangan                 |
| ---------------------------- | -------------------------- |
| http://localhost:8055/admin  | Admin Dashboard            |
| http://localhost:8055/server | Server Info / Health Check |

### Login

| Role            | Email              | Password       |
| --------------- | ------------------ | -------------- |
| Administrator   | admin@example.com  | admin123       |
| Content Manager | (create via admin) | (set manually) |

Static Token: `specialist-setup-token`

## Collections

### Visible (CMS — dikelola Directus)

| Collection              | Icon            | Notes                          |
| ----------------------- | --------------- | ------------------------------ |
| `cms_articles`          | `article`       | Blog articles and content      |
| `cms_faq`               | `quiz`          | Frequently Asked Questions     |
| `cms_pages`             | `web`           | Landing pages & static content |
| `cms_homepage_sections` | `view_carousel` | Homepage sections              |

### Hidden (Business Entities — dikelola Hono API)

26 collections di-hidden dari sidebar Directus, termasuk: `users`, `orders`, `payments`, `services`, `customer_profiles`, `partner_profiles`, dll.

**Peringatan:** Jangan memberikan akses CRUD ke hidden collections. Business entities hanya boleh dimodifikasi melalui Hono API.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Directus CMS (port 8055)                    │
│  • cms_* collections (CRUD via admin panel)  │
│  • Media library (files, images)             │
│  • Content Manager users                     │
│  • Public API (read-only) untuk website      │
├─────────────────────────────────────────────┤
│  Hono API (port 3000)                        │
│  • Business logic, validasi, workflow        │
│  • CRUD business entities (orders, users...) │
│  • JWT auth, RBAC, state machines            │
├─────────────────────────────────────────────┤
│  Single PostgreSQL (public + directus schema)│
└─────────────────────────────────────────────┘
```

- **Directus schema** → Directus internal tables + `cms_*` collections
- **Public schema** → Business entities (dikelola Hono API, readonly di Directus)
- Hono API membaca data CMS via Directus REST API (read-only)
- Frontend tidak pernah langsung query Directus

## Roles & Permissions

### Administrator

- Full system access (admin_access = true)
- Dapat mengelola semua collections, users, roles, settings

### Content Manager

- App access: true
- Policy: **CMS Full Access**
- CRUD pada: `cms_articles`, `cms_faq`, `cms_pages`, `cms_homepage_sections`, `directus_files`, `directus_folders`
- Tidak bisa mengakses business entities

## Setup Script

`scripts/directus-setup.ts` — idempotent, bisa dijalankan berulang kali.

Yang dilakukan script:

1. Authenticate ke Directus API (admin@example.com / admin123)
2. Buat CMS collections jika belum ada
3. Update metadata collections (icon, note, visibility)
4. Hide business entity collections
5. Cleanup stale policies
6. Ensure Content Manager role + CMS Full Access policy
7. Grant CRUD permissions

## Flows (Pengganti Extensions)

⚠️ **Directus 11.6 Docker tidak mendukung file system API extensions (hooks/endpoints).**

Sebagai gantinya, gunakan **Directus Flows** yang merupakan fitur bawaan Directus.

### SEO Revalidation Flow

Trigger revalidasi Astro saat CMS content berubah:

- **Trigger:** Event — `items.create`, `items.update`, `items.delete`
- **Collections:** `cms_articles`, `cms_faq`, `cms_pages`, `cms_homepage_sections`
- **Action:** Webhook → `POST http://api:3000/api/v1/cms/revalidate`

### Setup Flows

```bash
pnpm cms:flows-setup
```

## Storage

- **Development:** Local filesystem (uploaded files di volume Docker)
- **Production:** Cloudflare R2 (konfigurasi via `.env`)
- Folder structure: `articles/`, `partners/`, `services/`, `orders/`, `ktp/`, `avatar/`, `company/`, `seo/`

## Troubleshooting

### CMS tidak bisa diakses

```bash
docker compose logs cms
docker compose restart cms
```

### Setup script gagal

```bash
# Pastikan CMS sudah siap
curl http://localhost:8055/server/info

# Jalankan ulang
pnpm cms:setup
```

### Ingin reset CMS

```bash
# Hapus volume CMS (data collections akan hilang)
docker compose down -v
# Start ulang
docker compose up cms -d
# Setup ulang
pnpm cms:setup
```
