# docs/adr/0001-use-directus.md

# ADR-0001

# Use Directus as Backend Platform (CMS Layer)

Status: Accepted (Evolved)

Date: 2026-06-29

---

## Context

Platform membutuhkan:

- CMS
- Authentication
- RBAC
- REST API
- GraphQL
- Media Library
- Workflow
- Dynamic Schema

Tanpa membangun backend dari nol.

---

## Decision

Directus digunakan sebagai **CMS Layer**.

Business logic dipisahkan ke **API Layer** menggunakan Hono (`apps/api`).

Alasan evolusi:

- Business Logic semakin kompleks (Booking, Assignment, Payment).
- Testing lebih mudah dengan Hono.
- Directus Extensions terbatas untuk logic kompleks.
- Arsitektur lebih siap menuju microservices.

---

## Reason

- Open Source
- PostgreSQL Native
- REST API & GraphQL
- RBAC dasar
- Dashboard Admin siap pakai
- Media Library
- Flow Automation

---

## Consequences

Positif

- Admin Panel siap pakai
- API otomatis untuk CMS
- Media Library terkelola
- Permission dasar tersedia

Negatif

- Business Logic tidak boleh di Directus
- Perlu maintenance dua service (api + cms)
- Integrasi antara Hono dan Directus harus dijaga

---

## Schema Separation Strategy

Directus dan Hono berbagi satu PostgreSQL, namun dengan pemisahan schema yang ketat:

### `directus` schema (milik Directus)

- `directus_*` tables — Directus internal
- `cms.*` tables — content collections (articles, faq, services metadata)
- Dikelola oleh Directus via UI
- Hono hanya akses **read-only** untuk SSG

### `public` schema (milik Hono)

- `public.*` tables — business entities (users, orders, payments, assignments, dll)
- Dikelola oleh Hono via migration (Drizzle ORM)
- Directus tidak boleh menulis ke tabel ini
- Directus dapat melakukan read via permission mapping jika diperlukan

### Aturan ketat:

- Hono tidak migrasi tabel Directus (`directus_*` / `cms.*`)
- Directus tidak migrasi tabel bisnis (`public.*`)
- Tidak ada dual-write ke tabel yang sama
- Foreign key dari Directus ke tabel bisnis harus via view, bukan direct table reference

---

## Alternatives

- Strapi
- Laravel
- NestJS
- Django

Dipilih Directus sebagai CMS Layer karena paling sesuai untuk Content Management.

---

## Status

LOCKED

---

## Catatan Evolusi

Arsitektur awal menggunakan Directus sebagai backend tunggal.

Seiring perkembangan, business logic dipisah ke `apps/api` (Hono) untuk maintainability dan testability.

Directus tetap menjadi sumber data (source of truth) untuk konten dan media.
