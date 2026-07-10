# System Architecture

Project: Specialist Platform

Version: 1.0

Status: Locked

---

# 1. Overview

Specialist Platform menggunakan arsitektur modern berbasis Headless Platform.

Frontend, Backend, Database, dan Storage dipisahkan agar mudah dikembangkan.

Architecture Goals:

- Scalable
- Secure
- Maintainable
- SEO Friendly
- AI Friendly
- Cloud Ready

---

# 2. High Level Architecture

                           Internet
                                │
                                ▼
                          Cloudflare CDN
                                │
                                ▼
                             Nginx
                                │
                                ▼
                          Astro (apps/web)
                              │
                              ▼
                       Hono API (apps/api)
                           │        │
                           ▼        ▼
                    PostgreSQL  Cloudflare R2

---

# 3. Technology Stack

Frontend

- Astro 7
- React 19
- Tailwind CSS 4

Backend

- Hono (API Layer — Business Logic)

Database

- PostgreSQL 18

Storage

- Cloudflare R2

Infrastructure

- Docker Compose
- Nginx

Monorepo

- Turborepo
- pnpm

---

# 4. Layer Architecture

Presentation Layer

↓

Application Layer

↓

Business Layer

↓

Persistence Layer

↓

Infrastructure Layer

Business Logic hanya berada pada Backend.

Frontend tidak boleh melakukan Business Calculation.

---

# 5. Frontend

Frontend menggunakan Astro.

Interactive Component menggunakan React Islands.

Prioritas:

1. Static HTML
2. Astro Component
3. React Island

---

# 6. Backend

Backend terdiri dari satu lapisan:

## 6.1 API Layer (apps/api)

Framework: Hono

Bertanggung jawab atas seluruh Business Logic, Content Management, dan API.

Fungsi:

- Authentication & Authorization
- Booking Workflow
- Assignment & Dispatch
- Payment
- Review & Complaint
- Notification
- Validation & Audit Log
- CMS (Articles, FAQ, Services)
- Media Library
- Settings & SEO

## 6.2 SEO Management

SEO dikelola melalui beberapa komponen yang saling terintegrasi:

### Permission System

- 8 permission keys dengan granular role assignment (admin/super_admin/content_manager)
- Middleware `requirePermission()` dengan 30s cache, fallback ke hardcoded defaults
- Configurable via RoleManager UI → disimpan di `system_settings` (category: `seo_permissions`)
- Route protection di semua SEO-related endpoints

### Metadata Management

- CRUD endpoint di `/api/v1/seo` — meta title, description, canonical, robots, OG/Twitter
- Schema JSON-LD per entity (disimpan di kolom `schema_json`)
- SEOEditor UI shared antara ArticleEditor & PageEditor
- Entity types: Service, Article, ServiceCategory, CmsPage

### Sitemap & IndexNow

- Dynamic sitemap dengan priority/changefreq configurable
- 5 page types: static, services, articles, blog listing, CMS pages
- IndexNow protocol support: auto-generate API key, auto-ping on publish
- Log monitoring di dashboard

### Redirect Management

- CRUD API dengan duplicate source path detection
- Middleware `redirectCheck` auto-redirect di 404 handler
- Status code 301/302, active/inactive toggle

### 404 Monitor

- Auto-logging setiap 404 ke tabel `page_errors`
- Stats: total errors, top paths, last 24h
- Admin dapat menghapus individual entries atau clear all

## 6.3 Alur Data

Astro (apps/web) → Hono (apps/api) → PostgreSQL

---

# 7. CMS Management

CMS dikelola sepenuhnya melalui Hono API (`apps/api`), bukan melalui sistem CMS terpisah.

### Managed Content melalui Hono API

- **Articles** — Blog content via Hono API
- **FAQ** — FAQ management via Hono API
- **CMS Pages** — 4 system pages (tentang-kami, syarat-ketentuan, kebijakan-privasi, kontak) + custom pages
  - Admin mengelola via PageEditor (full page editor)
  - Publik di-render dari CMS API, dengan fallback ke hardcoded HTML
- **Services & Categories** — Service management via Hono API
- **Media** — File upload via Hono API

### Hybrid Page Rendering

CMS Pages menggunakan pola **hybrid**:

```
Halaman publik Astro (.astro)
    ↓
Coba fetch dari CMS API: /api/v1/cms/pages/{slug}
    ↓
Jika CMS punya konten → render konten CMS ✅
Jika tidak → fallback ke HTML hardcoded di file .astro ✅
```

Keuntungan:

- **Performa**: Fallback langsung render tanpa fetch
- **Fleksibel**: Admin bisa override konten kapan saja
- **Zero risk**: Jika API down, halaman tetap tampil normal

---

# 8. Database

Single PostgreSQL Database.

Semua tabel bisnis dikelola melalui Drizzle ORM migration di Hono API.

---

# 9. Authentication

JWT Authentication.

Role Based Access Control.

Role:

- customer
- partner
- corporate
- dispatcher
- finance
- content_manager
- admin
- super_admin

---

# 9. File Storage

Development

Filesystem.

Production

Cloudflare R2.

Semua Media menggunakan URL.

Database hanya menyimpan Metadata.

---

# 10. API

REST API.

GraphQL tersedia.

Versioning.

Example.

/api/v1

---

# 11. Deployment

Docker Compose.

Service:

- nginx
- web (Astro)
- api (Hono)
- postgres
- redis (Cache — Future)
- mailpit (Email Development)

---

# 12. Security

HTTPS

JWT

Argon2id

Rate Limiter

CORS

Helmet

Audit Log

RBAC

Soft Delete

---

# 13. Scalability

Horizontal Scaling.

Astro dapat dipisahkan.

Database dapat dipindahkan ke Managed PostgreSQL.

Storage menggunakan Object Storage.

---

# 14. Future Architecture

Apps.

apps/

- web
- api
- admin
- mobile

Services.

- notification
- ai-dispatcher
- payment

---

# 15. Engineering Principles

- SOLID
- DRY
- KISS
- Clean Architecture
- Separation of Concerns

---

# 16. Source of Truth

Dokumen ini menjadi acuan utama seluruh keputusan teknis.
