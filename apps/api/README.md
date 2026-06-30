# API Application

## Framework

Hono

---

## Purpose

Business Logic Layer.

API middleware antara Astro (`apps/web`) dengan Directus (`apps/cms`).

---

## Latar Belakang

Berdasarkan [ADR-0001 (Use Directus)](../../docs/adr/0001-use-directus.md), backend awal menggunakan Directus.

Seiring berkembangnya platform, business logic kompleks dipisahkan ke layer API sendiri menggunakan **Hono** agar:

- Business Logic tidak terikat Directus Extensions.
- Testing lebih mudah.
- Dapat berkembang menjadi microservices di masa depan.

Directus tetap digunakan untuk:

- CMS & Admin Panel
- Media Library
- RBAC dasar
- REST/GraphQL API untuk kebutuhan CMS

---

## Responsibilities

- Authentication
- Booking
- Assignment
- Payment
- Review
- Complaint
- Notification
- Authorization
- Validation
- Audit Log

---

## Forbidden

- Rendering HTML
- CMS
- Frontend

---

## Folder

routes/

controllers/

services/

repositories/

middleware/

validators/

utils/

---

## Referensi

API Spec: [docs/api/](../../docs/api/)

API Architecture: [docs/architecture/api-specification.md](../../docs/architecture/api-specification.md)
