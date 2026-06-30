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
                     ┌──────────┴──────────┐
                     ▼                     ▼
               Astro (apps/web)     Directus (apps/cms)
                     │
                     ▼
              Hono API (apps/api)
                     │
                     ▼
               ┌─────┴─────┐
               ▼           ▼
          PostgreSQL   Cloudflare R2

---

# 3. Technology Stack

Frontend

- Astro 7
- React 19
- Tailwind CSS 4

Backend

- Hono (API Layer — Business Logic)
- Directus (CMS Layer — Content & Admin)

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

Backend terdiri dari dua lapisan:

## 6.1 API Layer (apps/api)

Framework: Hono

Bertanggung jawab atas seluruh Business Logic.

Fungsi:

- Authentication & Authorization
- Booking Workflow
- Assignment & Dispatch
- Payment
- Review & Complaint
- Notification
- Validation & Audit Log

## 6.2 CMS Layer (apps/cms)

Framework: Directus

Bertanggung jawab atas Content Management dan Admin Panel.

Fungsi:

- CMS (Articles, FAQ, Services)
- Media Library
- RBAC dasar
- REST / GraphQL untuk kebutuhan konten
- Settings & SEO

## 6.3 Alur Data

Astro (apps/web) → Hono (apps/api) → PostgreSQL / Directus

Astro (apps/web) → Directus (apps/cms) — untuk konten publik (SSG)

Directus Admin Panel → Directus langsung — untuk manajemen konten

---

# 7. Database

Single PostgreSQL Database dengan pemisahan schema:

## 7.1 Schema Boundary

| Schema     | Owner                  | Isi                                                          | Akses Directus           | Akses Hono |
| ---------- | ---------------------- | ------------------------------------------------------------ | ------------------------ | ---------- |
| `public`   | Hono (migration)       | Business entities: users, orders, payments, assignments, dll | Read-only via permission | Read/Write |
| `directus` | Directus (auto)        | Directus internal tables                                     | Read/Write (managed)     | None       |
| `cms`      | Directus (auto/manual) | Content: articles, faq, services metadata, media             | Read/Write (managed)     | Read-only  |

## 7.2 Aturan Schema

- **Hono** mengelola `public` schema via Drizzle ORM migration.
- **Directus** mengelola `directus` dan `cms` schema via UI.
- Tidak ada dual-write ke tabel yang sama.
- Foreign key tidak boleh lintas schema jika menghubungkan tabel bisnis ke tabel Directus. Gunakan logical reference (UUID stored as VARCHAR) bila diperlukan.

---

# 8. Authentication

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
- cms (Directus)
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

Directus dapat dipisahkan.

Database dapat dipindahkan ke Managed PostgreSQL.

Storage menggunakan Object Storage.

---

# 14. Future Architecture

Apps.

apps/

- web
- api
- cms
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
