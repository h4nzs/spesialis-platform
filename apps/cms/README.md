# CMS

## Framework

Directus

---

## Purpose

- Admin Panel
- CMS
- Media Library
- SEO
- Content
- Permission

---

## Responsibilities

- Articles
- Services
- FAQ
- Media
- Users
- Settings

---

## Catatan Arsitektur

Directus pada project ini berfokus sebagai **CMS Layer**.

Business logic utama ditangani oleh `apps/api` (Hono).

Kolaborasi:

- Directus menyediakan data mentah (collections).
- `apps/api` memproses business logic, validasi, dan workflow.
- `apps/web` mengonsumsi API dari `apps/api`.

---

## Forbidden

- Business Logic kompleks
- Payment Workflow
- Assignment Workflow

---

## Referensi

Dokumentasi Directus: [docs/directus/](../../docs/directus/)

Collections: [docs/directus/collections.md](../../docs/directus/collections.md)
