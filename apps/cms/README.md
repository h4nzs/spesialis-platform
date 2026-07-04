# CMS

## Framework

Directus 11.6

---

## Status: ✅ Configured

Directus CMS sudah berjalan dan dikonfigurasi.

| Item                 | Status                                        |
| -------------------- | --------------------------------------------- |
| Collections CMS      | ✅ 4 collections                              |
| Business Collections | ✅ 26 collections hidden                      |
| Content Manager Role | ✅ Created + linked to policy                 |
| Permissions          | ✅ 24 permissions (CRUD 6 collections)        |
| CMS Admin            | ✅ Running on http://localhost:8055           |
| Nginx Reverse Proxy  | ⚠️ `/cms/` routing tidak aktif (host network) |

---

## Access

```bash
# Admin Dashboard
open http://localhost:8055/admin
# Email: admin@example.com
# Password: admin123
```

---

## Responsibilities

- Articles (`cms_articles`)
- FAQ (`cms_faq`)
- Pages (`cms_pages`)
- Homepage Sections (`cms_homepage_sections`)
- Media Library (`directus_files`)
- Content Manager Users

---

## Catatan Arsitektur

Directus pada project ini berfokus sebagai **CMS Layer**.

Business logic utama ditangani oleh `apps/api` (Hono).

Kolaborasi:

- Directus menyediakan data mentah (collections).
- `apps/api` memproses business logic, validasi, dan workflow.
- `apps/web` mengonsumsi API dari `apps/api`.

### Schema Separation

- **directus schema** — Directus internal tables + `cms_*` collections
- **public schema** — Business entities (users, orders, payments, etc.)
- Directus tidak boleh write ke public schema tables
- Hono API tidak boleh write ke directus schema tables

---

## Forbidden

- Business Logic kompleks
- Payment Workflow
- Assignment Workflow
- Modifikasi business entities dari Directus admin panel

---

## Setup

Lihat [SETUP.md](./SETUP.md) untuk detail konfigurasi.

Run:

```bash
docker compose up cms -d
pnpm cms:setup
```

---

## Extensions (Direncanakan)

- Booking Number Generator
- WhatsApp Gateway (via API)
- Assignment Helper
- SEO Revalidation (trigger Astro revalidate)
- Dashboard Statistics

Ekstensi diletakkan di `apps/cms/src/extensions/`.

---

## Referensi

- Dokumentasi Directus: [docs/directus/](../../docs/directus/)
- Collections: [docs/directus/collections.md](../../docs/directus/collections.md)
- Setup Detail: [SETUP.md](./SETUP.md)
